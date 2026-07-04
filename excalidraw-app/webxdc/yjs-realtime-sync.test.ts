import { describe, expect, it } from "vitest";
import * as Y from "yjs";

import * as decoding from "lib0/decoding";

import {
  encodeSyncStep1,
  messageYjsSyncStep2,
  processSyncMessage,
} from "./yjs-realtime-sync";

const ORIGIN = "test-sync";

describe("yjs-realtime-sync", () => {
  it("syncs an empty joiner with an existing peer via SyncStep1/SyncStep2", () => {
    const existing = new Y.Doc();
    const joiner = new Y.Doc();

    existing.getArray("elements").push([
      new Y.Map(Object.entries({ id: "rect-1" })),
    ]);

    const step1 = encodeSyncStep1(joiner);
    const reply = processSyncMessage(existing, step1, ORIGIN);
    expect(reply).not.toBeNull();

    processSyncMessage(joiner, reply!, ORIGIN);
    expect(joiner.getArray("elements").length).toBe(1);
  });

  it("replies with SyncStep2 when receiving SyncStep1", () => {
    const peerA = new Y.Doc();
    const peerB = new Y.Doc();

    peerA.getMap("sceneSettings").set("gridSize", 20);

    const step1FromB = encodeSyncStep1(peerB);
    const replyFromA = processSyncMessage(peerA, step1FromB, ORIGIN);

    expect(replyFromA).not.toBeNull();
    expect(decoding.readVarUint(decoding.createDecoder(replyFromA!))).toBe(
      messageYjsSyncStep2,
    );
    processSyncMessage(peerB, replyFromA!, ORIGIN);
    expect(peerB.getMap("sceneSettings").get("gridSize")).toBe(20);
  });

  it("converges when both peers exchange SyncStep1 symmetrically", () => {
    const peerA = new Y.Doc();
    const peerB = new Y.Doc();

    peerA.getArray("elements").push([
      new Y.Map(Object.entries({ id: "from-a" })),
    ]);
    peerB.getArray("elements").push([
      new Y.Map(Object.entries({ id: "from-b" })),
    ]);

    const step1A = encodeSyncStep1(peerA);
    const step1B = encodeSyncStep1(peerB);

    const replyAToB = processSyncMessage(peerA, step1B, ORIGIN);
    const replyBToA = processSyncMessage(peerB, step1A, ORIGIN);

    processSyncMessage(peerA, replyBToA!, ORIGIN);
    processSyncMessage(peerB, replyAToB!, ORIGIN);

    expect(peerA.getArray("elements").length).toBe(2);
    expect(peerB.getArray("elements").length).toBe(2);
  });

  it("sends only a delta on repeat SyncStep1 after the first full sync", () => {
    const existing = new Y.Doc();
    const joiner = new Y.Doc();

    existing.getArray("elements").push([
      new Y.Map(Object.entries({ id: "seed" })),
    ]);

    const firstReply = processSyncMessage(
      existing,
      encodeSyncStep1(joiner),
      ORIGIN,
    );
    processSyncMessage(joiner, firstReply!, ORIGIN);

    const secondReply = processSyncMessage(
      existing,
      encodeSyncStep1(joiner),
      ORIGIN,
    );
    expect(secondReply).not.toBeNull();
    expect(secondReply!.byteLength).toBeLessThan(firstReply!.byteLength);
  });
});