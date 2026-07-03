/** Short grace so scroll events from updateScene settle before we compare. */
const SCROLL_EVENT_GRACE_MS = 200;

export type FollowViewportSnapshot = {
  scrollX: number;
  scrollY: number;
  zoom: number;
};

export const lastFollowSyncViewport: FollowViewportSnapshot = {
  scrollX: Number.NaN,
  scrollY: Number.NaN,
  zoom: Number.NaN,
};

let scrollEventGraceUntil = 0;

const snapshotMatches = (
  a: FollowViewportSnapshot,
  b: FollowViewportSnapshot,
) =>
  Math.abs(a.scrollX - b.scrollX) < 0.5 &&
  Math.abs(a.scrollY - b.scrollY) < 0.5 &&
  Math.abs(a.zoom - b.zoom) < 0.0001;

export const snapshotFromAppState = (appState: {
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
}): FollowViewportSnapshot => ({
  scrollX: appState.scrollX,
  scrollY: appState.scrollY,
  zoom: appState.zoom.value,
});

export const recordFollowSyncViewport = (snapshot: FollowViewportSnapshot) => {
  lastFollowSyncViewport.scrollX = snapshot.scrollX;
  lastFollowSyncViewport.scrollY = snapshot.scrollY;
  lastFollowSyncViewport.zoom = snapshot.zoom;
  scrollEventGraceUntil = Date.now() + SCROLL_EVENT_GRACE_MS;
};

/** Apply a remote follow viewport without treating the resulting scroll as user input. */
export const withFollowViewportSync = <T extends FollowViewportSnapshot>(
  fn: () => T,
) => {
  const snapshot = fn();
  recordFollowSyncViewport(snapshot);
  return snapshot;
};

export const clearFollowSyncViewport = () => {
  lastFollowSyncViewport.scrollX = Number.NaN;
  lastFollowSyncViewport.scrollY = Number.NaN;
  lastFollowSyncViewport.zoom = Number.NaN;
  scrollEventGraceUntil = 0;
};

/** Test helper: skip the post-sync grace window. */
export const endFollowScrollGraceForTests = () => {
  scrollEventGraceUntil = 0;
};

/** True when a scroll/zoom change should end following (user moved the view). */
export const shouldUnfollowOnScroll = (current: FollowViewportSnapshot) => {
  if (Date.now() < scrollEventGraceUntil) {
    return false;
  }

  if (
    Number.isNaN(lastFollowSyncViewport.scrollX) ||
    Number.isNaN(lastFollowSyncViewport.scrollY) ||
    Number.isNaN(lastFollowSyncViewport.zoom)
  ) {
    return false;
  }

  return !snapshotMatches(current, lastFollowSyncViewport);
};