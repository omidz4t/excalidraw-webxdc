import { describe, expect, it, vi } from "vitest";

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