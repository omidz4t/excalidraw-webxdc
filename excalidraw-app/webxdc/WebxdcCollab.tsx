
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
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { applyUpdateV2, mergeUpdatesV2 } from "yjs";
import WebxdcProvider from "y-webxdc";

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
} from "./collab-status";

import type { CollabSyncStatus } from "./collab-status";
import { webxdcPointerUpdateRef } from "./pointer-ref";
import { WebxdcRealtimeChannel } from "./webxdc-realtime-channel";

import { getWebxdc } from "./get-webxdc";
import { WEBXDC_VERSION } from "./version";
import { pickUserColor } from "./user-colors";
import { ExcalidrawBinding } from "./y-excalidraw";

type PointerPayload = SocketUpdateDataSource["MOUSE_LOCATION"]["payload"];

const INIT_WAIT_MS = 2_000;
const REALTIME_YJS_ORIGIN = "webxdc-realtime-doc";
const DEFAULT_REALTIME_MAX_BYTES = 128_000;

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
  const bindingRef = useRef<ExcalidrawBinding | null>(null);
  const providerRef = useRef<InstanceType<typeof WebxdcProvider> | null>(null);
  const realtimeRef = useRef<WebxdcRealtimeChannel | null>(null);

  useEffect(() => {
    const hostWebxdc = getWebxdc();
    if (!hostWebxdc) {
      appJotaiStore.set(collabSyncStatusAtom, (prev) => ({
        ...prev,
        initPhase: "error",
        hint: "window.webxdc missing after boot — reinstall the latest .xdc in Delta Chat",
        lastError:
          "Delete the old chat attachment and attach a fresh excalidraw.xdc.",
      }));
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

    const setStatus = (patch: Partial<CollabSyncStatus>) => {
      appJotaiStore.set(collabSyncStatusAtom, (prev) => ({ ...prev, ...patch }));
    };

    let sendUpdateSent = 0;
    let sendUpdateReceived = 0;
    let realtimeDocSent = 0;
    let realtimeDocReceived = 0;
    let realtimeCursorSent = 0;
    let realtimeCursorReceived = 0;

    const realtimeMaxBytes =
      hostWebxdc.sendUpdateMaxSize ?? DEFAULT_REALTIME_MAX_BYTES;

    const realtime = new WebxdcRealtimeChannel(
      excalidrawAPI,
      selfAddr,
      selfUser,
      realtimeMaxBytes,
    );
    realtimeRef.current = realtime;

    setStatus({
      buildId: WEBXDC_VERSION,
      selfAddr,
      selfName,
      initPhase: "loading",
      hint: "Loading chat history…",
    });

    const { webxdc, awaitHistoryReplay } = createWebxdcSyncBridge(hostWebxdc, {
      onSendUpdate: () => {
        sendUpdateSent += 1;
        setStatus({ sendUpdateSent });
      },
      onReceiveUpdate: (serial) => {
        sendUpdateReceived += 1;
        setStatus({ sendUpdateReceived, lastSendUpdateSerial: serial });
      },
      onJoin: (payload) => {
        realtime.applyJoin(payload);
        setStatus({ peerCount: realtime.getPeerCount() });
      },
    });

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
        : "Realtime off — enable in Delta Chat Advanced settings (1.48+). Drawing uses sendUpdate.",
    });

    const persistInterval = Math.max(
      hostWebxdc.sendUpdateInterval ?? 1000,
      PERSIST_SCENE_SYNC_MS,
    );

    const run = async () => {
      const provider = new WebxdcProvider({
        webxdc,
        ydoc,
        autosaveInterval: persistInterval,
        resendAllUpdates: false,
        getEditInfo: () => ({
          document: "Excalidraw",
          summary: `Last edit: ${selfName}`,
          startinfo: `${selfName} edited the whiteboard`,
        }),
      });
      providerRef.current = provider;

      setStatus({ hint: "Replaying chat history…" });
      await awaitHistoryReplay();
      if (cancelled) {
        return;
      }

      await waitForInitialYjsState(ydoc, yElements);
      if (cancelled) {
        return;
      }

      const binding = new ExcalidrawBinding(
        yElements,
        yAssets,
        ySceneSettings,
        excalidrawAPI,
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

      setStatus({
        initPhase: "ready",
        hint: hasRealtime
          ? "Live drawing + cursors over P2P · backup via sendUpdate"
          : "Drawing syncs via sendUpdate (~few seconds)",
      });

      const pendingRealtimeYjs: Uint8Array[] = [];

      const flushRealtimeDoc = throttle(() => {
        if (!hasRealtime || !pendingRealtimeYjs.length) {
          return;
        }

        const merged = mergeUpdatesV2(pendingRealtimeYjs);
        pendingRealtimeYjs.length = 0;

        if (!realtime.sendDocumentUpdate(merged)) {
          provider.syncToChatPeers();
        }
      }, REALTIME_DOC_MS);

      const flushPersist = throttle(
        () => provider.syncToChatPeers(),
        PERSIST_FLUSH_MS,
        { leading: false, trailing: true },
      );

      yAssets.observe((_event, transaction) => {
        if (transaction.origin !== binding) {
          return;
        }
        // Images are too large for realtime — persist immediately
        provider.syncToChatPeers();
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

        flushPersist();
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

      realtime.setGetSceneBounds(() =>
        getVisibleSceneBounds(excalidrawAPI.getAppState()),
      );

      realtime.setOnFollowersChanged((followers) => {
        excalidrawAPI.updateScene({
          appState: {
            followedBy: new Set(
              [...followers].map((addr) => toBrandedType<SocketId>(addr)),
            ),
          },
          captureUpdate: CaptureUpdateAction.NEVER,
        });
      });

      realtime.setViewportHandler((fromAddr, bounds) => {
        const appState = excalidrawAPI.getAppState();
        const followedId = appState.userToFollow?.socketId;

        if (!followedId || followedId !== fromAddr) {
          return;
        }

        if (appState.followedBy.has(followedId)) {
          return;
        }

        excalidrawAPI.updateScene({
          appState: zoomToFitBounds({
            appState,
            bounds,
            fitToViewport: true,
            viewportZoomFactor: 1,
          }).appState,
          captureUpdate: CaptureUpdateAction.NEVER,
        });
      });

      const relayFollowedViewport = throttleRAF(() => {
        if (!realtime.hasFollowers()) {
          return;
        }
        realtime.relayViewport(
          getVisibleSceneBounds(excalidrawAPI.getAppState()),
        );
      });

      const unsubScroll = excalidrawAPI.onScrollChange(() => {
        relayFollowedViewport();
      });

      const unsubFollow = excalidrawAPI.onUserFollow((payload) => {
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
          elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
          appState: excalidrawAPI.getAppState(),
        }),
        stopCollaboration: () => {},
        syncElements: (_elements: readonly OrderedExcalidrawElement[]) => {},
        fetchImageFilesFromFirebase: async ({ elements }) => ({
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
        webxdcPointerUpdateRef.current = null;
        binding.destroy();
        bindingRef.current = null;
        realtime.leave();
        realtimeRef.current = null;
        clearInterval(provider.autosaveLoop);
        provider.syncToChatPeers();
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
  }, [excalidrawAPI]);

  return null;
};

export default WebxdcCollab;