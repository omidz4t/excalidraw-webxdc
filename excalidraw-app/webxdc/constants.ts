export const isWebxdcMode = import.meta.env.VITE_APP_WEBXDC === "true";

/** @deprecated used by legacy scene-json sync; binding uses ExcalidrawBinding origin */
export const WEBXDC_ORIGIN = "webxdc-local";
/** Throttle live Yjs drawing over P2P realtime (ms) */
export const REALTIME_DOC_MS = 80;
/** Throttle document persist via sendUpdate while drawing (ms) */
export const PERSIST_FLUSH_MS = 500;
/** Persist full state via sendUpdate (ms) */
export const PERSIST_SCENE_SYNC_MS = 3000;