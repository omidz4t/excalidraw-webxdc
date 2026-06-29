import { atom } from "jotai";

import type { ReceivedStatusUpdate, Webxdc } from "@webxdc/types";

import type { JoinPayload } from "./webxdc-realtime-channel";

export type CollabSyncStatus = {
  buildId: string;
  selfAddr: string;
  selfName: string;
  realtimeAvailable: boolean;
  realtimeJoined: boolean;
  realtimeDocSent: number;
  realtimeDocReceived: number;
  realtimeCursorSent: number;
  realtimeCursorReceived: number;
  sendUpdateReceived: number;
  sendUpdateSent: number;
  lastSendUpdateSerial: number;
  yjsElementCount: number;
  peerCount: number;
  initPhase: "loading" | "ready" | "error";
  hint: string;
  lastError: string;
};

export const collabSyncStatusAtom = atom<CollabSyncStatus>({
  buildId: "",
  selfAddr: "",
  selfName: "",
  realtimeAvailable: false,
  realtimeJoined: false,
  realtimeDocSent: 0,
  realtimeDocReceived: 0,
  realtimeCursorSent: 0,
  realtimeCursorReceived: 0,
  sendUpdateReceived: 0,
  sendUpdateSent: 0,
  lastSendUpdateSerial: 0,
  yjsElementCount: 0,
  peerCount: 0,
  initPhase: "loading",
  hint: "Connecting…",
  lastError: "",
});

type WebxdcHost = Webxdc<unknown>;

/**
 * Delta Chat exposes a frozen window.webxdc — do not assign to its methods.
 * Return a plain delegate object for y-webxdc and our own calls.
 */
export const createWebxdcSyncBridge = (
  host: WebxdcHost,
  handlers: {
    onSendUpdate: () => void;
    onReceiveUpdate: (serial: number) => void;
    onJoin: (payload: JoinPayload) => void;
  },
) => {
  let historyReplay: Promise<void> = Promise.resolve();

  const handleIncomingUpdate = (
    update: ReceivedStatusUpdate<unknown>,
    cb: (update: ReceivedStatusUpdate<unknown>) => void,
  ) => {
    const payload = update.payload as
      | JoinPayload
      | { serializedYjsUpdate?: string };
    if (payload && "type" in payload && payload.type === "join") {
      handlers.onJoin(payload);
    }
    if (
      payload &&
      "serializedYjsUpdate" in payload &&
      payload.serializedYjsUpdate
    ) {
      handlers.onReceiveUpdate(update.serial);
    }
    cb(update);
  };

  const webxdc: WebxdcHost = {
    selfAddr: host.selfAddr,
    selfName: host.selfName,
    sendUpdateInterval: host.sendUpdateInterval,
    sendUpdateMaxSize: host.sendUpdateMaxSize,
    sendUpdate(update, _description) {
      host.sendUpdate(update, "");
      handlers.onSendUpdate();
    },
    setUpdateListener(cb, serial) {
      historyReplay = host.setUpdateListener(
        (update) => handleIncomingUpdate(update, cb),
        serial,
      );
      return historyReplay;
    },
    joinRealtimeChannel() {
      return host.joinRealtimeChannel?.();
    },
    getAllUpdates() {
      return host.getAllUpdates();
    },
    sendToChat(message) {
      return host.sendToChat(message);
    },
    importFiles(filter) {
      return host.importFiles(filter);
    },
  };

  return {
    webxdc,
    awaitHistoryReplay: () => historyReplay,
  };
};