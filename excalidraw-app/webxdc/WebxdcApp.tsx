import {
  Excalidraw,
  ExcalidrawAPIProvider,
  useExcalidrawAPI,
} from "@excalidraw/excalidraw";
import { resolvablePromise } from "@excalidraw/common";
import { useEffect, useRef, useCallback } from "react";

import { Provider, useAtom, appJotaiStore } from "../app-jotai";
import { isCollaboratingAtom } from "../collab/atoms";
import WebxdcCollab from "./WebxdcCollab";
import WebxdcMainMenu from "./WebxdcMainMenu";
import WebxdcPropagationIndicator from "./WebxdcPropagationIndicator";
import { webxdcPointerUpdateRef } from "./pointer-ref";
import { useWebxdcAppTheme } from "./useWebxdcAppTheme";
import {
  focusCanvasForPaste,
  webxdcImageInsertContext,
} from "./import-image";

import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

import "../index.scss";

const WebxdcWrapper = () => {
  const excalidrawAPI = useExcalidrawAPI();
  useAtom(isCollaboratingAtom);
  const { editorTheme, setAppTheme } = useWebxdcAppTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const initialStatePromiseRef = useRef<{
    promise: ReturnType<typeof resolvablePromise<ExcalidrawInitialDataState | null>>;
  }>({ promise: null! });

  const onPointerDown = useCallback(() => {
    focusCanvasForPaste(containerRef.current);
  }, []);

  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  useEffect(() => {
    initialStatePromiseRef.current.promise.resolve(null);
  }, []);

  useEffect(() => {
    webxdcImageInsertContext.container = containerRef.current;
    webxdcImageInsertContext.api = excalidrawAPI;
  }, [excalidrawAPI]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%" }}
      className="excalidraw-app is-collaborating"
      onPointerDown={onPointerDown}
    >
      <WebxdcPropagationIndicator />
      <Excalidraw
        initialData={initialStatePromiseRef.current.promise}
        isCollaborating={true}
        onPointerUpdate={(payload) => {
          webxdcPointerUpdateRef.current?.(payload);
        }}
        langCode="en"
        detectScroll={false}
        handleKeyboardGlobally={true}
        autoFocus={true}
        theme={editorTheme}
        onThemeChange={setAppTheme}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
          },
        }}
      >
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