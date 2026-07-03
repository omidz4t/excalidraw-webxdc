import { DEFAULT_CANVAS_BACKGROUND_PICKS } from "@excalidraw/common";
import { actionChangeViewBackgroundColor } from "@excalidraw/excalidraw/actions";
import {
  useAppProps,
  useExcalidrawActionManager,
} from "@excalidraw/excalidraw/components/App";
import { ButtonSeparator } from "@excalidraw/excalidraw/components/ButtonSeparator";
import { TopPicks } from "@excalidraw/excalidraw/components/ColorPicker/TopPicks";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";
import { useI18n } from "@excalidraw/excalidraw/i18n";

const WebxdcCanvasBackground = () => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const actionManager = useExcalidrawActionManager();
  const appProps = useAppProps();

  if (
    appState.viewModeEnabled ||
    !appProps.UIOptions.canvasActions.changeViewBackgroundColor
  ) {
    return null;
  }

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <div
        data-testid="canvas-background-label"
        style={{
          fontSize: "0.875rem",
          marginBottom: "0.25rem",
          marginLeft: "0.5rem",
        }}
      >
        {t("labels.canvasBackground")}
      </div>
      <div style={{ padding: "0 0.625rem" }}>
        <TopPicks
          activeColor={appState.viewBackgroundColor}
          onChange={(color) => {
            actionManager.executeAction(actionChangeViewBackgroundColor, "ui", {
              viewBackgroundColor: color,
            });
          }}
          type="canvasBackground"
          topPicks={DEFAULT_CANVAS_BACKGROUND_PICKS}
        />
        <ButtonSeparator />
        {actionManager.renderAction("changeViewBackgroundColor")}
      </div>
    </div>
  );
};

export default WebxdcCanvasBackground;