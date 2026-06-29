import { THEME } from "@excalidraw/excalidraw";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import type { Theme } from "@excalidraw/element/types";

import {
  applyThemeToDocument,
  loadWebxdcTheme,
  readCachedTheme,
  saveWebxdcTheme,
} from "./theme-storage";

export const useWebxdcAppTheme = () => {
  const [appTheme, setAppThemeState] = useState<Theme>(readCachedTheme);

  useEffect(() => {
    loadWebxdcTheme().then(setAppThemeState);
  }, []);

  useLayoutEffect(() => {
    applyThemeToDocument(appTheme);
  }, [appTheme]);

  const setAppTheme = useCallback((theme: Theme | "system") => {
    if (theme === "system") {
      return;
    }
    setAppThemeState(theme);
    saveWebxdcTheme(theme);
  }, []);

  return { editorTheme: appTheme, appTheme, setAppTheme };
};