import clsx from "clsx";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  DRAGGING_THRESHOLD,
  capitalizeString,
  viewportCoordsToSceneCoords,
} from "@excalidraw/common";

import {
  getStickyNoteAspectFromDrag,
  type StickyNoteAspect,
} from "@excalidraw/element";

import { t } from "../i18n";

import "./StickyNoteStack.scss";

import type { AppClassProperties } from "../types";

type StickyNoteStackProps = {
  app: AppClassProperties;
};

export const StickyNoteStack = ({ app }: StickyNoteStackProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [ghostAspect, setGhostAspect] = useState<StickyNoteAspect>(1);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const placeStickyNote = useCallback(
    (clientX: number, clientY: number, aspect: StickyNoteAspect) => {
      const { x: sceneX, y: sceneY } = viewportCoordsToSceneCoords(
        { clientX, clientY },
        app.state,
      );
      app.insertStickyNote({ sceneX, sceneY, aspect });
    },
    [app],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    stackRef.current?.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    setGhostAspect(1);
    setIsDragging(true);
    setGhostPos({ x: event.clientX, y: event.clientY });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) {
      return;
    }

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    setGhostAspect(getStickyNoteAspectFromDrag(dx, dy));
    setGhostPos({ x: event.clientX, y: event.clientY });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) {
      return;
    }

    stackRef.current?.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    setGhostPos(null);

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const distance = Math.hypot(dx, dy);
    const aspect = getStickyNoteAspectFromDrag(dx, dy);

    dragStartRef.current = null;

    if (distance > DRAGGING_THRESHOLD) {
      placeStickyNote(event.clientX, event.clientY, aspect);
    } else {
      const centerX = app.state.width / 2 + app.state.offsetLeft;
      const centerY = app.state.height / 2 + app.state.offsetTop;
      placeStickyNote(centerX, centerY, 1);
    }
  };

  const onPointerCancel = () => {
    setIsDragging(false);
    setGhostPos(null);
    dragStartRef.current = null;
  };

  return (
    <>
      <div
        ref={stackRef}
        className={clsx("sticky-note-stack", {
          "sticky-note-stack--dragging": isDragging,
        })}
        role="button"
        tabIndex={0}
        title={capitalizeString(t("toolBar.stickyNote"))}
        aria-label={capitalizeString(t("toolBar.stickyNote"))}
        data-testid="toolbar-sticky-note"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className="sticky-note-stack__sheet sticky-note-stack__sheet--back-2" />
        <div className="sticky-note-stack__sheet sticky-note-stack__sheet--back-1" />
        <div className="sticky-note-stack__sheet sticky-note-stack__sheet--front" />
      </div>
      {isDragging &&
        ghostPos &&
        createPortal(
          <div
            className={clsx("sticky-note-ghost", {
              "sticky-note-ghost--wide": ghostAspect === 2,
            })}
            style={{ left: ghostPos.x, top: ghostPos.y }}
          />,
          document.body,
        )}
    </>
  );
};