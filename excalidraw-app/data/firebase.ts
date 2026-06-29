import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import type { FileId } from "@excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
} from "@excalidraw/excalidraw/types";

import type Portal from "../collab/Portal";
import type { SyncableExcalidrawElement } from ".";

/** Offline fork: Firebase collaboration is not available. */

export const loadFirebaseStorage = async () => null;

export const isSavedToFirebase = (
  _portal: Portal,
  _elements: readonly unknown[],
): boolean => true;

export const saveFilesToFirebase = async (_opts: {
  prefix: string;
  files: { id: FileId; buffer: Uint8Array }[];
}) => ({
  savedFiles: [] as FileId[],
  erroredFiles: [] as FileId[],
});

export const saveToFirebase = async (
  _portal: Portal,
  _elements: readonly SyncableExcalidrawElement[],
  _appState: AppState,
): Promise<RemoteExcalidrawElement[] | null> => null;

export const loadFromFirebase = async (
  _roomId: string,
  _roomKey: string,
  _socket: unknown,
): Promise<readonly SyncableExcalidrawElement[] | null> => null;

export const loadFilesFromFirebase = async (
  _prefix: string,
  _decryptionKey: string,
  _filesIds: readonly FileId[],
) => ({
  loadedFiles: [] as BinaryFileData[],
  erroredFiles: new Map<FileId, true>(),
});