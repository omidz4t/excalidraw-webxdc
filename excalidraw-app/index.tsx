import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ExcalidrawApp from "./App";

window.__EXCALIDRAW_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

if (import.meta.env.VITE_APP_WEBXDC !== "true") {
  const { registerSW } = await import("virtual:pwa-register");
  registerSW();
}

root.render(
  <StrictMode>
    <ExcalidrawApp />
  </StrictMode>,
);
