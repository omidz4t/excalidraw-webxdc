import { DEFAULT_CANVAS_BACKGROUND_PICKS } from "@excalidraw/common";
import { actionChangeViewBackgroundColor } from "@excalidraw/excalidraw/actions";
import {
  useAppProps,
  useExcalidrawActionManager,
} from "@excalidraw/excalidraw/components/App";
import { TopPicks } from "@excalidraw/excalidraw/components/ColorPicker/TopPicks";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";
import { useI18n } from "@excalidraw/excalidraw/i18n";

import "./WebxdcContextMenuBackground.scss";

const WebxdcContextMenuBackground = () => {
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
    <div
      className="webxdc-context-menu-background"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className="webxdc-context-menu-background__label"
        data-testid="context-menu-canvas-background-label"
      >
        {t("labels.canvasBackground")}
      </div>
      <div className="webxdc-context-menu-background__picker">
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
        {actionManager.renderAction("changeViewBackgroundColor")}
      </div>
    </div>
  );
};

export default WebxdcContextMenuBackground;