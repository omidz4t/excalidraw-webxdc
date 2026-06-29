import { MainMenu } from "@excalidraw/excalidraw/index";

import { importImagesViaWebxdc } from "./import-image";

const WebxdcMainMenu = () => {
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
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Preferences.BoxSelectionMode />
      <MainMenu.DefaultItems.Preferences.ToggleToolLock />
      <MainMenu.DefaultItems.Preferences.ToggleSnapMode />
      <MainMenu.DefaultItems.Preferences.ToggleGridMode />
      <MainMenu.DefaultItems.Preferences.ToggleZenMode />
      <MainMenu.DefaultItems.Preferences.ToggleViewMode />
      <MainMenu.DefaultItems.Preferences.ToggleElementProperties />
      <MainMenu.DefaultItems.Preferences.ToggleArrowBinding />
      <MainMenu.DefaultItems.Preferences.ToggleMidpointSnapping />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme allowSystemTheme={false} />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
};

export default WebxdcMainMenu;