import { cleanAppStateForExport } from "@excalidraw/excalidraw/appState";
import { isValidExcalidrawData } from "@excalidraw/excalidraw/data/json";
import {
  restoreAppState,
  restoreElements,
} from "@excalidraw/excalidraw/data/restore";
import { getNonDeletedElements } from "@excalidraw/element";
import { generateNKeysBetween } from "@excalidraw/fractional-indexing";

import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import * as Y from "yjs";

import {
  applyAssetOperations,
  getDeltaOperationsForAssets,
} from "./y-excalidraw/diff";
import type { ExcalidrawBinding } from "./y-excalidraw";
import {
  PACKAGE_MANIFEST_FILENAME,
  type WebxdcPackageManifest,
} from "./package-manifest";
import {
  pickSceneSettings,
  writeSceneSettingsToYMap,
} from "./y-excalidraw/scene-settings";

export const BOOTSTRAP_SCENE_FILENAME = "scene-bootstrap.excalidraw";

/** Shared WebXDC packages list this file in package-manifest.json; regular apps do not. */
export const hasBootstrapSceneInPackage = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      new URL(`./${PACKAGE_MANIFEST_FILENAME}`, window.location.href).href,
    );
    if (!response.ok) {
      return false;
    }

    const manifest = (await response.json()) as WebxdcPackageManifest;
    return (
      Array.isArray(manifest.files) &&
      manifest.files.includes(BOOTSTRAP_SCENE_FILENAME)
    );
  } catch {
    return false;
  }
};

const BOOTSTRAP_ORIGIN = { tag: "excalidraw-bootstrap" } as unknown as ExcalidrawBinding;

const sortByFractionalIndex = (elements: readonly ExcalidrawElement[]) =>
  [...getNonDeletedElements(elements)].sort((a, b) => {
    const left = a.index ?? "";
    const right = b.index ?? "";
    return left < right ? -1 : left > right ? 1 : 0;
  });

/** Seed Yjs directly with stable fractional positions — avoids getDeltaOperationsForElements move bugs on empty docs. */
export const seedYElementsFromBootstrap = (
  yElements: Y.Array<Y.Map<unknown>>,
  elements: readonly ExcalidrawElement[],
) => {
  const sorted = sortByFractionalIndex(elements);
  if (!sorted.length) {
    return;
  }

  const needsGeneratedKeys = sorted.some((element) => !element.index);
  const generatedKeys = needsGeneratedKeys
    ? generateNKeysBetween(null, null, sorted.length)
    : [];

  yElements.doc!.transact(() => {
    sorted.forEach((element, index) => {
      const pos = element.index ?? generatedKeys[index];
      yElements.push([
        new Y.Map(
          Object.entries({
            pos,
            el: { ...element },
          }),
        ),
      ]);
    });
  }, BOOTSTRAP_ORIGIN);
};

export const fetchBootstrapScene = async (): Promise<{
  elements: ReturnType<typeof restoreElements>;
  appState: ReturnType<typeof restoreAppState>;
  files: BinaryFiles;
} | null> => {
  try {
    const response = await fetch(`./${BOOTSTRAP_SCENE_FILENAME}`);
    if (!response.ok) {
      return null;
    }

    const data = JSON.parse(await response.text());
    if (!isValidExcalidrawData(data)) {
      return null;
    }

    return {
      elements: restoreElements(data.elements, null, {
        repairBindings: true,
        deleteInvisibleElements: true,
      }),
      appState: restoreAppState(
        cleanAppStateForExport(data.appState || {}),
        null,
      ),
      files: data.files || {},
    };
  } catch {
    return null;
  }
};

export const seedYdocFromBootstrapIfEmpty = async (
  yElements: Y.Array<Y.Map<unknown>>,
  yAssets: Y.Map<unknown>,
  ySceneSettings: Y.Map<unknown>,
): Promise<boolean> => {
  if (yElements.length > 0) {
    return false;
  }

  if (!(await hasBootstrapSceneInPackage())) {
    return false;
  }

  const bootstrap = await fetchBootstrapScene();
  if (!bootstrap) {
    return false;
  }

  seedYElementsFromBootstrap(yElements, bootstrap.elements);

  const assetDelta = getDeltaOperationsForAssets(new Set(), bootstrap.files);
  if (assetDelta.operations.length > 0) {
    applyAssetOperations(yAssets, assetDelta.operations, BOOTSTRAP_ORIGIN);
  }

  writeSceneSettingsToYMap(
    ySceneSettings,
    pickSceneSettings(bootstrap.appState as AppState),
    BOOTSTRAP_ORIGIN,
  );

  return true;
};