import {
  deriveStylesPanelMode,
  type EditorInterface,
  type StylesPanelMode,
} from "@excalidraw/common";

const isWebxdcBuild = import.meta.env.VITE_APP_WEBXDC === "true";

/** WebXDC uses a bottom horizontal shape-actions bar on desktop/tablet. */
export const resolveStylesPanelMode = (
  editorInterface: EditorInterface,
): StylesPanelMode => {
  if (isWebxdcBuild && editorInterface.formFactor !== "phone") {
    return "bottom";
  }

  return deriveStylesPanelMode(editorInterface);
};