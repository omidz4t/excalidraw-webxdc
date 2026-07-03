import { describe, expect, it, vi } from "vitest";
import * as Y from "yjs";

import { yjsToExcalidraw } from "./y-excalidraw";
import {
  BOOTSTRAP_SCENE_FILENAME,
  hasBootstrapSceneInPackage,
  seedYElementsFromBootstrap,
} from "./bootstrap-scene";
import { PACKAGE_MANIFEST_FILENAME } from "./package-manifest";

import type { ExcalidrawElement } from "@excalidraw/element/types";

const makeElement = (
  id: string,
  index: string,
  version = 1,
): ExcalidrawElement =>
  ({
    id,
    index,
    version,
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

describe("hasBootstrapSceneInPackage", () => {
  it("returns true when package-manifest lists the bootstrap file", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: 1,
          files: ["index.html", BOOTSTRAP_SCENE_FILENAME],
        }),
      } as Response);

    await expect(hasBootstrapSceneInPackage()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(PACKAGE_MANIFEST_FILENAME),
    );
    fetchMock.mockRestore();
  });

  it("returns false when bootstrap file is not in the manifest", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        version: 1,
        files: ["index.html", "manifest.toml"],
      }),
    } as Response);

    await expect(hasBootstrapSceneInPackage()).resolves.toBe(false);
    fetchMock.mockRestore();
  });
});

describe("seedYElementsFromBootstrap", () => {
  it("seeds multiple elements without fractional-indexing errors", () => {
    const ydoc = new Y.Doc();
    const yElements = ydoc.getArray<Y.Map<unknown>>("elements");
    const elements = [
      makeElement("a", "a0"),
      makeElement("b", "a1"),
      makeElement("c", "a2"),
      makeElement("d", "a3"),
    ];

    expect(() => {
      seedYElementsFromBootstrap(yElements, elements);
    }).not.toThrow();

    expect(yElements.length).toBe(4);
    expect(yjsToExcalidraw(yElements).map((element) => element.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("skips deleted elements", () => {
    const ydoc = new Y.Doc();
    const yElements = ydoc.getArray<Y.Map<unknown>>("elements");
    const deleted = { ...makeElement("gone", "a4"), isDeleted: true };

    seedYElementsFromBootstrap(yElements, [
      makeElement("keep", "a0"),
      deleted,
    ]);

    expect(yElements.length).toBe(1);
    expect(yjsToExcalidraw(yElements)[0].id).toBe("keep");
  });
});