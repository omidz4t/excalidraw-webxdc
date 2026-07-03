import { afterEach, describe, expect, it } from "vitest";

import {
  clearFollowSyncViewport,
  endFollowScrollGraceForTests,
  lastFollowSyncViewport,
  recordFollowSyncViewport,
  shouldUnfollowOnScroll,
  withFollowViewportSync,
} from "./follow-viewport-sync-ref";

describe("follow viewport sync", () => {
  afterEach(() => {
    clearFollowSyncViewport();
  });

  it("does not unfollow while scroll matches the last remote sync", () => {
    clearFollowSyncViewport();
    recordFollowSyncViewport({ scrollX: 10, scrollY: 20, zoom: 1 });
    endFollowScrollGraceForTests();

    expect(
      shouldUnfollowOnScroll({ scrollX: 10, scrollY: 20, zoom: 1 }),
    ).toBe(false);
  });

  it("unfollows when scroll diverges from the last remote sync", () => {
    clearFollowSyncViewport();
    recordFollowSyncViewport({ scrollX: 10, scrollY: 20, zoom: 1 });
    endFollowScrollGraceForTests();

    expect(
      shouldUnfollowOnScroll({ scrollX: 50, scrollY: 20, zoom: 1 }),
    ).toBe(true);
  });

  it("records viewport snapshots from withFollowViewportSync", () => {
    clearFollowSyncViewport();
    withFollowViewportSync(() => ({
      scrollX: 3,
      scrollY: 4,
      zoom: 0.8,
    }));

    expect(lastFollowSyncViewport).toEqual({
      scrollX: 3,
      scrollY: 4,
      zoom: 0.8,
    });
  });
});