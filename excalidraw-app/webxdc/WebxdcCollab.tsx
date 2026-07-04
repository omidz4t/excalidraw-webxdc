
import {
  collabAPIAtom,
  isCollaboratingAtom,
  activeRoomLinkAtom,
} from "../collab/atoms";
import { appJotaiStore } from "../app-jotai";
import {
  CaptureUpdateAction,
  getVisibleSceneBounds,
  zoomToFitBounds,
} from "@excalidraw/excalidraw";
import { throttleRAF, toBrandedType } from "@excalidraw/common";
import throttle from "lodash.throttle";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { applyUpdateV2, mergeUpdatesV2 } from "yjs";
import WebxdcProvider from "./webxdc-provider";

import type {
  ExcalidrawImperativeAPI,
  Gesture,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/element/types";
import type { CollabAPI } from "../collab/types";
import type { SocketUpdateDataSource } from "../collab/socket-types";

import {
  PERSIST_FLUSH_MS,
  PERSIST_SCENE_SYNC_MS,
  REALTIME_DOC_MS,
} from "./constants";
import {
  collabSyncStatusAtom,
  createWebxdcSyncBridge,
  patchCollabSyncStatus,
  SendUpdateRejectedError,
} from "./collab-status";
import { webxdcPointerUpdateRef } from "./pointer-ref";
import { WebxdcRealtimeChannel } from "./webxdc-realtime-channel";

import { seedYdocFromBootstrapIfEmpty } from "./bootstrap-scene";
import { withFollowViewportSync } from "./follow-viewport-sync-ref";
import { pendingFollowRequestAtom } from "./follow-request";
import { announceJoinViewport } from "./join-viewport";
import { mergeLocalSceneIntoYdocBeforeBinding } from "./merge-local-scene";
import { webxdcRealtimeRef } from "./realtime-ref";
import { getWebxdc } from "./get-webxdc";
import { webxdcPersistRef } from "./persist-ref";
import { autosaveToChatAtom } from "./webxdc-settings";
import { WEBXDC_VERSION } from "./version";
import { pickUserColor } from "./user-colors";
import { ExcalidrawBinding } from "./y-excalidraw";

type PointerPayload = SocketUpdateDataSource["MOUSE_LOCATION"]["payload"];

const INIT_WAIT_MS = 2_000;
const REALTIME_YJS_ORIGIN = "webxdc-realtime-doc";
const DEFAULT_REALTIME_MAX_BYTES = 128_000;

const readyHint = (hasRealtime: boolean, autosaveToChat: boolean) => {
  if (hasRealtime && autosaveToChat) {
    return "Live drawing + cursors over P2P · auto-saving to chat";
  }
  if (hasRealtime) {
    return "Live drawing over P2P · Ctrl+S saves to chat";
  }
  if (autosaveToChat) {
    return "Drawing syncs to chat automatically (~few seconds)";
  }
  return "Ctrl+S saves to chat · enable realtime in Delta Chat 1.48+";
};

interface WebxdcCollabProps {
  excalidrawAPI: ExcalidrawImperativeAPI;
}

const waitForInitialYjsState = (
  ydoc: Y.Doc,
  yElements: Y.Array<Y.Map<unknown>>,
) =>
  new Promise<void>((resolve) => {
    if (yElements.length > 0) {
      resolve();
      return;
    }

    const deadline = window.setTimeout(resolve, INIT_WAIT_MS);

    const onRemoteUpdate = (_update: Uint8Array, origin: unknown) => {
      if (origin === ydoc.clientID || origin === REALTIME_YJS_ORIGIN) {
        window.clearTimeout(deadline);
        ydoc.off("updateV2", onRemoteUpdate);
        resolve();
      }
    };

    ydoc.on("updateV2", onRemoteUpdate);
  });

const WebxdcCollab = ({ excalidrawAPI }: WebxdcCollabProps) => {
  const excalidrawAPIRef = useRef(excalidrawAPI);
  excalidrawAPIRef.current = excalidrawAPI;

  const autosaveToChat = useAtomValue(autosaveToChatAtom);
  const autosaveToChatRef = useRef(autosaveToChat);
  const bindingRef = useRef<ExcalidrawBinding | null>(null);
  const providerRef = useRef<InstanceType<typeof WebxdcProvider> | null>(null);
  const realtimeRef = useRef<WebxdcRealtimeChannel | null>(null);
  const persistIntervalRef = useRef(PERSIST_SCENE_SYNC_MS);

  useEffect(() => {
    autosaveToChatRef.current = autosaveToChat;
  }, [autosaveToChat]);

  useEffect(() => {
    const provider = providerRef.current;
    if (!provider) {
      return;
    }

    clearInterval(provider.autosaveLoop);
    if (autosaveToChat) {
      provider.autosaveLoop = setInterval(
        () => provider.syncToChatPeers(),
        persistIntervalRef.current,
      );
    }

    const status = appJotaiStore.get(collabSyncStatusAtom);
    if (status.initPhase !== "ready") {
      return;
    }
    patchCollabSyncStatus({
      hint: readyHint(status.realtimeJoined, autosaveToChat),
    });
  }, [autosaveToChat]);

  useEffect(() => {
    const api = excalidrawAPIRef.current;
    if (!api) {
      return;
    }

    const hostWebxdc = getWebxdc();
    if (!hostWebxdc) {
      patchCollabSyncStatus({
        initPhase: "error",
        hint: "window.webxdc missing after boot — reinstall the latest .xdc in Delta Chat",
        lastError:
          "Delete the old chat attachment and attach a fresh excalidraw.xdc.",
      });
      return;
    }

    let cancelled = false;

    const selfAddr = hostWebxdc.selfAddr;
    const selfName = hostWebxdc.selfName || hostWebxdc.selfAddr;
    const userColor = pickUserColor(selfAddr);
    const selfUser = {
      name: selfName,
      color: userColor.color,
      colorLight: userColor.light,
    };

    const setStatus = patchCollabSyncStatus;

    let sendUpdateSent = 0;
    let sendUpdateReceived = 0;
    let realtimeDocSent = 0;
    let realtimeDocReceived = 0;
    let realtimeCursorSent = 0;
    let realtimeCursorReceived = 0;

    const realtimeMaxBytes =
      hostWebxdc.sendUpdateMaxSize ?? DEFAULT_REALTIME_MAX_BYTES;

    const realtime = new WebxdcRealtimeChannel(
      api,
      selfAddr,
      selfUser,
      realtimeMaxBytes,
    );
    realtimeRef.current = realtime;
    webxdcRealtimeRef.current = realtime;

    setStatus({
      buildId: WEBXDC_VERSION,
      selfAddr,
      selfName,
      initPhase: "loading",
      hint: "Loading chat history…",
    });

    const markPropagationFailed = (error: SendUpdateRejectedError) => {
      setStatus({
        propagationFailed: true,
        propagationError: error.message,
        propagationFailureReason: error.reason,
        hasPendingPropagation: true,
      });
    };

    const { webxdc, awaitHistoryReplay } = createWebxdcSyncBridge(hostWebxdc, {
      onSendUpdate: () => {
        sendUpdateSent += 1;
        setStatus({
          sendUpdateSent,
          propagationFailed: false,
          propagationError: "",
          propagationFailureReason: "",
          hasPendingPropagation: false,
        });
      },
      onSendUpdateFailed: markPropagationFailed,
      onReceiveUpdate: (serial) => {
        sendUpdateReceived += 1;
        setStatus({ sendUpdateReceived, lastSendUpdateSerial: serial });
      },
      onJoin: (payload) => {
        realtime.applyJoin(payload);
        setStatus({ peerCount: realtime.getPeerCount() });
      },
    });

    const syncToChatPeers = (
      provider: InstanceType<typeof WebxdcProvider>,
      options?: { force?: boolean },
    ) => {
      if (!options?.force && !autosaveToChatRef.current) {
        return;
      }

      try {
        provider.syncToChatPeers();
      } catch (error) {
        if (error instanceof SendUpdateRejectedError) {
          markPropagationFailed(error);
        } else {
          markPropagationFailed(
            new SendUpdateRejectedError(
              error instanceof Error ? error.message : "sendUpdate failed",
              "error",
            ),
          );
        }
      }
    };

    const ydoc = new Y.Doc();
    const yElements = ydoc.getArray<Y.Map<unknown>>("elements");
    const yAssets = ydoc.getMap("assets");
    const ySceneSettings = ydoc.getMap("sceneSettings");

    const updateElementCount = () => {
      setStatus({ yjsElementCount: yElements.length });
    };

    realtime.setYjsHandler((data) => {
      try {
        applyUpdateV2(ydoc, data, REALTIME_YJS_ORIGIN);
        updateElementCount();
      } catch {
        setStatus({ lastError: "Ignored corrupt realtime document update" });
      }
    });
    realtime.setOnJoinError((message) => {
      setStatus({ lastError: message, realtimeJoined: false });
    });

    const hasRealtime = realtime.join(hostWebxdc);

    realtime.setCounters({
      onCursorSent: () => {
        realtimeCursorSent += 1;
        setStatus({ realtimeCursorSent });
      },
      onCursorReceived: () => {
        realtimeCursorReceived += 1;
        setStatus({ realtimeCursorReceived });
      },
      onDocumentSent: () => {
        realtimeDocSent += 1;
        setStatus({ realtimeDocSent });
      },
      onDocumentReceived: () => {
        realtimeDocReceived += 1;
        setStatus({ realtimeDocReceived });
      },
    });
    realtime.setOnPeersChanged((peerCount) => {
      setStatus({ peerCount });
    });

    setStatus({
      realtimeAvailable: hasRealtime,
      realtimeJoined: hasRealtime,
      hint: hasRealtime
        ? "Waiting for chat history…"
        : "Realtime off — enable in Delta Chat 1.48+ · Ctrl+S saves to chat",
    });

    const persistInterval = Math.max(
      hostWebxdc.sendUpdateInterval ?? 1000,
      PERSIST_SCENE_SYNC_MS,
    );
    persistIntervalRef.current = persistInterval;

    const run = async () => {
      const provider = new WebxdcProvider({
        webxdc,
        ydoc,
        autosaveInterval: autosaveToChatRef.current
          ? persistInterval
          : undefined,
        resendAllUpdates: false,
        getEditInfo: () => ({
          document: "Excalidraw",
          summary: `Last edit: ${selfName}`,
          startinfo: `${selfName} edited the whiteboard`,
        }),
      });
      providerRef.current = provider;

      provider.on("sync", ({ hasQueued }: { hasQueued: boolean }) => {
        setStatus({ hasPendingPropagation: hasQueued });
      });

      setStatus({ hint: "Replaying chat history…" });
      await awaitHistoryReplay();
      if (cancelled) {
        return;
      }

      await waitForInitialYjsState(ydoc, yElements);
      if (cancelled) {
        return;
      }

      await seedYdocFromBootstrapIfEmpty(yElements, yAssets, ySceneSettings);
      mergeLocalSceneIntoYdocBeforeBinding(api, yElements, yAssets);

      const binding = new ExcalidrawBinding(
        yElements,
        yAssets,
        ySceneSettings,
        api,
        {
          onSelectionChange: (selectedElementIds) => {
            realtime.updateSelection(selectedElementIds);
          },
        },
      );
      bindingRef.current = binding;
      updateElementCount();

      webxdc.sendUpdate(
        {
          payload: {
            type: "join",
            addr: selfAddr,
            name: selfName,
            color: userColor.color,
            colorLight: userColor.light,
          },
        },
        "",
      );

      const persistToChat = () => {
        syncToChatPeers(provider, { force: true });
        setStatus({ hint: "Saved to chat" });
      };

      webxdcPersistRef.current = persistToChat;

      realtime.setGetSceneBounds(() =>
        getVisibleSceneBounds(api.getAppState()),
      );

      setStatus({
        initPhase: "ready",
        hint: readyHint(hasRealtime, autosaveToChatRef.current),
      });

      announceJoinViewport(api, realtime, {
        syncFromPeers: hasRealtime,
        applySharedViewport: (bounds) => {
          api.updateScene({
            appState: zoomToFitBounds({
              appState: api.getAppState(),
              bounds,
              fitToViewport: true,
              viewportZoomFactor: 1,
            }).appState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });
        },
      });

      const pendingRealtimeYjs: Uint8Array[] = [];

      const flushRealtimeDoc = throttle(() => {
        if (!hasRealtime || !pendingRealtimeYjs.length) {
          return;
        }

        const merged = mergeUpdatesV2(pendingRealtimeYjs);
        pendingRealtimeYjs.length = 0;

        realtime.sendDocumentUpdate(merged);
      }, REALTIME_DOC_MS);

      const flushPersist = throttle(
        () => syncToChatPeers(provider),
        PERSIST_FLUSH_MS,
        { leading: false, trailing: true },
      );

      yAssets.observe((_event, transaction) => {
        if (transaction.origin !== binding) {
          return;
        }
        // Images are too large for realtime — only persist when auto-save is on
        syncToChatPeers(provider);
      });

      ydoc.on("updateV2", (_update, origin) => {
        updateElementCount();
        if (origin !== binding) {
          return;
        }

        if (hasRealtime) {
          pendingRealtimeYjs.push(_update);
          flushRealtimeDoc();
        }

        if (autosaveToChatRef.current) {
          flushPersist();
        }
      });

      const onPointerUpdate = (payload: {
        pointer: PointerPayload["pointer"];
        button: PointerPayload["button"];
        pointersMap: Gesture["pointers"];
      }) => {
        if (payload.pointersMap.size >= 2) {
          return;
        }

        realtime.updatePointer(payload.pointer, payload.button, {
          immediate: payload.button === "down",
        });

        if (payload.button === "down") {
          flushRealtimeDoc.flush();
        }
      };

      webxdcPointerUpdateRef.current = onPointerUpdate;

      realtime.setOnFollowersChanged((followers) => {
        api.updateScene({
          appState: {
            followedBy: new Set(
              [...followers].map((addr) => toBrandedType<SocketId>(addr)),
            ),
          },
          captureUpdate: CaptureUpdateAction.NEVER,
        });
      });

      realtime.setOnFollowRequest((request) => {
        appJotaiStore.set(pendingFollowRequestAtom, request);
      });

      realtime.setViewportHandler((fromAddr, bounds) => {
        const appState = api.getAppState();
        const followedId = appState.userToFollow?.socketId;

        if (!followedId || followedId !== fromAddr) {
          return;
        }

        if (appState.followedBy.has(followedId)) {
          return;
        }

        withFollowViewportSync(() => {
          const nextAppState = zoomToFitBounds({
            appState,
            bounds,
            fitToViewport: true,
            viewportZoomFactor: 1,
          }).appState;

          api.updateScene({
            appState: nextAppState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });

          return {
            scrollX: nextAppState.scrollX,
            scrollY: nextAppState.scrollY,
            zoom: nextAppState.zoom.value,
          };
        });
      });

      const relayFollowedViewport = throttleRAF(() => {
        if (!realtime.hasFollowers()) {
          return;
        }
        realtime.relayViewport(getVisibleSceneBounds(api.getAppState()));
      });

      const unsubScroll = api.onScrollChange(() => {
        relayFollowedViewport();
      });

      const unsubFollow = api.onUserFollow((payload) => {
        const followedAddr = payload.userToFollow.socketId as string;
        if (payload.action === "FOLLOW") {
          realtime.notifyFollow(followedAddr);
        } else {
          realtime.notifyUnfollow(followedAddr);
        }
      });

      const collabAPI: CollabAPI = {
        isCollaborating: () => true,
        onPointerUpdate,
        startCollaboration: async () => ({
          elements: api.getSceneElementsIncludingDeleted(),
          appState: api.getAppState(),
        }),
        stopCollaboration: () => {},
        syncElements: (_elements: readonly OrderedExcalidrawElement[]) => {},
        fetchImageFiles: async ({ elements }) => ({
          loadedFiles: [],
          erroredFiles: new Map(),
          elements,
        }),
        setUsername: () => {},
        getUsername: () => selfName,
        getActiveRoomLink: () => null,
        setCollabError: () => {},
      };

      appJotaiStore.set(collabAPIAtom, collabAPI);
      appJotaiStore.set(isCollaboratingAtom, true);
      appJotaiStore.set(activeRoomLinkAtom, null);

      return () => {
        unsubScroll();
        unsubFollow();
        flushRealtimeDoc.cancel();
        flushPersist.cancel();
        webxdcPersistRef.current = null;
        webxdcPointerUpdateRef.current = null;
        binding.destroy();
        bindingRef.current = null;
        realtime.leave();
        realtimeRef.current = null;
        webxdcRealtimeRef.current = null;
        appJotaiStore.set(pendingFollowRequestAtom, null);
        clearInterval(provider.autosaveLoop);
        providerRef.current = null;
        appJotaiStore.set(collabAPIAtom, null);
        appJotaiStore.set(isCollaboratingAtom, false);
      };
    };

    let cleanupInner: (() => void) | undefined;

    run().then((cleanup) => {
      cleanupInner = cleanup;
    });

    return () => {
      cancelled = true;
      cleanupInner?.();
    };
  }, []);

  return null;
};

export default WebxdcCollab;