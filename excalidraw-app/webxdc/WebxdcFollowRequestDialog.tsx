import { KEYS } from "@excalidraw/common";
import { CaptureUpdateAction } from "@excalidraw/element";
import { useExcalidrawAPI } from "@excalidraw/excalidraw/index";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { toBrandedType } from "@excalidraw/common";

import type { SocketId } from "@excalidraw/excalidraw/types";

import { pendingFollowRequestAtom } from "./follow-request";

import "./WebxdcFollowRequestDialog.scss";

const WebxdcFollowRequestDialog = () => {
  const api = useExcalidrawAPI();
  const [request, setRequest] = useAtom(pendingFollowRequestAtom);

  const dismiss = useCallback(() => {
    setRequest(null);
  }, [setRequest]);

  const accept = useCallback(() => {
    if (!api || !request) {
      return;
    }

    api.updateScene({
      appState: {
        userToFollow: {
          socketId: toBrandedType<SocketId>(request.fromAddr),
          username: request.fromName,
        },
        openMenu:
          api.getAppState().openMenu === "canvas"
            ? null
            : api.getAppState().openMenu,
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    });
    setRequest(null);
  }, [api, request, setRequest]);

  useEffect(() => {
    if (!request) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYS.ESCAPE) {
        event.preventDefault();
        dismiss();
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [request, dismiss]);

  if (!request) {
    return null;
  }

  return createPortal(
    <div className="webxdc-follow-request-modal" role="presentation">
      <button
        type="button"
        className="webxdc-follow-request-modal__backdrop"
        aria-label="Dismiss follow request"
        onClick={dismiss}
      />
      <div
        className="webxdc-follow-request-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="webxdc-follow-request-title"
      >
        <h2 id="webxdc-follow-request-title" className="webxdc-follow-request-modal__title">
          Follow request
        </h2>
        <p className="webxdc-follow-request-modal__text">
          <strong>{request.fromName}</strong> wants you to follow them so you
          see what they are looking at on the board.
        </p>
        <div className="webxdc-follow-request-modal__actions">
          <button
            type="button"
            className="webxdc-follow-request-modal__btn webxdc-follow-request-modal__btn--ghost"
            onClick={dismiss}
          >
            Not now
          </button>
          <button
            type="button"
            className="webxdc-follow-request-modal__btn webxdc-follow-request-modal__btn--primary"
            onClick={accept}
          >
            Follow {request.fromName}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default WebxdcFollowRequestDialog;