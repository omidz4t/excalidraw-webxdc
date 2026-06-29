import {
  COLOR_PALETTE,
  DEFAULT_GRID_SIZE,
  DEFAULT_GRID_STEP,
  THEME,
} from "@excalidraw/common";

import type { AppState } from "@excalidraw/excalidraw/types";
import type * as Y from "yjs";

/** AppState fields shared across all peers (canvas look & grid). */
export const SYNCED_SCENE_SETTING_KEYS = [
  "viewBackgroundColor",
  "gridSize",
  "gridStep",
  "gridModeEnabled",
  "objectsSnapModeEnabled",
  "theme",
] as const satisfies readonly (keyof AppState)[];

export type SyncedSceneSettings = Pick<
  AppState,
  (typeof SYNCED_SCENE_SETTING_KEYS)[number]
>;

const DEFAULT_SCENE_SETTINGS: SyncedSceneSettings = {
  viewBackgroundColor: COLOR_PALETTE.white,
  gridSize: DEFAULT_GRID_SIZE,
  gridStep: DEFAULT_GRID_STEP,
  gridModeEnabled: false,
  objectsSnapModeEnabled: false,
  theme: THEME.LIGHT,
};

export const pickSceneSettings = (state: AppState): SyncedSceneSettings => ({
  viewBackgroundColor: state.viewBackgroundColor,
  gridSize: state.gridSize,
  gridStep: state.gridStep,
  gridModeEnabled: state.gridModeEnabled,
  objectsSnapModeEnabled: state.objectsSnapModeEnabled,
  theme: state.theme,
});

export const areSceneSettingsSame = (
  a: SyncedSceneSettings,
  b: SyncedSceneSettings,
) => SYNCED_SCENE_SETTING_KEYS.every((key) => a[key] === b[key]);

export const sceneSettingsFromYMap = (
  yMap: Y.Map<unknown>,
): SyncedSceneSettings | null => {
  if (yMap.size === 0) {
    return null;
  }

  const settings = { ...DEFAULT_SCENE_SETTINGS };

  for (const key of SYNCED_SCENE_SETTING_KEYS) {
    if (yMap.has(key)) {
      (settings as Record<string, unknown>)[key] = yMap.get(key);
    }
  }

  return settings;
};

export const writeSceneSettingsToYMap = (
  yMap: Y.Map<unknown>,
  settings: SyncedSceneSettings,
  origin: unknown,
) => {
  yMap.doc?.transact(() => {
    for (const key of SYNCED_SCENE_SETTING_KEYS) {
      yMap.set(key, settings[key]);
    }
  }, origin);
};