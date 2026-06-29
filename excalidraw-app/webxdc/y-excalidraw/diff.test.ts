import { describe, expect, it } from "vitest";
import * as Y from "yjs";

import {
  applyElementOperations,
  getDeltaOperationsForElements,
} from "./diff";

import type { ExcalidrawElement } from "@excalidraw/element/types";

const ORIGIN = { tag: "test-binding" };

const makeElement = (id: string, version = 1): ExcalidrawElement =>
  ({
    id,
    version,
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

const seedYElements = (
  yElements: Y.Array<Y.Map<unknown>>,
  elements: ExcalidrawElement[],
) => {
  yElements.doc!.transact(() => {
    for (const [index, element] of elements.entries()) {
      yElements.push([
        new Y.Map(
          Object.entries({
            pos: `a${index}`,
            el: { ...element },
          }),
        ),
      ]);
    }
  }, ORIGIN);
};

describe("applyElementOperations bulkDelete", () => {
  it("deletes multiple non-consecutive elements without Length exceeded", () => {
    const ydoc = new Y.Doc();
    const yElements = ydoc.getArray<Y.Map<unknown>>("elements");
    const elements = [
      makeElement("a"),
      makeElement("b"),
      makeElement("c"),
      makeElement("d"),
    ];

    seedYElements(yElements, elements);

    const lastKnown = elements.map((element, index) => ({
      id: element.id,
      version: element.version,
      pos: `a${index}`,
    }));

    const remaining = [elements[1], elements[3]];
    const { operations } = getDeltaOperationsForElements(
      lastKnown,
      remaining,
    );

    expect(() => {
      applyElementOperations(yElements, operations, ORIGIN as never);
    }).not.toThrow();

    expect(yElements.length).toBe(2);
    expect(
      yElements
        .toArray()
        .map((entry) => (entry.get("el") as ExcalidrawElement).id),
    ).toEqual(["b", "d"]);
  });
});