import { EVENT, KEYS } from "@excalidraw/common";

import { webxdcPersistRef } from "./persist-ref";

export const installWebxdcSaveShortcut = () => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (!event[KEYS.CTRL_OR_CMD] || event.key !== KEYS.S) {
      return;
    }

    if (!webxdcPersistRef.current) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    webxdcPersistRef.current();
  };

  document.addEventListener(EVENT.KEYDOWN, onKeyDown, { capture: true });

  return () => {
    document.removeEventListener(EVENT.KEYDOWN, onKeyDown, { capture: true });
  };
};