/** Set at build time via `make build-webxdc` → WEBXDC_VERSION */
export const WEBXDC_VERSION = import.meta.env.VITE_WEBXDC_VERSION ?? "dev";