import { MIME_TYPES } from "@excalidraw/common";
import { CaptureUpdateAction, getNonDeletedElements } from "@excalidraw/element";
import { loadFromBlob } from "@excalidraw/excalidraw/data/blob";
import { serializeAsJSON } from "@excalidraw/excalidraw/data/json";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { getWebxdc } from "./get-webxdc";
import { buildWebxdcPackageBlob, canPackWebxdcPackage } from "./pack-webxdc";

const SCENE_FILE_EXTENSION = ".excalidraw";

const sanitizeFilename = (name: string) =>
  name.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "drawing";

export const buildSceneFilename = (api: ExcalidrawImperativeAPI) => {
  const title = api.getAppState().name?.trim();
  return `${sanitizeFilename(title ?? "drawing")}${SCENE_FILE_EXTENSION}`;
};

export const buildSceneFileContents = (api: ExcalidrawImperativeAPI) =>
  serializeAsJSON(
    api.getSceneElements(),
    api.getAppState(),
    api.getFiles(),
    "local",
  );

export const hasExportableScene = (api: ExcalidrawImperativeAPI) =>
  getNonDeletedElements(api.getSceneElements()).length > 0;

const downloadSceneFile = (api: ExcalidrawImperativeAPI) => {
  const filename = buildSceneFilename(api);
  const contents = buildSceneFileContents(api);
  const blob = new Blob([contents], { type: MIME_TYPES.excalidraw });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const exportSceneToFile = (api: ExcalidrawImperativeAPI) => {
  if (!hasExportableScene(api)) {
    return { ok: false as const, reason: "empty" as const };
  }

  downloadSceneFile(api);
  return { ok: true as const };
};

export const shareWebxdcWithSceneToChat = async (api: ExcalidrawImperativeAPI) => {
  if (!hasExportableScene(api)) {
    return { ok: false as const, reason: "empty" as const };
  }

  const webxdc = getWebxdc();
  if (!webxdc?.sendToChat) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  if (!(await canPackWebxdcPackage())) {
    return { ok: false as const, reason: "not-packaged" as const };
  }

  const title = api.getAppState().name?.trim();
  const safeTitle = sanitizeFilename(title ?? "drawing");
  const xdcName = `${safeTitle}.xdc`;

  try {
    const blob = await buildWebxdcPackageBlob(
      buildSceneFileContents(api),
      xdcName,
    );

    await webxdc.sendToChat({
      file: { name: xdcName, blob },
      text: "Excalidraw whiteboard — open the attachment to start on this drawing.",
    });

    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: "pack-failed" as const };
  }
};

export const shareSceneToChat = async (api: ExcalidrawImperativeAPI) => {
  if (!hasExportableScene(api)) {
    return { ok: false as const, reason: "empty" as const };
  }

  const webxdc = getWebxdc();
  if (!webxdc?.sendToChat) {
    downloadSceneFile(api);
    return { ok: true as const, fallback: "download" as const };
  }

  const filename = buildSceneFilename(api);
  const plainText = buildSceneFileContents(api);

  await webxdc.sendToChat({
    file: { name: filename, plainText },
    text:
      "Excalidraw drawing — open Excalidraw in this chat, then use Menu → Import scene and select this file.",
  });

  return { ok: true as const };
};

export const importSceneViaWebxdc = async (api: ExcalidrawImperativeAPI) => {
  const webxdc = getWebxdc();
  if (!webxdc?.importFiles) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  const files = await webxdc.importFiles({
    mimeTypes: [MIME_TYPES.json, MIME_TYPES.excalidraw],
    extensions: [".excalidraw", ".json"],
    multiple: false,
  });

  if (!files?.length) {
    return { ok: false as const, reason: "cancelled" as const };
  }

  const data = await loadFromBlob(
    files[0],
    api.getAppState(),
    api.getSceneElements(),
  );

  api.addFiles(Object.values(data.files ?? {}));
  api.updateScene({
    elements: data.elements,
    appState: data.appState,
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });

  return { ok: true as const };
};