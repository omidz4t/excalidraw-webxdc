import { THEME } from "@excalidraw/excalidraw";
import { createStore, get, set } from "idb-keyval";

import { STORAGE_KEYS } from "../app_constants";

import type { Theme } from "@excalidraw/element/types";

const THEME_KEY = "theme";

const settingsStore = createStore(
  `${STORAGE_KEYS.IDB_WEBXDC_SETTINGS}-db`,
  `${STORAGE_KEYS.IDB_WEBXDC_SETTINGS}-store`,
);

const isTheme = (value: unknown): value is Theme =>
  value === THEME.LIGHT || value === THEME.DARK;

export const applyThemeToDocument = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === THEME.DARK);
  localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_THEME, theme);
};

export const readCachedTheme = (): Theme => {
  const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_THEME);
  return isTheme(cached) ? cached : THEME.LIGHT;
};

export const loadWebxdcTheme = async (): Promise<Theme> => {
  try {
    const stored = await get<Theme>(THEME_KEY, settingsStore);
    if (isTheme(stored)) {
      applyThemeToDocument(stored);
      return stored;
    }
  } catch (error) {
    console.warn("Failed to load theme from IndexedDB:", error);
  }

  const cached = readCachedTheme();
  applyThemeToDocument(cached);
  return cached;
};

export const saveWebxdcTheme = async (theme: Theme): Promise<void> => {
  applyThemeToDocument(theme);
  try {
    await set(THEME_KEY, theme, settingsStore);
  } catch (error) {
    console.warn("Failed to save theme to IndexedDB:", error);
  }
};