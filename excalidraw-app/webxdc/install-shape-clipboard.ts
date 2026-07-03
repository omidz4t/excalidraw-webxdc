import { EVENT, isWritableElement, MIME_TYPES } from "@excalidraw/common";
import { copyTextToSystemClipboard } from "@excalidraw/excalidraw/clipboard";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import {
  buildShapeXferToken,
  parsePastedShapeText,
  pasteShapeXfer,
} from "./shape-clipboard";

export type WebxdcShapeClipboardContext = {
  container: HTMLElement | null;
  api: ExcalidrawImperativeAPI | null;
};

export const webxdcShapeClipboardContext: WebxdcShapeClipboardContext = {
  container: null,
  api: null,
};

/** Last copied portable token — fallback when OS clipboard is unavailable. */
export const shapeXferClipboardRef: { current: string | null } = {
  current: null,
};

const isExcalidrawClipboardAction = (
  event: ClipboardEvent,
  container: HTMLElement | null,
) => {
  if (!container) {
    return false;
  }

  const active = document.activeElement;
  if (!active || !container.contains(active)) {
    return false;
  }

  if (isWritableElement(event.target)) {
    return false;
  }

  return true;
};

const readClipboardTextFromEvent = (event: ClipboardEvent): string => {
  const data = event.clipboardData;
  if (!data) {
    return "";
  }

  return (
    data.getData(MIME_TYPES.excalidrawClipboard) ||
    data.getData("text/plain") ||
    ""
  );
};

const overwriteClipboardWithXferToken = async (token: string) => {
  shapeXferClipboardRef.current = token;

  try {
    await copyTextToSystemClipboard({
      [MIME_TYPES.text]: token,
      [MIME_TYPES.excalidrawClipboard]: token,
    });
  } catch (error) {
    console.warn("shape clipboard: could not write portable token", error);
  }
};

/**
 * Excalidraw's copy handler calls stopPropagation(), so a bubble-phase listener
 * never runs. Detect copy in capture phase, then overwrite the clipboard after
 * Excalidraw finishes writing the full JSON payload.
 */
export const installWebxdcShapeClipboard = (
  context: WebxdcShapeClipboardContext = webxdcShapeClipboardContext,
) => {
  const onCopyCapture = (event: ClipboardEvent) => {
    const api = context.api;
    if (!api || !isExcalidrawClipboardAction(event, context.container)) {
      return;
    }

    const built = buildShapeXferToken(api);
    if (!built) {
      return;
    }

    const token = built.token;
    queueMicrotask(() => {
      void overwriteClipboardWithXferToken(token);
    });
  };

  const onPasteCapture = (event: ClipboardEvent) => {
    const api = context.api;
    if (!api || !isExcalidrawClipboardAction(event, context.container)) {
      return;
    }

    const payload = parsePastedShapeText(readClipboardTextFromEvent(event));
    if (!payload?.elements.length) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    pasteShapeXfer(api, payload);
  };

  document.addEventListener(EVENT.COPY, onCopyCapture, true);
  document.addEventListener(EVENT.PASTE, onPasteCapture, true);

  return () => {
    document.removeEventListener(EVENT.COPY, onCopyCapture, true);
    document.removeEventListener(EVENT.PASTE, onPasteCapture, true);
  };
};