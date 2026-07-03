import {
  getCommonBounds,
  getElementBounds,
  getVisibleSceneBounds,
  isInvisiblySmallElement,
} from "@excalidraw/element";

import type { SceneBounds } from "@excalidraw/element";
import type {
  ElementsMap,
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";

import type { AppState } from "../types";

export const MINIMAP_WIDTH = 140;
export const MINIMAP_HEIGHT = 100;
export const MINIMAP_PADDING = 4;

export type MinimapSceneBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type MinimapTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const getMinimapSceneBounds = (
  elements: readonly NonDeletedExcalidrawElement[],
  elementsMap: ElementsMap,
  viewportBounds: SceneBounds,
): MinimapSceneBounds => {
  const [vpMinX, vpMinY, vpMaxX, vpMaxY] = viewportBounds;

  if (!elements.length) {
    return {
      minX: vpMinX,
      minY: vpMinY,
      maxX: vpMaxX,
      maxY: vpMaxY,
    };
  }

  const [elementsMinX, elementsMinY, elementsMaxX, elementsMaxY] =
    getCommonBounds(elements, elementsMap);

  return {
    minX: Math.min(elementsMinX, vpMinX),
    minY: Math.min(elementsMinY, vpMinY),
    maxX: Math.max(elementsMaxX, vpMaxX),
    maxY: Math.max(elementsMaxY, vpMaxY),
  };
};

export const getMinimapTransform = (
  bounds: MinimapSceneBounds,
  width: number,
  height: number,
  padding: number,
): MinimapTransform => {
  const sceneWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const sceneHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const scale = Math.min(innerWidth / sceneWidth, innerHeight / sceneHeight);

  return {
    scale,
    offsetX: padding + (innerWidth - sceneWidth * scale) / 2,
    offsetY: padding + (innerHeight - sceneHeight * scale) / 2,
  };
};

export const sceneToMinimap = (
  x: number,
  y: number,
  bounds: MinimapSceneBounds,
  transform: MinimapTransform,
): [number, number] => [
  transform.offsetX + (x - bounds.minX) * transform.scale,
  transform.offsetY + (y - bounds.minY) * transform.scale,
];

export const minimapToScene = (
  x: number,
  y: number,
  bounds: MinimapSceneBounds,
  transform: MinimapTransform,
): [number, number] => [
  bounds.minX + (x - transform.offsetX) / transform.scale,
  bounds.minY + (y - transform.offsetY) / transform.scale,
];

export const getScrollForSceneCenter = (
  sceneX: number,
  sceneY: number,
  appState: AppState,
): { scrollX: number; scrollY: number } => ({
  scrollX: appState.width / (2 * appState.zoom.value) - sceneX,
  scrollY: appState.height / (2 * appState.zoom.value) - sceneY,
});

export const getMinimapRenderData = ({
  elements,
  elementsMap,
  appState,
  width = MINIMAP_WIDTH,
  height = MINIMAP_HEIGHT,
  padding = MINIMAP_PADDING,
}: {
  elements: readonly NonDeletedExcalidrawElement[];
  elementsMap: ElementsMap;
  appState: AppState;
  width?: number;
  height?: number;
  padding?: number;
}) => {
  const viewportBounds = getVisibleSceneBounds(appState);
  const sceneBounds = getMinimapSceneBounds(
    elements,
    elementsMap,
    viewportBounds,
  );
  const transform = getMinimapTransform(sceneBounds, width, height, padding);

  const elementRects = elements
    .filter((element) => !isInvisiblySmallElement(element))
    .map((element) => {
      const [x1, y1, x2, y2] = getElementBounds(element, elementsMap);
      const [minimapX1, minimapY1] = sceneToMinimap(
        x1,
        y1,
        sceneBounds,
        transform,
      );
      const [minimapX2, minimapY2] = sceneToMinimap(
        x2,
        y2,
        sceneBounds,
        transform,
      );

      return {
        x: Math.min(minimapX1, minimapX2),
        y: Math.min(minimapY1, minimapY2),
        width: Math.abs(minimapX2 - minimapX1),
        height: Math.abs(minimapY2 - minimapY1),
        strokeColor: element.strokeColor,
      };
    });

  const [viewportX1, viewportY1] = sceneToMinimap(
    viewportBounds[0],
    viewportBounds[1],
    sceneBounds,
    transform,
  );
  const [viewportX2, viewportY2] = sceneToMinimap(
    viewportBounds[2],
    viewportBounds[3],
    sceneBounds,
    transform,
  );

  const viewportRect = {
    x: Math.min(viewportX1, viewportX2),
    y: Math.min(viewportY1, viewportY2),
    width: Math.abs(viewportX2 - viewportX1),
    height: Math.abs(viewportY2 - viewportY1),
  };

  return {
    sceneBounds,
    transform,
    elementRects,
    viewportRect,
  };
};