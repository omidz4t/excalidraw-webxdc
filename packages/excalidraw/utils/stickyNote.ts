import { TEXT_ALIGN, VERTICAL_ALIGN } from "@excalidraw/common";

import {
  getStickyNoteDimensions,
  newElement,
  newElementWith,
  newTextElement,
  STICKY_NOTE_COLORS,
  STICKY_NOTE_DEFAULT_FONT_SIZE,
  type StickyNoteAspect,
} from "@excalidraw/element";

import type {
  ExcalidrawRectangleElement,
  ExcalidrawTextElement,
} from "@excalidraw/element/types";

export const STICKY_NOTE_WIDTH = 200;
export const STICKY_NOTE_DEFAULT_ASPECT = 1 as const;
export const STICKY_NOTE_HEIGHT = STICKY_NOTE_WIDTH;
export const STICKY_NOTE_BACKGROUND = STICKY_NOTE_COLORS.body;
export const STICKY_NOTE_FONT_SIZE = STICKY_NOTE_DEFAULT_FONT_SIZE;

export { getStickyNoteDimensions };

export const createStickyNoteElements = (
  x: number,
  y: number,
  aspect: StickyNoteAspect = STICKY_NOTE_DEFAULT_ASPECT,
): [ExcalidrawRectangleElement, ExcalidrawTextElement] => {
  const { width, height } = getStickyNoteDimensions(aspect);

  const container = newElement({
    type: "rectangle",
    x,
    y,
    width,
    height,
    backgroundColor: STICKY_NOTE_BACKGROUND,
    strokeColor: "transparent",
    strokeWidth: 0,
    roughness: 0,
    fillStyle: "solid",
    roundness: null,
    customData: { stickyNote: true, stickyNoteAspect: aspect },
  }) as ExcalidrawRectangleElement;

  const text = newTextElement({
    x: x + width / 2,
    y: y + height / 2,
    text: "",
    originalText: "",
    fontSize: STICKY_NOTE_FONT_SIZE,
    textAlign: TEXT_ALIGN.CENTER,
    verticalAlign: VERTICAL_ALIGN.MIDDLE,
    containerId: container.id,
    autoResize: true,
  });

  const containerWithBinding = newElementWith(container, {
    boundElements: [{ type: "text", id: text.id }],
  });

  return [containerWithBinding, text];
};