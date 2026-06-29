import type { Webxdc } from "@webxdc/types";

const WEBXDC_POLL_MS = 50;
const WEBXDC_WAIT_MS = 15_000;

export const getWebxdc = (): Webxdc | undefined => {
  if (window.webxdc) {
    return window.webxdc;
  }
  return undefined;
};

/** Wait for Delta Chat (or dev shim) to expose window.webxdc — realFinger loads app code after webxdc.js */
export const waitForWebxdc = (timeoutMs = WEBXDC_WAIT_MS): Promise<Webxdc | null> =>
  new Promise((resolve) => {
    const existing = getWebxdc();
    if (existing) {
      resolve(existing);
      return;
    }

    const deadline = window.setTimeout(() => {
      window.clearInterval(timer);
      resolve(getWebxdc() ?? null);
    }, timeoutMs);

    const timer = window.setInterval(() => {
      const webxdc = getWebxdc();
      if (webxdc) {
        window.clearTimeout(deadline);
        window.clearInterval(timer);
        resolve(webxdc);
      }
    }, WEBXDC_POLL_MS);
  });