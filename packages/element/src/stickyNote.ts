import { applyDarkModeFilter, isTransparent, THEME } from "@excalidraw/common";

import type { ExcalidrawRectangleElement } from "./types";

export const STICKY_NOTE_COLORS = {
  body: "#ffec99",
} as const;

export const STICKY_NOTE_BASE_SIZE = 200;
export const STICKY_NOTE_MIN_SIZE = 80;
export const STICKY_NOTE_DEFAULT_FONT_SIZE = 16;
export const STICKY_NOTE_MIN_FONT_SIZE = 8;

export const getStickyNoteBaseFontSize = (
  container: ExcalidrawRectangleElement,
): number =>
  STICKY_NOTE_DEFAULT_FONT_SIZE *
  (Math.abs(container.height) / STICKY_NOTE_BASE_SIZE);

/** 1 = square (200×200); 2 = wide horizontal (400×200) — never tall */
export type StickyNoteAspect = 1 | 2;

export const STICKY_NOTE_WIDE_MIN_DRAG = 30;

export const getStickyNoteDimensions = (
  aspect: StickyNoteAspect,
): { width: number; height: number } => {
  const height = STICKY_NOTE_BASE_SIZE;
  const width = aspect === 2 ? STICKY_NOTE_BASE_SIZE * 2 : STICKY_NOTE_BASE_SIZE;
  return { width, height };
};

export const getStickyNoteAspectFromDrag = (
  dx: number,
  dy: number,
): StickyNoteAspect => {
  // Default square; wide (400×200) only on deliberate horizontal drag
  if (
    Math.abs(dx) > Math.abs(dy) * 1.5 &&
    Math.abs(dx) >= STICKY_NOTE_WIDE_MIN_DRAG
  ) {
    return 2;
  }

  return 1;
};

export const OMIT_SIDES_FOR_STICKY_NOTE = {
  n: true,
  s: true,
  e: true,
  w: true,
} as const;

export const isStickyNoteElement = (
  element: { type: string; customData?: Record<string, unknown> },
): element is ExcalidrawRectangleElement =>
  element.type === "rectangle" && element.customData?.stickyNote === true;

export const getStickyNoteAspect = (
  element: ExcalidrawRectangleElement,
): StickyNoteAspect => {
  const stored = element.customData?.stickyNoteAspect;
  if (stored === 1 || stored === 2) {
    return stored;
  }

  const ratio = Math.abs(element.width) / Math.abs(element.height);
  return ratio >= 1.5 ? 2 : 1;
};

export const constrainStickyNoteResize = (
  origElement: ExcalidrawRectangleElement,
  nextWidth: number,
  nextHeight: number,
): { nextWidth: number; nextHeight: number } => {
  const aspect = getStickyNoteAspect(origElement);
  const widthRatio = Math.abs(nextWidth) / origElement.width;
  const heightRatio = Math.abs(nextHeight) / origElement.height;
  const minWidth =
    aspect === 2 ? STICKY_NOTE_MIN_SIZE * 2 : STICKY_NOTE_MIN_SIZE;
  const scale = Math.max(
    widthRatio,
    heightRatio,
    minWidth / origElement.width,
    STICKY_NOTE_MIN_SIZE / origElement.height,
  );

  const signW = Math.sign(nextWidth) || 1;
  const signH = Math.sign(nextHeight) || 1;

  nextWidth = origElement.width * scale * signW;

  if (aspect === 1) {
    nextHeight = Math.abs(nextWidth) * signH;
  } else {
    nextHeight = (Math.abs(nextWidth) / 2) * signH;
  }

  return { nextWidth, nextHeight };
};

const getStickyNoteBodyColor = (
  element: ExcalidrawRectangleElement,
  isDark: boolean,
) => {
  const base =
    isTransparent(element.backgroundColor) || !element.backgroundColor
      ? STICKY_NOTE_COLORS.body
      : element.backgroundColor;

  return applyDarkModeFilter(base, isDark);
};

export const drawStickyNoteOnCanvas = (
  element: ExcalidrawRectangleElement,
  context: CanvasRenderingContext2D,
  theme: (typeof THEME)[keyof typeof THEME],
) => {
  const { width, height } = element;
  const radius = 2;
  const isDark = theme === THEME.DARK;
  const bodyColor = getStickyNoteBodyColor(element, isDark);

  context.save();

  context.shadowColor = isDark ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.16)";
  context.shadowBlur = 8;
  context.shadowOffsetX = 1;
  context.shadowOffsetY = 4;

  if (context.roundRect) {
    context.beginPath();
    context.roundRect(0, 0, width, height, radius);
    context.fillStyle = bodyColor;
    context.fill();
  } else {
    context.fillStyle = bodyColor;
    context.fillRect(0, 0, width, height);
  }

  context.restore();
};

export const createStickyNoteSvgElements = (
  element: ExcalidrawRectangleElement,
  doc: Document,
  opacity: number,
): SVGElement[] => {
  const { width, height } = element;
  const radius = 2;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const bodyColor = getStickyNoteBodyColor(element, false);

  const group = doc.createElementNS(SVG_NS, "g");
  if (opacity !== 1) {
    group.setAttribute("opacity", `${opacity}`);
  }

  const filter = doc.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", `sticky-shadow-${element.id}`);
  filter.setAttribute("x", "-20%");
  filter.setAttribute("y", "-20%");
  filter.setAttribute("width", "140%");
  filter.setAttribute("height", "140%");

  const dropShadow = doc.createElementNS(SVG_NS, "feDropShadow");
  dropShadow.setAttribute("dx", "1");
  dropShadow.setAttribute("dy", "4");
  dropShadow.setAttribute("stdDeviation", "3");
  dropShadow.setAttribute("flood-opacity", "0.16");
  filter.appendChild(dropShadow);
  group.appendChild(filter);

  const body = doc.createElementNS(SVG_NS, "rect");
  body.setAttribute("x", "0");
  body.setAttribute("y", "0");
  body.setAttribute("width", `${width}`);
  body.setAttribute("height", `${height}`);
  body.setAttribute("rx", `${radius}`);
  body.setAttribute("ry", `${radius}`);
  body.setAttribute("fill", bodyColor);
  body.setAttribute("filter", `url(#sticky-shadow-${element.id})`);
  group.appendChild(body);

  return [group];
};