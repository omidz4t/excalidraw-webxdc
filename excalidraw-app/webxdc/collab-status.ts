import { atom } from "jotai";

import { appJotaiStore } from "../app-jotai";

import type {
  ReceivedStatusUpdate,
  SendingStatusUpdate,
  Webxdc,
} from "@webxdc/types";

import type { JoinPayload } from "./webxdc-realtime-channel";

const DEFAULT_SEND_UPDATE_MAX_BYTES = 128_000;

export type PropagationFailureReason = "size" | "error";

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
  propagationFailed: boolean;
  propagationError: string;
  propagationFailureReason: PropagationFailureReason | "";
  hasPendingPropagation: boolean;
};

export const patchCollabSyncStatus = (
  patch: Partial<CollabSyncStatus>,
): void => {
  appJotaiStore.set(collabSyncStatusAtom, (prev) => {
    const hasChange = (Object.keys(patch) as (keyof CollabSyncStatus)[]).some(
      (key) => prev[key] !== patch[key],
    );
    if (!hasChange) {
      return prev;
    }
    return { ...prev, ...patch };
  });
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
  propagationFailed: false,
  propagationError: "",
  propagationFailureReason: "",
  hasPendingPropagation: false,
});

export const estimateSendUpdateBytes = (
  update: SendingStatusUpdate<unknown>,
): number => new TextEncoder().encode(JSON.stringify(update)).length;

export class SendUpdateRejectedError extends Error {
  readonly reason: PropagationFailureReason;

  constructor(message: string, reason: PropagationFailureReason) {
    super(message);
    this.name = "SendUpdateRejectedError";
    this.reason = reason;
  }
}

type WebxdcHost = Webxdc<unknown>;

/**
 * Delta Chat exposes a frozen window.webxdc — do not assign to its methods.
 * Return a plain delegate object for y-webxdc and our own calls.
 */
export const createWebxdcSyncBridge = (
  host: WebxdcHost,
  handlers: {
    onSendUpdate: () => void;
    onSendUpdateFailed: (error: SendUpdateRejectedError) => void;
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
      const maxBytes =
        host.sendUpdateMaxSize ?? DEFAULT_SEND_UPDATE_MAX_BYTES;
      const payloadBytes = estimateSendUpdateBytes(update);
      if (payloadBytes > maxBytes) {
        const error = new SendUpdateRejectedError(
          `Update is too large to send (${payloadBytes} bytes, limit ${maxBytes}).`,
          "size",
        );
        handlers.onSendUpdateFailed(error);
        throw error;
      }

      try {
        host.sendUpdate(update, "");
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "sendUpdate failed";
        const error = new SendUpdateRejectedError(message, "error");
        handlers.onSendUpdateFailed(error);
        throw error;
      }

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