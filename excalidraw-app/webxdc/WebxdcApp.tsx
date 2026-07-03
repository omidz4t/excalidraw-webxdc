import {
  Excalidraw,
  ExcalidrawAPIProvider,
  useExcalidrawAPI,
} from "@excalidraw/excalidraw";
import { resolvablePromise } from "@excalidraw/common";
import { useEffect, useRef, useCallback, useMemo } from "react";

import { Provider, appJotaiStore } from "../app-jotai";
import WebxdcCollab from "./WebxdcCollab";
import WebxdcFollowBorder from "./WebxdcFollowBorder";
import WebxdcFollowRequestDialog from "./WebxdcFollowRequestDialog";
import WebxdcHelpDialog from "./WebxdcHelpDialog";
import WebxdcLoadingOverlay from "./WebxdcLoadingOverlay";
import WebxdcMainMenu from "./WebxdcMainMenu";
import WebxdcMobileSaveButton from "./WebxdcMobileSaveButton";
import WebxdcPropagationIndicator from "./WebxdcPropagationIndicator";
import { webxdcPointerUpdateRef } from "./pointer-ref";
import { useWebxdcAppTheme } from "./useWebxdcAppTheme";
import {
  focusCanvasForPaste,
  webxdcImageInsertContext,
} from "./import-image";
import {
  installWebxdcShapeClipboard,
  webxdcShapeClipboardContext,
} from "./install-shape-clipboard";
import { installWebxdcSaveShortcut } from "./install-save-shortcut";
import { parsePastedShapeText, pasteShapeXfer } from "./shape-clipboard";
import { useWebxdcSettings } from "./useWebxdcSettings";

import type {
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";

import "../index.scss";

const WEBXDC_UI_OPTIONS = {
  canvasActions: {
    toggleTheme: true,
    saveToActiveFile: false,
    loadScene: false,
    export: false,
    saveAsImage: false,
  },
} as const;

const WebxdcWrapper = () => {
  const excalidrawAPI = useExcalidrawAPI();
  const { editorTheme, setAppTheme } = useWebxdcAppTheme();
  useWebxdcSettings();

  const containerRef = useRef<HTMLDivElement>(null);
  const initialStatePromiseRef = useRef<{
    promise: ReturnType<typeof resolvablePromise<ExcalidrawInitialDataState | null>>;
  }>({ promise: null! });

  const onPointerDown = useCallback(() => {
    focusCanvasForPaste(containerRef.current);
  }, []);

  const onPointerUpdate = useCallback<
    NonNullable<ExcalidrawProps["onPointerUpdate"]>
  >((payload) => {
    webxdcPointerUpdateRef.current?.(payload);
  }, []);

  const onPaste = useCallback<NonNullable<ExcalidrawProps["onPaste"]>>(
    async (data) => {
      const api = excalidrawAPI;
      if (!api) {
        return;
      }

      const payload = parsePastedShapeText(data.text ?? "");
      if (!payload?.elements.length) {
        return;
      }

      pasteShapeXfer(api, payload);
      return false;
    },
    [excalidrawAPI],
  );

  const uiOptions = useMemo(
    () => ({
      canvasActions: { ...WEBXDC_UI_OPTIONS.canvasActions },
    }),
    [],
  );

  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  useEffect(() => {
    initialStatePromiseRef.current.promise.resolve(null);
  }, []);

  const syncWebxdcContexts = useCallback(
    (api: typeof excalidrawAPI) => {
      webxdcImageInsertContext.container = containerRef.current;
      webxdcImageInsertContext.api = api;
      webxdcShapeClipboardContext.container = containerRef.current;
      webxdcShapeClipboardContext.api = api;
    },
    [],
  );

  useEffect(() => {
    syncWebxdcContexts(excalidrawAPI);
  }, [excalidrawAPI, syncWebxdcContexts]);

  useEffect(() => installWebxdcSaveShortcut(), []);
  useEffect(() => installWebxdcShapeClipboard(), []);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", position: "relative" }}
      className="excalidraw-app is-collaborating"
      onPointerDown={onPointerDown}
    >
      <WebxdcPropagationIndicator />
      {excalidrawAPI && <WebxdcFollowBorder />}
      <Excalidraw
        initialData={initialStatePromiseRef.current.promise}
        isCollaborating={true}
        onPointerUpdate={onPointerUpdate}
        langCode="en"
        detectScroll={false}
        handleKeyboardGlobally={true}
        autoFocus={true}
        theme={editorTheme}
        onThemeChange={setAppTheme}
        onInitialize={syncWebxdcContexts}
        onPaste={onPaste}
        UIOptions={uiOptions}
        renderTopRightUI={(isMobile) =>
          isMobile ? <WebxdcMobileSaveButton /> : null
        }
      >
        <WebxdcLoadingOverlay />
        <WebxdcFollowRequestDialog />
        <WebxdcHelpDialog />
        <WebxdcMainMenu />
        {excalidrawAPI && <WebxdcCollab excalidrawAPI={excalidrawAPI} />}
      </Excalidraw>
    </div>
  );
};

const WebxdcApp = () => {
  return (
    <Provider store={appJotaiStore}>
      <ExcalidrawAPIProvider>
        <WebxdcWrapper />
      </ExcalidrawAPIProvider>
    </Provider>
  );
};

export default WebxdcApp;