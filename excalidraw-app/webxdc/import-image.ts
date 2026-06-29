import { EVENT } from "@excalidraw/common";
import {
  parseDataTransferEvent,
  readSystemClipboard,
} from "@excalidraw/excalidraw/clipboard";
import { isSupportedImageFile } from "@excalidraw/excalidraw/data/blob";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export type WebxdcImageInsertContext = {
  container: HTMLElement | null;
  api: ExcalidrawImperativeAPI | null;
};

export const webxdcImageInsertContext: WebxdcImageInsertContext = {
  container: null,
  api: null,
};

const getDropTarget = (container: HTMLElement | null) =>
  container?.querySelector<HTMLElement>(".excalidraw.excalidraw-container") ??
  container;

const getDropCoords = (api: ExcalidrawImperativeAPI | null) => {
  if (!api) {
    return { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
  }

  const state = api.getAppState();
  return {
    clientX: state.width / 2 + state.offsetLeft,
    clientY: state.height / 2 + state.offsetTop,
  };
};

const createFileDropEvent = (
  files: File[],
  clientX: number,
  clientY: number,
) => {
  const event = new Event("drop", { bubbles: true, cancelable: true });

  const fileList = files as File[] & { item: (index: number) => File };
  fileList.item = (index: number) => fileList[index];

  Object.defineProperty(event, "dataTransfer", {
    value: {
      files: fileList,
      items: files.map((file) => ({
        kind: "file",
        type: file.type,
        getAsFile: () => file,
      })),
      getData: () => "",
      types: ["Files"],
    },
  });
  Object.defineProperty(event, "clientX", { value: clientX });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "preventDefault", {
    value: () => {},
  });
  Object.defineProperty(event, "stopPropagation", {
    value: () => {},
  });

  return event;
};

export const dropImageFilesOnCanvas = (
  files: File[],
  context: WebxdcImageInsertContext = webxdcImageInsertContext,
) => {
  const imageFiles = files.filter(isSupportedImageFile);
  if (!imageFiles.length) {
    return false;
  }

  const target = getDropTarget(context.container);
  if (!target) {
    return false;
  }

  const { clientX, clientY } = getDropCoords(context.api);
  target.dispatchEvent(createFileDropEvent(imageFiles, clientX, clientY));
  return true;
};

export const importImagesViaWebxdc = async (
  context: WebxdcImageInsertContext = webxdcImageInsertContext,
) => {
  const webxdc = window.webxdc;
  if (!webxdc?.importFiles) {
    return;
  }

  const files = await webxdc.importFiles({
    mimeTypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    extensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    multiple: true,
  });

  if (!files?.length) {
    return;
  }

  dropImageFilesOnCanvas(Array.from(files), context);
};

export const focusCanvasForPaste = (container: HTMLElement | null) => {
  const canvas =
    container?.querySelector<HTMLElement>("canvas.interactive") ??
    getDropTarget(container);
  canvas?.focus({ preventScroll: true });
};

const clipboardItemsHaveFiles = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) {
    return false;
  }
  return Array.from(items).some((item) => item.kind === "file");
};

const filesFromClipboardEvent = async (event: ClipboardEvent) => {
  if (clipboardItemsHaveFiles(event)) {
    const list = await parseDataTransferEvent(event);
    return list.getFiles().map((entry) => entry.file).filter(isSupportedImageFile);
  }

  try {
    const types = await readSystemClipboard();
    const files = Object.values(types).filter(
      (value): value is File => value instanceof File,
    );
    return files.filter(isSupportedImageFile);
  } catch {
    return [];
  }
};

/**
 * Delta Chat / Electron webxdc hosts often omit image files from paste events.
 * Handle images via synthetic drop (bypasses paste focus/canvas guards).
 */
export const installWebxdcPasteFix = (
  context: WebxdcImageInsertContext = webxdcImageInsertContext,
) => {
  const onPasteCapture = async (event: ClipboardEvent) => {
    const imageFiles = await filesFromClipboardEvent(event);
    if (!imageFiles.length) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    dropImageFilesOnCanvas(imageFiles, context);
  };

  document.addEventListener(EVENT.PASTE, onPasteCapture, { capture: true });

  return () => {
    document.removeEventListener(EVENT.PASTE, onPasteCapture, { capture: true });
  };
};

if (typeof document !== "undefined") {
  installWebxdcPasteFix();
}