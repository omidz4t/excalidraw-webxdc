import { useAtomValue } from "../app-jotai";

import { collabSyncStatusAtom } from "./collab-status";

const WebxdcLoadingOverlay = () => {
  const syncStatus = useAtomValue(collabSyncStatusAtom);

  if (syncStatus.initPhase === "ready") {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        textAlign: "center",
        background: "var(--color-surface-low, rgba(255, 255, 255, 0.82))",
        color: "var(--color-text, #1b1b1f)",
        pointerEvents: "all",
        font: "600 0.95rem system-ui, sans-serif",
      }}
    >
      {syncStatus.hint || "Loading…"}
    </div>
  );
};

export default WebxdcLoadingOverlay;