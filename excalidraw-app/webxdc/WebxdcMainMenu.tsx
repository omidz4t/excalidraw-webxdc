import { MainMenu, useExcalidrawAPI } from "@excalidraw/excalidraw/index";

import { useAtom } from "../app-jotai";
import { importImagesViaWebxdc } from "./import-image";
import { webxdcPersistRef } from "./persist-ref";
import {
  autosaveToChatAtom,
  saveWebxdcAutosaveSetting,
} from "./webxdc-settings";
import { openWebxdcHelp } from "./webxdc-help-state";
import {
  exportSceneToFile,
  importSceneViaWebxdc,
  shareSceneToChat,
  shareWebxdcWithSceneToChat,
} from "./scene-io";
import WebxdcCanvasBackground from "./WebxdcCanvasBackground";

const EMPTY_CANVAS_MESSAGE = "Cannot export an empty canvas.";
const SHARE_WEBXDC_UNAVAILABLE_MESSAGE =
  "Share as WebXDC is only available in the packaged Excalidraw app (excalidraw.xdc), not in the dev server.";
const SHARE_WEBXDC_PACK_FAILED_MESSAGE =
  "Could not build a WebXDC package from this session. Rebuild excalidraw.xdc (make build-webxdc), attach the new app, then try again.";

const WebxdcMainMenu = () => {
  const excalidrawAPI = useExcalidrawAPI();
  const [autosaveToChat, setAutosaveToChat] = useAtom(autosaveToChatAtom);

  const requireApi = () => {
    if (!excalidrawAPI) {
      return null;
    }
    return excalidrawAPI;
  };

  return (
    <MainMenu>
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.Item
        onSelect={() => {
          void importImagesViaWebxdc();
        }}
      >
        Insert image…
      </MainMenu.Item>
      <MainMenu.Item
        onSelect={() => {
          webxdcPersistRef.current?.();
        }}
      >
        Save to chat
      </MainMenu.Item>
      <MainMenu.Item
        onSelect={() => {
          const api = requireApi();
          if (!api) {
            return;
          }
          const result = exportSceneToFile(api);
          if (!result.ok && result.reason === "empty") {
            window.alert(EMPTY_CANVAS_MESSAGE);
          }
        }}
      >
        Export to file…
      </MainMenu.Item>
      <MainMenu.Item
        onSelect={() => {
          const api = requireApi();
          if (!api) {
            return;
          }
          void shareSceneToChat(api).then((result) => {
            if (!result.ok && result.reason === "empty") {
              window.alert(EMPTY_CANVAS_MESSAGE);
            }
          });
        }}
      >
        Share scene file to chat…
      </MainMenu.Item>
      <MainMenu.Item
        onSelect={() => {
          const api = requireApi();
          if (!api) {
            return;
          }
          void shareWebxdcWithSceneToChat(api).then((result) => {
            if (!result.ok) {
              if (result.reason === "empty") {
                window.alert(EMPTY_CANVAS_MESSAGE);
              } else if (result.reason === "not-packaged") {
                window.alert(SHARE_WEBXDC_UNAVAILABLE_MESSAGE);
              } else if (result.reason === "pack-failed") {
                window.alert(SHARE_WEBXDC_PACK_FAILED_MESSAGE);
              }
            }
          });
        }}
      >
        Share as WebXDC with this drawing…
      </MainMenu.Item>
      <MainMenu.Item
        onSelect={() => {
          const api = requireApi();
          if (!api) {
            return;
          }
          void importSceneViaWebxdc(api);
        }}
      >
        Import scene…
      </MainMenu.Item>
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Preferences.BoxSelectionMode />
      <MainMenu.DefaultItems.Preferences.ToggleToolLock />
      <MainMenu.DefaultItems.Preferences.ToggleSnapMode />
      <MainMenu.DefaultItems.Preferences.ToggleGridMode />
      <MainMenu.DefaultItems.Preferences.ToggleMinimap />
      <MainMenu.DefaultItems.Preferences.ToggleZenMode />
      <MainMenu.DefaultItems.Preferences.ToggleViewMode />
      <MainMenu.DefaultItems.Preferences.ToggleElementProperties />
      <MainMenu.DefaultItems.Preferences.ToggleArrowBinding />
      <MainMenu.DefaultItems.Preferences.ToggleMidpointSnapping />
      <MainMenu.Item
        onSelect={(event) => {
          event.preventDefault();
          const next = !autosaveToChat;
          setAutosaveToChat(next);
          void saveWebxdcAutosaveSetting(next);
        }}
      >
        {autosaveToChat ? "✓ Auto-save to chat" : "Auto-save to chat"}
      </MainMenu.Item>
      <MainMenu.Separator />
      <MainMenu.Item onSelect={() => openWebxdcHelp()}>Help</MainMenu.Item>
      <MainMenu.DefaultItems.ToggleTheme allowSystemTheme={false} />
      <WebxdcCanvasBackground />
    </MainMenu>
  );
};

export default WebxdcMainMenu;