import { CaptureUpdateAction } from "@excalidraw/element";

import { register } from "./register";

import type { AppState } from "../types";

export const actionToggleMinimap = register({
  name: "minimap",
  label: "labels.toggleMinimap",
  viewMode: true,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => appState.minimapEnabled,
  },
  perform(elements, appState) {
    return {
      appState: {
        ...appState,
        minimapEnabled: !this.checked!(appState),
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  checked: (appState: AppState) => appState.minimapEnabled,
});