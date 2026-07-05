import { KEYS } from "@excalidraw/common";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useAtomValue } from "../app-jotai";
import { closeWebxdcHelp, webxdcHelpOpenAtom } from "./webxdc-help-state";

import "./WebxdcHelpDialog.scss";

type HelpSlide = {
  title: string;
  body: ReactNode;
};

const HELP_SLIDES: HelpSlide[] = [
  {
    title: "Excalidraw in Delta Chat",
    body: (
      <>
        <p>
          This whiteboard runs inside Delta Chat. Your drawing can sync with
          others in the chat in two ways: live over peer-to-peer (realtime), and
          as saved chat history.
        </p>
        <p>
          Use the arrows below or your keyboard to browse these tips. Press{" "}
          <kbd>Esc</kbd> or the close button when you are done.
        </p>
      </>
    ),
  },
  {
    title: "Saving to chat",
    body: (
      <>
        <p>
          Chat messages like &ldquo;edited the whiteboard&rdquo; are only sent
          when you explicitly save or turn on auto-save. Closing the app or
          switching to another window does <strong>not</strong> save.
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
            <strong>Auto-save to chat</strong> in the menu — saves every few
            seconds while you draw (off by default).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Live collaboration",
    body: (
      <>
        <p>
          When realtime is available (Delta Chat 1.48+, Advanced settings),
          strokes and cursors sync instantly between open instances over P2P.
        </p>
        <p>
          That live layer does not write to chat — use save or auto-save to
          persist for people who open the board later.
        </p>
        <p>
          New joiners automatically receive the current drawing state from any
          connected peer (CRDT sync over the mesh).
        </p>
      </>
    ),
  },
  {
    title: "Copy shapes between boards",
    body: (
      <>
        <p>
          Select shapes, press <kbd>Ctrl</kbd>+<kbd>C</kbd>, then{" "}
          <kbd>Ctrl</kbd>+<kbd>V</kbd> in another Excalidraw WebXDC in the
          same or a different chat.
        </p>
        <p>
          Shapes are copied as a compact payload in your clipboard — no file
          export needed for quick reuse.
        </p>
      </>
    ),
  },
  {
    title: "Menu exports",
    body: (
      <>
        <p>
          Use the hamburger menu to export a file, share a scene to chat, share
          as a WebXDC package with the drawing baked in, or import a scene.
        </p>
        <ul>
          <li>
            <strong>Export to file</strong> — download a local{" "}
            <code>.excalidraw</code> backup.
          </li>
          <li>
            <strong>Share scene file to chat</strong> — send the drawing as an
            attachment.
          </li>
          <li>
            <strong>Share as WebXDC</strong> — package the app with your drawing
            embedded.
          </li>
        </ul>
      </>
    ),
  },
];

const WebxdcHelpDialog = () => {
  const open = useAtomValue(webxdcHelpOpenAtom);
  const [slideIndex, setSlideIndex] = useState(0);

  const slideCount = HELP_SLIDES.length;
  const currentSlide = HELP_SLIDES[slideIndex];

  useEffect(() => {
    if (open) {
      setSlideIndex(0);
    }
  }, [open]);

  const close = useCallback(() => {
    closeWebxdcHelp();
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setSlideIndex(Math.max(0, Math.min(index, slideCount - 1)));
    },
    [slideCount],
  );

  const goNext = useCallback(() => {
    goToSlide(slideIndex + 1);
  }, [goToSlide, slideIndex]);

  const goPrev = useCallback(() => {
    goToSlide(slideIndex - 1);
  }, [goToSlide, slideIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYS.ESCAPE) {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === KEYS.ARROW_LEFT) {
        event.preventDefault();
        goPrev();
        return;
      }

      if (event.key === KEYS.ARROW_RIGHT) {
        event.preventDefault();
        goNext();
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [open, close, goNext, goPrev]);

  return createPortal(
    <div
      className="webxdc-help-modal"
      role="presentation"
      style={{ display: open ? "flex" : "none" }}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="webxdc-help-modal__backdrop"
        aria-label="Close help"
        onClick={close}
        tabIndex={open ? 0 : -1}
      />
      <div
        className="webxdc-help-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="webxdc-help-title"
      >
        <div className="webxdc-help-modal__header">
          <div className="webxdc-help-modal__heading">
            <p className="webxdc-help-modal__eyebrow">
              Help {slideIndex + 1} / {slideCount}
            </p>
            <h2 id="webxdc-help-title">{currentSlide.title}</h2>
          </div>
          <button
            type="button"
            className="webxdc-help-modal__close"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="webxdc-help-modal__body" key={slideIndex}>
          <div className="webxdc-help-dialog">{currentSlide.body}</div>
        </div>

        <div className="webxdc-help-slideshow__footer">
          <button
            type="button"
            className="webxdc-help-slideshow__nav"
            onClick={goPrev}
            disabled={slideIndex === 0}
            aria-label="Previous slide"
          >
            ← Prev
          </button>

          <div
            className="webxdc-help-slideshow__dots"
            role="tablist"
            aria-label="Help slides"
          >
            {HELP_SLIDES.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                role="tab"
                className={
                  index === slideIndex
                    ? "webxdc-help-slideshow__dot is-active"
                    : "webxdc-help-slideshow__dot"
                }
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                aria-selected={index === slideIndex}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {slideIndex < slideCount - 1 ? (
            <button
              type="button"
              className="webxdc-help-slideshow__nav"
              onClick={goNext}
              aria-label="Next slide"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="webxdc-help-slideshow__nav webxdc-help-slideshow__nav--done"
              onClick={close}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default WebxdcHelpDialog;