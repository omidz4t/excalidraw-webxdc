import { getNonDeletedElements } from "@excalidraw/element";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import type * as Y from "yjs";

import { seedYElementsFromBootstrap } from "./bootstrap-scene";
import {
  applyAssetOperations,
  getDeltaOperationsForAssets,
} from "./y-excalidraw/diff";
import type { ExcalidrawBinding } from "./y-excalidraw";
import { yjsToExcalidraw } from "./y-excalidraw";

const MERGE_ORIGIN = { tag: "excalidraw-local-merge" } as unknown as ExcalidrawBinding;

/**
 * Strokes made while collab is still starting only exist in the local editor.
 * Merge them into Yjs before ExcalidrawBinding attaches, which otherwise resets the canvas.
 */
export const mergeLocalSceneIntoYdocBeforeBinding = (
  api: ExcalidrawImperativeAPI,
  yElements: Y.Array<Y.Map<unknown>>,
  yAssets: Y.Map<unknown>,
): boolean => {
  const localElements = getNonDeletedElements(api.getSceneElements());
  if (!localElements.length) {
    return false;
  }

  const yjsIds = new Set(yjsToExcalidraw(yElements).map((element) => element.id));
  const toMerge = localElements.filter((element) => !yjsIds.has(element.id));
  if (!toMerge.length) {
    return false;
  }

  seedYElementsFromBootstrap(yElements, toMerge);

  const files = api.getFiles();
  const newFiles: BinaryFiles = {};

  for (const element of toMerge) {
    if (
      "fileId" in element &&
      element.fileId &&
      files[element.fileId] &&
      !yAssets.has(element.fileId)
    ) {
      newFiles[element.fileId] = files[element.fileId];
    }
  }

  const assetDelta = getDeltaOperationsForAssets(new Set(yAssets.keys()), newFiles);
  if (assetDelta.operations.length > 0) {
    applyAssetOperations(yAssets, assetDelta.operations, MERGE_ORIGIN);
  }

  return true;
};