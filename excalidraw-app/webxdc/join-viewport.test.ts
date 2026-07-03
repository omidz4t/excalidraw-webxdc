import { describe, expect, it, vi } from "vitest";

import {
  centerViewportOnJoin,
  sceneCoordsAtViewportCenter,
} from "./join-viewport";

describe("centerViewportOnJoin", () => {
  it("scrolls to content when the scene has elements", () => {
    const scrollToContent = vi.fn();
    const updateScene = vi.fn();
    const api = {
      getSceneElements: () => [{ id: "a" }],
      getAppState: () => ({
        width: 800,
        height: 600,
        zoom: { value: 1 },
      }),
      scrollToContent,
      updateScene,
    };

    centerViewportOnJoin(api as never);

    expect(scrollToContent).toHaveBeenCalledWith([{ id: "a" }], {
      fitToViewport: true,
      animate: false,
    });
    expect(updateScene).not.toHaveBeenCalled();
  });

  it("centers scene origin when the canvas is empty", () => {
    const scrollToContent = vi.fn();
    const updateScene = vi.fn();
    const api = {
      getSceneElements: () => [],
      getAppState: () => ({
        width: 800,
        height: 600,
        zoom: { value: 1 },
      }),
      scrollToContent,
      updateScene,
    };

    centerViewportOnJoin(api as never);

    expect(scrollToContent).not.toHaveBeenCalled();
    expect(updateScene).toHaveBeenCalledWith({
      appState: { scrollX: 400, scrollY: 300 },
      captureUpdate: expect.anything(),
    });
  });
});

describe("sceneCoordsAtViewportCenter", () => {
  it("maps the viewport center to scene coordinates", () => {
    const api = {
      getAppState: () => ({
        width: 800,
        height: 600,
        offsetLeft: 10,
        offsetTop: 20,
        scrollX: 100,
        scrollY: 50,
        zoom: { value: 2 },
      }),
    };

    expect(sceneCoordsAtViewportCenter(api as never)).toEqual({
      x: 100,
      y: 100,
    });
  });
});