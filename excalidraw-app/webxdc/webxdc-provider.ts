import {
  applyUpdateV2,
  encodeStateAsUpdateV2,
  mergeUpdatesV2,
} from "yjs";
import { fromUint8Array, toUint8Array } from "js-base64";

import type { Doc } from "yjs";

type WebxdcEditInfo = {
  document: string;
  summary: string;
  startinfo: string;
};

type WebxdcSendUpdate = (
  update: {
    payload: { serializedYjsUpdate: string };
    document: string;
    summary: string;
    info?: string;
  },
  description: string,
) => void;

type WebxdcBridge = {
  setUpdateListener: (
    cb: (update: { payload: { serializedYjsUpdate?: string } }) => void,
    serial?: number,
  ) => void;
  sendUpdate: WebxdcSendUpdate;
};

type WebxdcProviderOptions = {
  webxdc: WebxdcBridge;
  ydoc: Doc;
  getEditInfo: () => WebxdcEditInfo;
  /** When set, starts periodic syncToChatPeers (auto-save to chat). */
  autosaveInterval?: number;
  resendAllUpdates?: boolean;
};

/**
 * y-webxdc provider without visibility/beforeunload flush. Chat sendUpdate is
 * triggered only by WebxdcCollab (manual save, auto-save interval, or throttled
 * flush while auto-save is enabled).
 */
export default class WebxdcProvider {
  webxdc: WebxdcBridge;
  ydoc: Doc;
  getEditInfo: () => WebxdcEditInfo;
  resendAllUpdates: boolean;
  queuedYjsUpdates: Uint8Array[] = [];
  everNotifiedPeersAboutEdits = false;
  autosaveLoop: ReturnType<typeof setInterval> | undefined;
  private eventHandlers: { sync: Array<(event: { hasQueued: boolean }) => void> };

  constructor({
    webxdc,
    ydoc,
    getEditInfo,
    autosaveInterval,
    resendAllUpdates,
  }: WebxdcProviderOptions) {
    this.webxdc = webxdc;
    this.ydoc = ydoc;
    this.getEditInfo = getEditInfo;
    this.resendAllUpdates = resendAllUpdates ?? false;
    this.eventHandlers = { sync: [] };

    webxdc.setUpdateListener((update) =>
      this.receiveWebxdcUpdateFromChatPeers(update),
    );
    ydoc.on("updateV2", (yjsupdate, origin) =>
      this.receiveYjsUpdate(yjsupdate, origin),
    );
    if (autosaveInterval) {
      this.autosaveLoop = setInterval(
        () => this.syncToChatPeers(),
        autosaveInterval,
      );
    }
  }

  on(name: "sync", handler: (event: { hasQueued: boolean }) => void) {
    this.eventHandlers[name].push(handler);
  }

  syncToChatPeers() {
    if (this.queuedYjsUpdates.length <= 0) {
      return;
    }

    const { document, summary, startinfo } = this.getEditInfo();

    const mergedYjsUpdate = this.resendAllUpdates
      ? encodeStateAsUpdateV2(this.ydoc)
      : mergeUpdatesV2(this.queuedYjsUpdates);

    const payload = { serializedYjsUpdate: fromUint8Array(mergedYjsUpdate) };
    const update: {
      payload: { serializedYjsUpdate: string };
      document: string;
      summary: string;
      info?: string;
    } = { payload, document, summary };

    if (!this.everNotifiedPeersAboutEdits) {
      update.info = startinfo;
      this.everNotifiedPeersAboutEdits = true;
    }

    this.webxdc.sendUpdate(update, "document edited");
    this.queuedYjsUpdates.length = 0;
    this.eventHandlers.sync.forEach((func) => func({ hasQueued: false }));
  }

  private receiveWebxdcUpdateFromChatPeers(update: {
    payload: { serializedYjsUpdate?: string };
  }) {
    const serialized = update.payload.serializedYjsUpdate;
    if (!serialized) {
      return;
    }

    applyUpdateV2(this.ydoc, toUint8Array(serialized), this.ydoc.clientID);
  }

  private receiveYjsUpdate(yjsUpdate: Uint8Array, origin: unknown) {
    if (origin === this.ydoc.clientID) {
      return;
    }

    this.queuedYjsUpdates.push(yjsUpdate);
    this.eventHandlers.sync.forEach((func) => func({ hasQueued: true }));
  }
}