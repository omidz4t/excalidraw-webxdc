import { createRoot } from "react-dom/client";

import { appJotaiStore } from "../app-jotai";
import WebxdcApp from "./WebxdcApp";
import { collabSyncStatusAtom } from "./collab-status";
import { waitForWebxdc } from "./get-webxdc";
import { WEBXDC_VERSION } from "./version";

const rootElement = document.getElementById("root")!;

appJotaiStore.set(collabSyncStatusAtom, (prev) => ({
  ...prev,
  buildId: WEBXDC_VERSION,
}));

const showBootError = (message: string, detail: string) => {
  rootElement.innerHTML = `
    <div style="font-family:system-ui,sans-serif;padding:1.25rem;line-height:1.5;max-width:28rem">
      <strong>Excalidraw ${WEBXDC_VERSION} — sync unavailable</strong>
      <p>${message}</p>
      <p style="opacity:0.75;font-size:0.9rem">${detail}</p>
    </div>
  `;
};

waitForWebxdc().then((webxdc) => {
  if (!webxdc) {
    const hasScriptTag = !!document.querySelector('script[src="webxdc.js"]');
    showBootError(
      "window.webxdc was not found.",
      hasScriptTag
        ? `Build ${WEBXDC_VERSION}: delete every old Excalidraw attachment in this chat, then attach a fresh excalidraw.xdc and open that new message.`
        : `Build ${WEBXDC_VERSION} is broken — missing <script src="webxdc.js"> in index.html.`,
    );
    return;
  }

  createRoot(rootElement).render(<WebxdcApp />);
});