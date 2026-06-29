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
      <MainMenu.DefaultItems.Preferences
        additionalItems={
          <>
            <MainMenu.Separator />
            <MainMenu.DefaultItems.ToggleTheme allowSystemTheme={false} />
          </>
        }
      />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
};

export default WebxdcMainMenu;