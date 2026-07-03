import { KEYS } from "@excalidraw/common";
import { CaptureUpdateAction } from "@excalidraw/element";
import { useExcalidrawAPI } from "@excalidraw/excalidraw/index";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import "./WebxdcHelpDialog.scss";

const HELP_CONTENT = (
  <div className="webxdc-help-dialog">
    <p>
      This whiteboard runs inside Delta Chat. Your drawing can sync with others
      in the chat in two ways: live over peer-to-peer (realtime), and as saved
      chat history.
    </p>

    <h3>Saving to chat</h3>
    <p>
      Chat messages like &ldquo;edited the whiteboard&rdquo; are only sent when
      you explicitly save or turn on auto-save. Closing the app or switching to
      another window does <strong>not</strong> save.
    </p>
    <ul>
      <li>
        <strong>
          <kbd>Ctrl</kbd>+<kbd>S</kbd>
        </strong>{" "}
        or <strong>Save to chat</strong> in the menu — saves now and posts to
        chat history.
      </li>
      <li>
        <strong>Auto-save to chat</strong> in the menu — saves every few seconds
        while you draw (off by default).
      </li>
    </ul>

    <h3>Live collaboration (realtime)</h3>
    <p>
      When realtime is available (Delta Chat 1.48+, Advanced settings), strokes
      and cursors sync instantly between open instances over P2P. That live
      layer does not write to chat — use save or auto-save to persist for people
      who open the board later.
    </p>

    <h3>Copy shapes between boards</h3>
    <p>
      Select shapes, press <kbd>Ctrl</kbd>+<kbd>C</kbd>, then <kbd>Ctrl</kbd>+
      <kbd>V</kbd> in another Excalidraw WebXDC in the same or a different
      chat.
    </p>

    <h3>Menu exports</h3>
    <p>
      Use the hamburger menu to export a file, share a scene to chat, share as a
      WebXDC package with the drawing baked in, or import a scene.
    </p>
  </div>
);

const WebxdcHelpDialog = () => {
  const api = useExcalidrawAPI();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setOpen(api.getAppState().openDialog?.name === "help");

    return api.onStateChange("openDialog", (openDialog) => {
      setOpen(openDialog?.name === "help");
    });
  }, [api]);

  const close = useCallback(() => {
    api?.updateScene({
      appState: { openDialog: null },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    });
  }, [api]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYS.ESCAPE) {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open, close]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="webxdc-help-modal" role="presentation">
      <button
        type="button"
        className="webxdc-help-modal__backdrop"
        aria-label="Close help"
        onClick={close}
      />
      <div
        className="webxdc-help-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="webxdc-help-title"
      >
        <div className="webxdc-help-modal__header">
          <h2 id="webxdc-help-title">Excalidraw in Delta Chat</h2>
          <button
            type="button"
            className="webxdc-help-modal__close"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {HELP_CONTENT}
      </div>
    </div>,
    document.body,
  );
};

export default WebxdcHelpDialog;