import { fromUint8Array, toUint8Array } from "js-base64";
import { describe, expect, it, vi } from "vitest";
import * as Y from "yjs";

import { encodeSyncStep1, processSyncMessage } from "./yjs-realtime-sync";
import { WebxdcRealtimeChannel } from "./webxdc-realtime-channel";

describe("WebxdcRealtimeChannel follow requests", () => {
  it("delivers follow requests addressed to self", () => {
    const api = { updateScene: vi.fn(), getAppState: () => ({}) };
    const channel = new WebxdcRealtimeChannel(
      api as never,
      "self-addr",
      { name: "Me" },
    );

    const onFollowRequest = vi.fn();
    channel.setOnFollowRequest(onFollowRequest);

    const payload = new TextEncoder().encode(
      JSON.stringify({
        t: "rfol",
        a: "alice",
        f: "self-addr",
        n: "Alice",
      }),
    );

    (channel as unknown as { onRealtimeData: (data: Uint8Array) => void })
      .onRealtimeData(payload);

    expect(onFollowRequest).toHaveBeenCalledWith({
      fromAddr: "alice",
      fromName: "Alice",
    });
  });

  it("sends join viewport to requester when elected host", () => {
    const api = { updateScene: vi.fn(), getAppState: () => ({}) };
    const channel = new WebxdcRealtimeChannel(
      api as never,
      "host-addr",
      { name: "Host" },
    );

    channel.join({
      joinRealtimeChannel: () => ({
        setListener: vi.fn(),
        send: vi.fn(),
        leave: vi.fn(),
      }),
    });

    (channel as unknown as { peers: Map<string, unknown> }).peers.set(
      "peer-b",
      { user: { name: "B" }, lastSeen: Date.now() },
    );

    const bounds: [number, number, number, number] = [0, 0, 100, 100];
    channel.setGetSceneBounds(() => bounds);

    const sendSpy = vi.spyOn(
      channel as unknown as { sendRealtimeJson: (msg: unknown) => void },
      "sendRealtimeJson",
    );

    const payload = new TextEncoder().encode(
      JSON.stringify({ t: "jreq", a: "newcomer" }),
    );

    (channel as unknown as { onRealtimeData: (data: Uint8Array) => void })
      .onRealtimeData(payload);

    expect(sendSpy).toHaveBeenCalledWith({
      t: "vj",
      a: "host-addr",
      f: "newcomer",
      b: bounds,
    });
  });

  it("does not send join viewport when not the elected host", () => {
    const api = { updateScene: vi.fn(), getAppState: () => ({}) };
    const channel = new WebxdcRealtimeChannel(
      api as never,
      "peer-z",
      { name: "Z" },
    );

    channel.join({
      joinRealtimeChannel: () => ({
        setListener: vi.fn(),
        send: vi.fn(),
        leave: vi.fn(),
      }),
    });

    (channel as unknown as { peers: Map<string, unknown> }).peers.set(
      "peer-a",
      { user: { name: "A" }, lastSeen: Date.now() },
    );

    channel.setGetSceneBounds(() => [0, 0, 50, 50]);

    const sendSpy = vi.spyOn(
      channel as unknown as { sendRealtimeJson: (msg: unknown) => void },
      "sendRealtimeJson",
    );

    const payload = new TextEncoder().encode(
      JSON.stringify({ t: "jreq", a: "newcomer" }),
    );

    (channel as unknown as { onRealtimeData: (data: Uint8Array) => void })
      .onRealtimeData(payload);

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("applies directed join viewport messages", () => {
    const api = { updateScene: vi.fn(), getAppState: () => ({}) };
    const channel = new WebxdcRealtimeChannel(
      api as never,
      "joiner",
      { name: "Joiner" },
    );

    const onJoinViewport = vi.fn();
    channel.setJoinViewportHandler(onJoinViewport);

    const bounds: [number, number, number, number] = [1, 2, 3, 4];
    const payload = new TextEncoder().encode(
      JSON.stringify({ t: "vj", a: "host", f: "joiner", b: bounds }),
    );

    (channel as unknown as { onRealtimeData: (data: Uint8Array) => void })
      .onRealtimeData(payload);

    expect(onJoinViewport).toHaveBeenCalledWith(bounds);
  });

  it("replies to broadcast syn with a directed SyncStep2", () => {
    const api = { updateScene: vi.fn(), getAppState: () => ({}) };
    const existing = new Y.Doc();
    existing.getArray("elements").push([
      new Y.Map(Object.entries({ id: "live-edit" })),
    ]);

    const channel = new WebxdcRealtimeChannel(
      api as never,
      "host-addr",
      { name: "Host" },
    );

    const sent: unknown[] = [];
    channel.join({
      joinRealtimeChannel: () => ({
        setListener: vi.fn(),
        send: (payload: Uint8Array) => {
          sent.push(JSON.parse(new TextDecoder().decode(payload)));
        },
        leave: vi.fn(),
      }),
    });

    channel.setSyncMessageHandler((data) =>
      processSyncMessage(existing, data, "test"),
    );

    const joiner = new Y.Doc();
    const step1 = encodeSyncStep1(joiner);
    const payload = new TextEncoder().encode(
      JSON.stringify({
        t: "syn",
        a: "joiner-addr",
        d: fromUint8Array(step1),
      }),
    );

    (channel as unknown as { onRealtimeData: (data: Uint8Array) => void })
      .onRealtimeData(payload);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      t: "syn",
      a: "host-addr",
      f: "joiner-addr",
    });

    const reply = sent[0] as { d: string };
    processSyncMessage(joiner, toUint8Array(reply.d), "test");
    expect(joiner.getArray("elements").length).toBe(1);
  });

  it("ignores follow requests for other peers", () => {
    const api = { updateScene: vi.fn(), getAppState: () => ({}) };
    const channel = new WebxdcRealtimeChannel(
      api as never,
      "self-addr",
      { name: "Me" },
    );

    const onFollowRequest = vi.fn();
    channel.setOnFollowRequest(onFollowRequest);

    const payload = new TextEncoder().encode(
      JSON.stringify({
        t: "rfol",
        a: "alice",
        f: "bob",
        n: "Alice",
      }),
    );

    (channel as unknown as { onRealtimeData: (data: Uint8Array) => void })
      .onRealtimeData(payload);

    expect(onFollowRequest).not.toHaveBeenCalled();
  });
});