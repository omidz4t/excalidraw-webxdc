import { viewportCoordsToSceneCoords } from "@excalidraw/common";
import { CaptureUpdateAction } from "@excalidraw/element";
import { centerScrollOn } from "@excalidraw/excalidraw/scene/scroll";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import type { SceneBounds } from "./webxdc-realtime-channel";
import type { WebxdcRealtimeChannel } from "./webxdc-realtime-channel";

export const JOIN_VIEWPORT_WAIT_MS = 900;

/** Center the canvas on existing content, or on scene origin when empty. */
export const centerViewportOnJoin = (api: ExcalidrawImperativeAPI) => {
  const elements = api.getSceneElements();

  if (elements.length > 0) {
    api.scrollToContent(elements, {
      fitToViewport: true,
      animate: false,
    });
    return;
  }

  const appState = api.getAppState();
  const { scrollX, scrollY } = centerScrollOn({
    scenePoint: { x: 0, y: 0 },
    viewportDimensions: { width: appState.width, height: appState.height },
    zoom: appState.zoom,
  });

  api.updateScene({
    appState: { scrollX, scrollY },
    captureUpdate: CaptureUpdateAction.NEVER,
  });
};

export const sceneCoordsAtViewportCenter = (
  api: ExcalidrawImperativeAPI,
): { x: number; y: number } => {
  const appState = api.getAppState();
  return viewportCoordsToSceneCoords(
    {
      clientX: appState.offsetLeft + appState.width / 2,
      clientY: appState.offsetTop + appState.height / 2,
    },
    appState,
  );
};

/** Wait until Excalidraw has measured the canvas, then run `fn`. */
export const whenViewportReady = (
  api: ExcalidrawImperativeAPI,
  fn: () => void,
) => {
  const attempt = () => {
    const { width, height } = api.getAppState();
    if (!width || !height) {
      requestAnimationFrame(attempt);
      return;
    }
    fn();
  };

  requestAnimationFrame(attempt);
};

export const announceJoinViewport = (
  api: ExcalidrawImperativeAPI,
  realtime: WebxdcRealtimeChannel,
  options: {
    syncFromPeers: boolean;
    applySharedViewport: (bounds: SceneBounds) => void;
  },
) => {
  whenViewportReady(api, () => {
    let settled = false;

    const finish = (useDefaultCenter: boolean) => {
      if (settled) {
        return;
      }
      settled = true;

      if (useDefaultCenter) {
        centerViewportOnJoin(api);
      }

      const { x, y } = sceneCoordsAtViewportCenter(api);
      realtime.updatePointer({ x, y, tool: "pointer" }, "up", {
        immediate: true,
      });
    };

    if (options.syncFromPeers && realtime.isAvailable) {
      let timeoutId = 0;

      const onJoinViewport = (bounds: SceneBounds) => {
        window.clearTimeout(timeoutId);
        realtime.setJoinViewportHandler(() => {});
        options.applySharedViewport(bounds);
        finish(false);
      };

      realtime.setJoinViewportHandler(onJoinViewport);
      realtime.requestJoinViewport();

      timeoutId = window.setTimeout(() => {
        realtime.setJoinViewportHandler(() => {});
        finish(true);
      }, JOIN_VIEWPORT_WAIT_MS);
      return;
    }

    finish(true);
  });
};