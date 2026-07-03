import { describe, expect, it } from "vitest";
import * as Y from "yjs";

import { mergeLocalSceneIntoYdocBeforeBinding } from "./merge-local-scene";
import { yjsToExcalidraw } from "./y-excalidraw";

import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const makeElement = (id: string, index: string): ExcalidrawElement =>
  ({
    id,
    index,
    version: 1,
    versionNonce: 1,
    type: "rectangle",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    angle: 0,
    strokeColor: "#000000",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    isDeleted: false,
    seed: 1,
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
  }) as ExcalidrawElement;

describe("mergeLocalSceneIntoYdocBeforeBinding", () => {
  it("copies local-only elements into an empty ydoc", () => {
    const ydoc = new Y.Doc();
    const yElements = ydoc.getArray<Y.Map<unknown>>("elements");
    const yAssets = ydoc.getMap("assets");
    const local = makeElement("early-stroke", "a0");

    const api = {
      getSceneElements: () => [local],
      getFiles: () => ({}),
    } as unknown as ExcalidrawImperativeAPI;

    expect(mergeLocalSceneIntoYdocBeforeBinding(api, yElements, yAssets)).toBe(
      true,
    );
    expect(yjsToExcalidraw(yElements).map((element) => element.id)).toEqual([
      "early-stroke",
    ]);
  });
});