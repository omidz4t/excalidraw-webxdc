import { describe, expect, it } from "vitest";
import * as Y from "yjs";

import { lastKnownElementsFromYArray, yjsToExcalidraw } from "./helpers";

import type { ExcalidrawElement } from "@excalidraw/element/types";

const makeElement = (id: string): ExcalidrawElement =>
  ({
    id,
    version: 1,
    index: "a0",
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

describe("yjs element helpers", () => {
  it("filters corrupt yjs rows without throwing", () => {
    const ydoc = new Y.Doc();
    const yElements = ydoc.getArray<Y.Map<unknown>>("elements");

    yElements.push([
      new Y.Map(Object.entries({ pos: "a0" })),
      new Y.Map(
        Object.entries({
          pos: "a1",
          el: { ...makeElement("valid") },
        }),
      ),
    ]);

    expect(yjsToExcalidraw(yElements).map((element) => element.id)).toEqual([
      "valid",
    ]);
    expect(lastKnownElementsFromYArray(yElements).map((entry) => entry.id)).toEqual(
      ["valid"],
    );
  });
});