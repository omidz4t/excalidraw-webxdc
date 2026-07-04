import { toBrandedType } from "@excalidraw/common";
import { fromUint8Array, toUint8Array } from "js-base64";

import type {
  Collaborator,
  ExcalidrawImperativeAPI,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type { RealtimeListener } from "@webxdc/types";

import { cursorStateToCollaborator } from "./y-excalidraw/cursor-sync";

import type { CursorUser } from "./y-excalidraw/cursor-sync";

/** Cursor JSON over P2P (~30 fps, realFinger pattern) */
const CURSOR_SEND_INTERVAL_MS = 33;
const STALE_MS = 8_000;

type PosMessage = {
  t: "pos";
  a: string;
  n: string;
  c: string;
  cl: string;
  x: number;
  y: number;
  b: "down" | "up";
  tl: "pointer" | "laser";
};

type SelMessage = {
  t: "sel";
  a: string;
  s: Record<string, boolean>;
};

type DocMessage = {
  t: "doc";
  d: string;
};

/** Yjs sync protocol (SyncStep1/2) wrapped as base64 — see yjs-realtime-sync.ts */
type SynMessage = {
  t: "syn";
  a: string;
  f?: string;
  d: string;
};

type VpMessage = {
  t: "vp";
  a: string;
  b: [number, number, number, number];
};

type FolMessage = {
  t: "fol";
  a: string;
  f: string;
};

type UnfolMessage = {
  t: "unfol";
  a: string;
  f: string;
};

type RfolMessage = {
  t: "rfol";
  a: string;
  f: string;
  n: string;
};

/** Joiner asks existing peers for a shared viewport. */
type JreqMessage = {
  t: "jreq";
  a: string;
};

/** Directed viewport for a joining peer (from the elected host). */
type VjMessage = {
  t: "vj";
  a: string;
  f: string;
  b: SceneBounds;
};

type RealtimeMessage =
  | PosMessage
  | SelMessage
  | DocMessage
  | SynMessage
  | VpMessage
  | FolMessage
  | UnfolMessage
  | RfolMessage
  | JreqMessage
  | VjMessage;

export type FollowRequestPayload = {
  fromAddr: string;
  fromName: string;
};

export type SceneBounds = [number, number, number, number];

export type JoinPayload = {
  type: "join";
  addr: string;
  name: string;
  color: string;
  colorLight: string;
};

type PeerState = {
  user: CursorUser;
  pointer?: { x: number; y: number; tool: "pointer" | "laser" };
  button?: "down" | "up";
  selectedElementIds?: Record<string, boolean>;
  lastSeen: number;
};

const encodeJson = (msg: RealtimeMessage) =>
  new TextEncoder().encode(JSON.stringify(msg));

/**
 * Single Delta Chat realtime channel for:
 * - live drawing (JSON-wrapped Yjs, `{t:"doc",d:base64}`)
 * - live cursors (small JSON, realFinger-style)
 */
export class WebxdcRealtimeChannel {
  private channel: RealtimeListener | null = null;
  private peers = new Map<string, PeerState>();
  private pendingPos: Omit<PosMessage, "t"> | null = null;
  private pendingDocUpdates: Uint8Array[] = [];
  private cursorSendTimer: ReturnType<typeof setInterval> | null = null;
  private staleTimer: ReturnType<typeof setInterval> | null = null;
  private onCursorSent?: () => void;
  private onCursorReceived?: () => void;
  private onDocumentSent?: () => void;
  private onDocumentReceived?: () => void;
  private onPeersChanged?: (count: number) => void;
  private onJoinError?: (message: string) => void;
  private onYjsUpdate?: (data: Uint8Array) => void;
  private onSyncMessage?: (
    data: Uint8Array,
    fromAddr: string,
  ) => Uint8Array | null;
  private onDocumentSyncRequest?: () => void;
  private onViewport?: (from: string, bounds: SceneBounds) => void;
  private onJoinViewport?: (bounds: SceneBounds) => void;
  private onFollowersChanged?: (followers: Set<string>) => void;
  private onFollowRequest?: (request: FollowRequestPayload) => void;
  private getSceneBounds?: () => SceneBounds;
  private followers = new Set<string>();
  private maxBytes = 128_000;

  constructor(
    private api: ExcalidrawImperativeAPI,
    private selfAddr: string,
    private selfUser: CursorUser,
    maxBytes?: number,
  ) {
    if (maxBytes) {
      this.maxBytes = maxBytes;
    }
  }

  setCounters(handlers: {
    onCursorSent?: () => void;
    onCursorReceived?: () => void;
    onDocumentSent?: () => void;
    onDocumentReceived?: () => void;
  }) {
    this.onCursorSent = handlers.onCursorSent;
    this.onCursorReceived = handlers.onCursorReceived;
    this.onDocumentSent = handlers.onDocumentSent;
    this.onDocumentReceived = handlers.onDocumentReceived;
  }

  setOnPeersChanged(onPeersChanged: (count: number) => void) {
    this.onPeersChanged = onPeersChanged;
  }

  setOnJoinError(onJoinError: (message: string) => void) {
    this.onJoinError = onJoinError;
  }

  setYjsHandler(handler: (data: Uint8Array) => void) {
    this.onYjsUpdate = handler;
    this.flushPendingDocUpdates();
  }

  setSyncMessageHandler(
    handler: (data: Uint8Array, fromAddr: string) => Uint8Array | null,
  ) {
    this.onSyncMessage = handler;
  }

  setOnDocumentSyncRequest(handler: () => void) {
    this.onDocumentSyncRequest = handler;
  }

  /** Broadcast SyncStep1 to the mesh (new joiner or peer discovery). */
  requestDocumentSync() {
    this.onDocumentSyncRequest?.();
  }

  /**
   * Send a Yjs sync-protocol payload. Broadcast when `targetAddr` is omitted;
   * otherwise direct the reply (SyncStep2) at one peer.
   */
  sendSyncMessage(data: Uint8Array, targetAddr?: string) {
    if (!this.channel || !data.byteLength) {
      return false;
    }

    const msg: SynMessage = {
      t: "syn",
      a: this.selfAddr,
      d: fromUint8Array(data),
    };
    if (targetAddr) {
      msg.f = targetAddr;
    }

    const payload = encodeJson(msg);
    if (payload.byteLength > this.maxBytes) {
      return false;
    }

    try {
      this.channel.send(payload);
      this.onDocumentSent?.();
      return true;
    } catch {
      return false;
    }
  }

  setViewportHandler(handler: (from: string, bounds: SceneBounds) => void) {
    this.onViewport = handler;
  }

  setJoinViewportHandler(handler: (bounds: SceneBounds) => void) {
    this.onJoinViewport = handler;
  }

  setOnFollowersChanged(onFollowersChanged: (followers: Set<string>) => void) {
    this.onFollowersChanged = onFollowersChanged;
  }

  setOnFollowRequest(onFollowRequest: (request: FollowRequestPayload) => void) {
    this.onFollowRequest = onFollowRequest;
  }

  setGetSceneBounds(getter: () => SceneBounds) {
    this.getSceneBounds = getter;
  }

  hasFollowers() {
    return this.followers.size > 0;
  }

  /** Tell a peer we started following them (they should send viewport updates). */
  notifyFollow(followedAddr: string) {
    this.sendRealtimeJson({ t: "fol", a: this.selfAddr, f: followedAddr });
  }

  /** Tell a peer we stopped following them. */
  notifyUnfollow(followedAddr: string) {
    this.sendRealtimeJson({ t: "unfol", a: this.selfAddr, f: followedAddr });
  }

  /** Ask a peer to follow this user (they see a prompt on their screen). */
  requestFollow(targetAddr: string) {
    if (!this.channel || targetAddr === this.selfAddr) {
      return false;
    }

    this.sendRealtimeJson({
      t: "rfol",
      a: this.selfAddr,
      f: targetAddr,
      n: this.selfUser.name ?? this.selfAddr,
    });
    return true;
  }

  /** Broadcast visible canvas bounds to peers who follow this user. */
  relayViewport(bounds: SceneBounds) {
    if (!this.channel || !this.followers.size) {
      return;
    }
    this.sendRealtimeJson({ t: "vp", a: this.selfAddr, b: bounds });
  }

  /** Ask online peers to share their viewport (used when joining live). */
  requestJoinViewport() {
    if (!this.channel) {
      return false;
    }
    this.sendRealtimeJson({ t: "jreq", a: this.selfAddr });
    return true;
  }

  join(webxdc: { joinRealtimeChannel?: () => RealtimeListener }): boolean {
    if (typeof webxdc.joinRealtimeChannel !== "function") {
      return false;
    }

    try {
      this.channel = webxdc.joinRealtimeChannel();
      this.channel.setListener((data) => this.onRealtimeData(data));
    } catch (error) {
      this.channel = null;
      this.onJoinError?.(
        error instanceof Error ? error.message : "joinRealtimeChannel failed",
      );
      return false;
    }

    this.cursorSendTimer = setInterval(
      () => this.flushPendingPos(),
      CURSOR_SEND_INTERVAL_MS,
    );
    this.staleTimer = setInterval(() => this.removeStalePeers(), 2_000);
    this.onDocumentSyncRequest?.();

    return true;
  }

  applyJoin(payload: JoinPayload) {
    if (payload.addr === this.selfAddr) {
      return;
    }

    this.peers.set(payload.addr, {
      user: {
        name: payload.name,
        color: payload.color,
        colorLight: payload.colorLight,
      },
      lastSeen: Date.now(),
    });
    this.pushCollaborators();
    this.onDocumentSyncRequest?.();
  }

  updatePointer(
    pointer: { x: number; y: number; tool: "pointer" | "laser" },
    button: "down" | "up",
    options?: { immediate?: boolean },
  ) {
    this.pendingPos = {
      a: this.selfAddr,
      n: this.selfUser.name ?? this.selfAddr,
      c: this.selfUser.color ?? "#30bced",
      cl: this.selfUser.colorLight ?? "#30bced33",
      x: pointer.x,
      y: pointer.y,
      b: button,
      tl: pointer.tool,
    };

    if (options?.immediate) {
      this.flushPendingPos();
    }
  }

  updateSelection(selectedElementIds: Record<string, boolean>) {
    this.sendJson({
      t: "sel",
      a: this.selfAddr,
      s: selectedElementIds,
    });
  }

  /** Live document contribution — JSON-wrapped merged Yjs update */
  sendDocumentUpdate(update: Uint8Array) {
    if (!this.channel || !update.byteLength) {
      return false;
    }

    const payload = encodeJson({ t: "doc", d: fromUint8Array(update) });
    if (payload.byteLength > this.maxBytes) {
      return false;
    }

    try {
      this.channel.send(payload);
      this.onDocumentSent?.();
      return true;
    } catch {
      return false;
    }
  }

  get isAvailable() {
    return this.channel !== null;
  }

  getPeerCount() {
    return this.peers.size;
  }

  leave() {
    if (this.cursorSendTimer) {
      clearInterval(this.cursorSendTimer);
      this.cursorSendTimer = null;
    }
    if (this.staleTimer) {
      clearInterval(this.staleTimer);
      this.staleTimer = null;
    }
    this.flushPendingPos();
    this.channel?.leave();
    this.channel = null;
    this.peers.clear();
    this.followers.clear();
    this.onYjsUpdate = undefined;
    this.onSyncMessage = undefined;
    this.onDocumentSyncRequest = undefined;
    this.onViewport = undefined;
    this.onJoinViewport = undefined;
    this.onFollowersChanged = undefined;
    this.onFollowRequest = undefined;
    this.getSceneBounds = undefined;
    this.api.updateScene({ collaborators: new Map() });
  }

  private onRealtimeData(data: Uint8Array) {
    if (data[0] === 0x7b) {
      this.handleRealtimeJson(data);
      return;
    }

    // Legacy peers may still send raw Yjs bytes
    this.deliverDocumentUpdate(data);
  }

  private handleRealtimeJson(data: Uint8Array) {
    let msg: RealtimeMessage;
    try {
      msg = JSON.parse(new TextDecoder().decode(data)) as RealtimeMessage;
    } catch {
      return;
    }

    if (!msg?.t) {
      return;
    }

    if (msg.t === "doc") {
      if (!msg.d) {
        return;
      }
      try {
        this.deliverDocumentUpdate(toUint8Array(msg.d));
      } catch {
        // ignore corrupt payloads
      }
      return;
    }

    if (msg.t === "syn") {
      if (!msg.a || msg.a === this.selfAddr || !msg.d) {
        return;
      }
      if (msg.f && msg.f !== this.selfAddr) {
        return;
      }

      try {
        const data = toUint8Array(msg.d);
        const reply = this.onSyncMessage?.(data, msg.a);
        if (reply?.byteLength) {
          this.sendSyncMessage(reply, msg.a);
        }
        this.onDocumentReceived?.();
      } catch {
        // ignore corrupt sync payloads
      }
      return;
    }

    if (msg.t === "fol") {
      if (msg.f !== this.selfAddr || !msg.a || msg.a === this.selfAddr) {
        return;
      }
      this.followers.add(msg.a);
      this.onFollowersChanged?.(new Set(this.followers));
      if (this.getSceneBounds) {
        this.relayViewport(this.getSceneBounds());
      }
      return;
    }

    if (msg.t === "unfol") {
      if (msg.f !== this.selfAddr || !msg.a) {
        return;
      }
      if (this.followers.delete(msg.a)) {
        this.onFollowersChanged?.(new Set(this.followers));
      }
      return;
    }

    if (msg.t === "vp") {
      if (!msg.a || msg.a === this.selfAddr || !msg.b?.length) {
        return;
      }
      this.onViewport?.(msg.a, msg.b);
      return;
    }

    if (msg.t === "rfol") {
      if (msg.f !== this.selfAddr || !msg.a || msg.a === this.selfAddr) {
        return;
      }
      this.onFollowRequest?.({
        fromAddr: msg.a,
        fromName: msg.n || msg.a,
      });
      return;
    }

    if (msg.t === "jreq") {
      if (!msg.a || msg.a === this.selfAddr) {
        return;
      }
      if (this.shouldShareJoinViewport(msg.a)) {
        this.sendJoinViewport(msg.a);
      }
      return;
    }

    if (msg.t === "vj") {
      if (msg.f !== this.selfAddr || !msg.a || !msg.b?.length) {
        return;
      }
      this.onJoinViewport?.(msg.b);
      return;
    }

    if (!("a" in msg) || !msg.a || msg.a === this.selfAddr) {
      return;
    }

    this.onCursorReceived?.();

    const peer = this.peers.get(msg.a) ?? {
      user: { name: msg.a },
      lastSeen: Date.now(),
    };

    if (msg.t === "pos") {
      peer.user = {
        name: msg.n,
        color: msg.c,
        colorLight: msg.cl,
      };
      peer.pointer = { x: msg.x, y: msg.y, tool: msg.tl };
      peer.button = msg.b;
      peer.lastSeen = Date.now();
      this.peers.set(msg.a, peer);
      this.pushCollaborators();
      return;
    }

    if (msg.t === "sel") {
      peer.selectedElementIds = msg.s;
      peer.lastSeen = Date.now();
      this.peers.set(msg.a, peer);
      this.pushCollaborators();
    }
  }

  private flushPendingPos() {
    if (!this.pendingPos) {
      return;
    }
    this.sendJson({ t: "pos", ...this.pendingPos });
  }

  private deliverDocumentUpdate(data: Uint8Array) {
    if (!data.byteLength) {
      return;
    }

    this.onDocumentReceived?.();
    if (this.onYjsUpdate) {
      this.onYjsUpdate(data);
      return;
    }

    this.pendingDocUpdates.push(data);
  }

  private flushPendingDocUpdates() {
    if (!this.onYjsUpdate || !this.pendingDocUpdates.length) {
      return;
    }

    const pending = this.pendingDocUpdates.splice(0);
    for (const update of pending) {
      this.onYjsUpdate(update);
    }
  }

  private sendRealtimeJson(msg: RealtimeMessage) {
    if (!this.channel) {
      return;
    }
    try {
      this.channel.send(encodeJson(msg));
      if (msg.t === "pos" || msg.t === "sel") {
        this.onCursorSent?.();
      }
    } catch {
      // channel closed
    }
  }

  private sendJson(msg: PosMessage | SelMessage) {
    this.sendRealtimeJson(msg);
  }

  /**
   * One existing peer shares their viewport with a joiner. The peer with the
   * lowest addr (excluding the joiner) is elected so only one person responds.
   */
  private shouldShareJoinViewport(requesterAddr: string) {
    if (!this.channel || !this.getSceneBounds) {
      return false;
    }

    const candidates = [this.selfAddr, ...this.peers.keys()]
      .filter((addr) => addr !== requesterAddr)
      .sort();

    return candidates[0] === this.selfAddr;
  }

  private sendJoinViewport(targetAddr: string) {
    if (!this.getSceneBounds) {
      return;
    }

    this.sendRealtimeJson({
      t: "vj",
      a: this.selfAddr,
      f: targetAddr,
      b: this.getSceneBounds(),
    });
  }

  private pushCollaborators() {
    const collaborators = new Map<SocketId, Collaborator>();

    for (const [addr, peer] of this.peers) {
      if (addr === this.selfAddr) {
        continue;
      }

      collaborators.set(
        toBrandedType<SocketId>(addr),
        cursorStateToCollaborator(
          {
            pointer: peer.pointer,
            button: peer.button,
            selectedElementIds: peer.selectedElementIds,
            user: peer.user,
          },
          addr,
        ),
      );
    }

    this.api.updateScene({ collaborators });
    this.onPeersChanged?.(this.peers.size);
  }

  private removeStalePeers() {
    const now = Date.now();
    let changed = false;

    for (const [addr, peer] of this.peers) {
      if (now - peer.lastSeen > STALE_MS) {
        this.peers.delete(addr);
        changed = true;
      }
    }

    if (changed) {
      this.pushCollaborators();
    }
  }
}