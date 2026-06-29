import type { Gesture } from "@excalidraw/excalidraw/types";

import type { SocketUpdateDataSource } from "../collab/socket-types";

type PointerPayload = SocketUpdateDataSource["MOUSE_LOCATION"]["payload"];

export type WebxdcPointerUpdateHandler = (payload: {
  pointer: PointerPayload["pointer"];
  button: PointerPayload["button"];
  pointersMap: Gesture["pointers"];
}) => void;

export const webxdcPointerUpdateRef: {
  current: WebxdcPointerUpdateHandler | null;
} = {
  current: null,
};