import "@excalidraw/excalidraw/global";
import "@excalidraw/excalidraw/css";
import type { Webxdc } from "@webxdc/types";

interface Window {
  __EXCALIDRAW_SHA__: string | undefined;
  /** Injected by Delta Chat when index.html loads webxdc.js */
  webxdc?: Webxdc;
}
