import type { Gesture } from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import type { SocketUpdateDataSource } from "./socket-types";

type PointerPayload = SocketUpdateDataSource["MOUSE_LOCATION"]["payload"];

export interface CollabAPI {
  isCollaborating: () => boolean;
  onPointerUpdate: (payload: {
    pointer: PointerPayload["pointer"];
    button: PointerPayload["button"];
    pointersMap: Gesture["pointers"];
  }) => void;
  startCollaboration: (roomLinkData: {
    roomId: string;
    roomKey: string;
  }) => Promise<{
    elements: readonly OrderedExcalidrawElement[];
    appState: ReturnType<ExcalidrawImperativeAPI["getAppState"]>;
  }>;
  stopCollaboration: (keepRemoteState?: boolean) => void;
  syncElements: (elements: readonly OrderedExcalidrawElement[]) => void;
  fetchImageFiles: (opts: {
    elements: readonly OrderedExcalidrawElement[];
    forceFetchFiles?: boolean;
  }) => Promise<{
    loadedFiles: ReturnType<ExcalidrawImperativeAPI["getFiles"]> extends infer F
      ? F extends Record<string, infer V>
        ? V[]
        : never
      : never;
    erroredFiles: Map<string, unknown>;
    elements: readonly OrderedExcalidrawElement[];
  }>;
  setUsername: (username: string) => void;
  getUsername: () => string;
  getActiveRoomLink: () => string | null;
  setCollabError: (message: string | null) => void;
}