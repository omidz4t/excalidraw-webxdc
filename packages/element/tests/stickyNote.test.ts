import { describe, expect, it } from "vitest";

import {
  constrainStickyNoteResize,
  getStickyNoteAspect,
  getStickyNoteAspectFromDrag,
  getStickyNoteBaseFontSize,
  getStickyNoteDimensions,
  isStickyNoteElement,
  OMIT_SIDES_FOR_STICKY_NOTE,
  STICKY_NOTE_BASE_SIZE,
  STICKY_NOTE_DEFAULT_FONT_SIZE,
  STICKY_NOTE_MIN_SIZE,
} from "../src/stickyNote";

import type { ExcalidrawRectangleElement } from "../src/types";

const createStickyNote = (
  width: number,
  height: number,
  aspect?: 1 | 2,
): ExcalidrawRectangleElement =>
  ({
    type: "rectangle",
    width,
    height,
    customData: {
      stickyNote: true,
      ...(aspect !== undefined ? { stickyNoteAspect: aspect } : {}),
    },
  }) as ExcalidrawRectangleElement;

describe("stickyNote", () => {
  it("identifies sticky note elements", () => {
    expect(isStickyNoteElement(createStickyNote(200, 200))).toBe(true);
    expect(
      isStickyNoteElement({ type: "rectangle", customData: {} } as any),
    ).toBe(false);
  });

  it("omits side and rotation handles", () => {
    expect(OMIT_SIDES_FOR_STICKY_NOTE).toEqual({
      n: true,
      s: true,
      e: true,
      w: true,
    });
  });

  it("creates square dimensions by default", () => {
    expect(getStickyNoteDimensions(1)).toEqual({
      width: STICKY_NOTE_BASE_SIZE,
      height: STICKY_NOTE_BASE_SIZE,
    });
  });

  it("scales base font size with container height", () => {
    expect(
      getStickyNoteBaseFontSize(createStickyNote(200, 200, 1)),
    ).toBe(STICKY_NOTE_DEFAULT_FONT_SIZE);
    expect(
      getStickyNoteBaseFontSize(createStickyNote(400, 400, 1)),
    ).toBe(STICKY_NOTE_DEFAULT_FONT_SIZE * 2);
  });

  it("creates wide horizontal dimensions for aspect 2", () => {
    expect(getStickyNoteDimensions(2)).toEqual({
      width: STICKY_NOTE_BASE_SIZE * 2,
      height: STICKY_NOTE_BASE_SIZE,
    });
  });

  it("reads stored aspect ratio", () => {
    expect(getStickyNoteAspect(createStickyNote(400, 200, 2))).toBe(2);
    expect(getStickyNoteAspect(createStickyNote(200, 200, 1))).toBe(1);
  });

  it("infers wide aspect from dimensions when not stored", () => {
    expect(getStickyNoteAspect(createStickyNote(400, 200))).toBe(2);
    expect(getStickyNoteAspect(createStickyNote(200, 200))).toBe(1);
  });

  it("keeps 1:1 aspect ratio when resizing square", () => {
    const note = createStickyNote(200, 200, 1);
    const { nextWidth, nextHeight } = constrainStickyNoteResize(
      note,
      300,
      150,
    );
    expect(nextWidth).toBe(300);
    expect(nextHeight).toBe(300);
  });

  it("keeps 2:1 wide aspect ratio when resizing", () => {
    const note = createStickyNote(400, 200, 2);
    const { nextWidth, nextHeight } = constrainStickyNoteResize(
      note,
      500,
      150,
    );
    expect(nextWidth).toBe(500);
    expect(nextHeight).toBe(250);
  });

  it("defaults to square when dragging vertically or slightly horizontally", () => {
    expect(getStickyNoteAspectFromDrag(10, 50)).toBe(1);
    expect(getStickyNoteAspectFromDrag(20, 30)).toBe(1);
    expect(getStickyNoteAspectFromDrag(25, 10)).toBe(1);
  });

  it("uses wide aspect only on clear horizontal drag", () => {
    expect(getStickyNoteAspectFromDrag(40, 10)).toBe(2);
    expect(getStickyNoteAspectFromDrag(50, -5)).toBe(2);
  });

  it("enforces minimum size for square", () => {
    const note = createStickyNote(200, 200, 1);
    const { nextWidth, nextHeight } = constrainStickyNoteResize(
      note,
      40,
      40,
    );
    expect(nextWidth).toBe(STICKY_NOTE_MIN_SIZE);
    expect(nextHeight).toBe(STICKY_NOTE_MIN_SIZE);
  });

  it("enforces minimum size for wide", () => {
    const note = createStickyNote(400, 200, 2);
    const { nextWidth, nextHeight } = constrainStickyNoteResize(
      note,
      100,
      80,
    );
    expect(nextWidth).toBe(STICKY_NOTE_MIN_SIZE * 2);
    expect(nextHeight).toBe(STICKY_NOTE_MIN_SIZE);
  });
});