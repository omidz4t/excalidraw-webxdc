import {
  distance,
  EXPORT_DATA_TYPES,
  getGridPoint,
  viewportCoordsToSceneCoords,
} from "@excalidraw/common";
import {
  CaptureUpdateAction,
  duplicateElements,
  getCommonBounds,
  getSelectedElements,
  isBoundToContainer,
  newElementWith,
} from "@excalidraw/element";
import { serializeAsClipboardJSON } from "@excalidraw/excalidraw/clipboard";
import { restoreElements } from "@excalidraw/excalidraw/data/restore";
import { gzipSync, gunzipSync } from "fflate";
import { fromUint8Array, toUint8Array } from "js-base64";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";

export const SHAPE_XFER_PREFIX = "excalidraw-xfer:v1:";

/** Soft limit for portable tokens (chat sendUpdate is ~128 KB). */
export const SHAPE_XFER_WARN_BYTES = 96_000;

type ShapeXferPayload = {
  type: typeof EXPORT_DATA_TYPES.excalidrawClipboard;
  elements: readonly ExcalidrawElement[];
  files?: BinaryFiles;
};

const isShapeXferPayload = (value: unknown): value is ShapeXferPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as ShapeXferPayload;
  return (
    payload.type === EXPORT_DATA_TYPES.excalidrawClipboard &&
    Array.isArray(payload.elements)
  );
};

export const encodeShapeXfer = (clipboardJson: string): string => {
  const compressed = gzipSync(new TextEncoder().encode(clipboardJson));
  return `${SHAPE_XFER_PREFIX}${fromUint8Array(compressed, true)}`;
};

export const decodeShapeXfer = (token: string): string | null => {
  const trimmed = token.trim();
  if (!trimmed.startsWith(SHAPE_XFER_PREFIX)) {
    return null;
  }

  try {
    const compressed = toUint8Array(trimmed.slice(SHAPE_XFER_PREFIX.length));
    return new TextDecoder().decode(gunzipSync(compressed));
  } catch {
    return null;
  }
};

export const extractShapeXferToken = (text: string): string | null => {
  const trimmed = text.trim();
  if (trimmed.startsWith(SHAPE_XFER_PREFIX)) {
    return trimmed;
  }

  const line = trimmed
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(SHAPE_XFER_PREFIX));

  return line ?? null;
};

const payloadFromClipboardJson = (
  json: string,
): { elements: readonly ExcalidrawElement[]; files?: BinaryFiles } | null => {
  try {
    const payload: unknown = JSON.parse(json);
    if (!isShapeXferPayload(payload)) {
      return null;
    }

    return {
      elements: payload.elements,
      files: payload.files,
    };
  } catch {
    return null;
  }
};

export const parseShapeXferToken = (
  token: string,
): { elements: readonly ExcalidrawElement[]; files?: BinaryFiles } | null => {
  const json = decodeShapeXfer(token);
  if (!json) {
    return null;
  }

  return payloadFromClipboardJson(json);
};

/** Standard Excalidraw clipboard JSON from text/plain or vendor MIME type. */
export const parseExcalidrawClipboardJson = (
  text: string,
): { elements: readonly ExcalidrawElement[]; files?: BinaryFiles } | null => {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }

  return payloadFromClipboardJson(trimmed);
};

export const parsePastedShapeText = (
  text: string,
): { elements: readonly ExcalidrawElement[]; files?: BinaryFiles } | null => {
  const xferToken = extractShapeXferToken(text);
  if (xferToken) {
    const xferPayload = parseShapeXferToken(xferToken);
    if (xferPayload) {
      return xferPayload;
    }
  }

  return parseExcalidrawClipboardJson(text);
};

export const getSelectedElementsForXfer = (api: ExcalidrawImperativeAPI) =>
  getSelectedElements(api.getSceneElements(), api.getAppState(), {
    includeBoundTextElement: true,
    includeElementsInFrames: true,
  });

export const buildShapeXferToken = (
  api: ExcalidrawImperativeAPI,
): { token: string; byteLength: number } | null => {
  const elements = getSelectedElementsForXfer(api);
  if (!elements.length) {
    return null;
  }

  const json = serializeAsClipboardJSON({
    elements,
    files: api.getFiles(),
  });
  const token = encodeShapeXfer(json);

  return {
    token,
    byteLength: new TextEncoder().encode(token).length,
  };
};

export const pasteShapeXfer = (
  api: ExcalidrawImperativeAPI,
  payload: { elements: readonly ExcalidrawElement[]; files?: BinaryFiles },
) => {
  if (payload.files) {
    api.addFiles(Object.values(payload.files));
  }

  const restored = restoreElements(payload.elements, null, {
    deleteInvisibleElements: true,
  });
  if (!restored.length) {
    return;
  }

  const appState = api.getAppState();
  const [minX, minY, maxX, maxY] = getCommonBounds(restored);
  const elementsCenterX = distance(minX, maxX) / 2;
  const elementsCenterY = distance(minY, maxY) / 2;

  const clientX = appState.width / 2 + appState.offsetLeft;
  const clientY = appState.height / 2 + appState.offsetTop;
  const { x, y } = viewportCoordsToSceneCoords({ clientX, clientY }, appState);

  const dx = x - elementsCenterX;
  const dy = y - elementsCenterY;
  const [gridX, gridY] = getGridPoint(dx, dy, appState.gridSize);

  const { duplicatedElements } = duplicateElements({
    type: "everything",
    elements: restored.map((element) =>
      newElementWith(element, {
        x: element.x + gridX - minX,
        y: element.y + gridY - minY,
      }),
    ),
    randomizeSeed: true,
  });

  const selectedElementIds = duplicatedElements.reduce<
    Record<string, true>
  >((acc, element) => {
    if (!isBoundToContainer(element)) {
      acc[element.id] = true;
    }
    return acc;
  }, {});

  api.updateScene({
    elements: [...api.getSceneElementsIncludingDeleted(), ...duplicatedElements],
    appState: { selectedElementIds },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
};