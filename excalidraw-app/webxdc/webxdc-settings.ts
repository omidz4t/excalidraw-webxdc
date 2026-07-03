import { atom } from "jotai";
import { createStore, get, set } from "idb-keyval";

import { STORAGE_KEYS } from "../app_constants";

const AUTOSAVE_TO_CHAT_KEY = "autosaveToChat";

const settingsStore = createStore(
  `${STORAGE_KEYS.IDB_WEBXDC_SETTINGS}-db`,
  `${STORAGE_KEYS.IDB_WEBXDC_SETTINGS}-store`,
);

/** Persist drawing to chat via sendUpdate while editing. Off by default — use realtime + Ctrl+S. */
export const DEFAULT_AUTOSAVE_TO_CHAT = false;

export const autosaveToChatAtom = atom(DEFAULT_AUTOSAVE_TO_CHAT);

export const loadWebxdcAutosaveSetting = async (): Promise<boolean> => {
  try {
    const stored = await get<boolean>(AUTOSAVE_TO_CHAT_KEY, settingsStore);
    if (typeof stored === "boolean") {
      return stored;
    }
  } catch (error) {
    console.warn("Failed to load autosave setting from IndexedDB:", error);
  }

  return DEFAULT_AUTOSAVE_TO_CHAT;
};

export const saveWebxdcAutosaveSetting = async (
  enabled: boolean,
): Promise<void> => {
  try {
    await set(AUTOSAVE_TO_CHAT_KEY, enabled, settingsStore);
  } catch (error) {
    console.warn("Failed to save autosave setting to IndexedDB:", error);
  }
};