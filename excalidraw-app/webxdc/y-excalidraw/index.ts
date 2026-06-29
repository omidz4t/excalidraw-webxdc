import type {
  BinaryFileData,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { CaptureUpdateAction } from "@excalidraw/element";
import * as Y from "yjs";

import { areElementsSame, debounce, yjsToExcalidraw } from "./helpers";
import {
  applyAssetOperations,
  applyElementOperations,
  getDeltaOperationsForAssets,
  getDeltaOperationsForElements,
} from "./diff";

import type { LastKnownOrderedElement, Operation } from "./diff";
import {
  areSceneSettingsSame,
  pickSceneSettings,
  sceneSettingsFromYMap,
  writeSceneSettingsToYMap,
} from "./scene-settings";

import type { SyncedSceneSettings } from "./scene-settings";

export { yjsToExcalidraw };

export type CollabCallbacks = {
  onSelectionChange?: (selectedElementIds: Record<string, boolean>) => void;
};

export class ExcalidrawBinding {
  yElements: Y.Array<Y.Map<any>>;
  yAssets: Y.Map<any>;
  ySceneSettings: Y.Map<unknown>;
  api: ExcalidrawImperativeAPI;
  collabCallbacks?: CollabCallbacks;
  undoManager?: Y.UndoManager;

  subscriptions: (() => void)[] = [];
  lastKnownElements: LastKnownOrderedElement[] = [];
  lastKnownFileIds: Set<string> = new Set();
  lastKnownSceneSettings: SyncedSceneSettings;

  constructor(
    yElements: Y.Array<Y.Map<any>>,
    yAssets: Y.Map<any>,
    ySceneSettings: Y.Map<unknown>,
    api: ExcalidrawImperativeAPI,
    collabCallbacks?: CollabCallbacks,
    undoConfig?: {
      excalidrawDom: HTMLElement;
      undoManager: Y.UndoManager;
    },
  ) {
    this.yElements = yElements;
    this.yAssets = yAssets;
    this.ySceneSettings = ySceneSettings;
    this.api = api;
    this.collabCallbacks = collabCallbacks;
    this.lastKnownSceneSettings = pickSceneSettings(api.getAppState());
    const excalidrawDom = undoConfig?.excalidrawDom;
    this.undoManager = undoConfig?.undoManager;

    this.subscriptions.push(
      this.api.onChange((_, state, files) => {
        const elements = this.api.getSceneElements();

        let operations: Operation[] = [];
        if (!areElementsSame(this.lastKnownElements, elements)) {
          const res = getDeltaOperationsForElements(
            this.lastKnownElements,
            elements,
          );
          operations = res.operations;
          this.lastKnownElements = res.lastKnownElements;
          applyElementOperations(this.yElements, operations, this);
        }

        const res = getDeltaOperationsForAssets(this.lastKnownFileIds, files);
        const assetOperations = res.operations;
        this.lastKnownFileIds = res.lastKnownFileIds;
        if (assetOperations.length > 0) {
          applyAssetOperations(this.yAssets, assetOperations, this);
        }

        const sceneSettings = pickSceneSettings(state);
        if (!areSceneSettingsSame(this.lastKnownSceneSettings, sceneSettings)) {
          this.lastKnownSceneSettings = sceneSettings;
          writeSceneSettingsToYMap(this.ySceneSettings, sceneSettings, this);
        }

        this.collabCallbacks?.onSelectionChange?.(state.selectedElementIds);
      }),
    );

    const _remoteSceneSettingsHandler = (
      _event: Y.YMapEvent<unknown>,
      txn: Y.Transaction,
    ) => {
      if (txn.origin === this) {
        return;
      }

      const remoteSettings = sceneSettingsFromYMap(this.ySceneSettings);
      if (
        !remoteSettings ||
        areSceneSettingsSame(this.lastKnownSceneSettings, remoteSettings)
      ) {
        return;
      }

      this.lastKnownSceneSettings = remoteSettings;
      this.api.updateScene({
        appState: remoteSettings,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    };
    this.ySceneSettings.observe(_remoteSceneSettingsHandler);
    this.subscriptions.push(() => {
      this.ySceneSettings.unobserve(_remoteSceneSettingsHandler);
    });

    const _remoteElementsChangeHandler = (
      event: Array<Y.YEvent<any>>,
      txn: Y.Transaction,
    ) => {
      if (txn.origin === this) {
        return;
      }

      const changedElementIds = new Set(
        event.flatMap((e) => {
          if (e instanceof Y.YMapEvent) {
            return [e.target.get("el").id as string];
          }
          return [];
        }),
      );

      const remoteElements = yjsToExcalidraw(this.yElements);
      const elements = remoteElements.map((el) => {
        if (changedElementIds.has(el.id)) {
          return el;
        }
        return (
          this.api.getSceneElements().find((existingEl) => existingEl.id === el.id) ||
          el
        );
      });

      this.lastKnownElements = this.yElements
        .toArray()
        .map((x) => ({
          id: x.get("el").id,
          version: x.get("el").version,
          pos: x.get("pos"),
        }))
        .sort((a, b) => {
          const key1 = a.pos;
          const key2 = b.pos;
          return key1 > key2 ? 1 : key1 < key2 ? -1 : 0;
        });
      this.api.updateScene({ elements });
    };
    this.yElements.observeDeep(_remoteElementsChangeHandler);
    this.subscriptions.push(() =>
      this.yElements.unobserveDeep(_remoteElementsChangeHandler),
    );

    const _remoteFilesChangeHandler = (
      events: Y.YMapEvent<any>,
      txn: Y.Transaction,
    ) => {
      if (txn.origin === this) {
        return;
      }

      const addedFiles = [...events.keysChanged].map(
        (key) => this.yAssets.get(key) as BinaryFileData,
      );
      this.api.addFiles(addedFiles);
    };
    this.yAssets.observe(_remoteFilesChangeHandler);
    this.subscriptions.push(() => {
      this.yAssets.unobserve(_remoteFilesChangeHandler);
    });

    if (this.undoManager && excalidrawDom) {
      this.setupUndoRedo(excalidrawDom);
    }

    const initialValue = yjsToExcalidraw(this.yElements);
    this.lastKnownElements = this.yElements
      .toArray()
      .map((x) => ({
        id: x.get("el").id,
        version: x.get("el").version,
        pos: x.get("pos"),
      }))
      .sort((a, b) => {
        const key1 = a.pos;
        const key2 = b.pos;
        return key1 > key2 ? 1 : key1 < key2 ? -1 : 0;
      });
    const remoteSceneSettings = sceneSettingsFromYMap(this.ySceneSettings);
    if (remoteSceneSettings) {
      this.lastKnownSceneSettings = remoteSceneSettings;
    } else {
      writeSceneSettingsToYMap(
        this.ySceneSettings,
        this.lastKnownSceneSettings,
        this,
      );
    }

    this.api.updateScene({
      elements: initialValue,
      appState: {
        isLoading: false,
        ...(remoteSceneSettings ?? {}),
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    });

    this.api.addFiles(
      [...this.yAssets.keys()].map(
        (key) => this.yAssets.get(key) as BinaryFileData,
      ),
    );

  }

  private setupUndoRedo(excalidrawDom: HTMLElement) {
    this.undoManager!.addTrackedOrigin(this);
    this.subscriptions.push(() =>
      this.undoManager!.removeTrackedOrigin(this),
    );

    const _keyPressHandler = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key?.toLocaleLowerCase() === "z"
      ) {
        event.stopPropagation();
        this.undoManager!.redo();
      } else if (event.ctrlKey && event.key?.toLocaleLowerCase() === "z") {
        event.stopPropagation();
        this.undoManager!.undo();
      }
    };
    excalidrawDom.addEventListener("keydown", _keyPressHandler, {
      capture: true,
    });
    this.subscriptions.push(() =>
      excalidrawDom?.removeEventListener("keydown", _keyPressHandler, {
        capture: true,
      }),
    );

    let undoButton: HTMLButtonElement | null = null;
    let redoButton: HTMLButtonElement | null = null;

    const _undoBtnHandler = (event: Event) => {
      event.stopImmediatePropagation();
      this.undoManager!.undo();
    };
    const _redoBtnHandler = (event: Event) => {
      event.stopImmediatePropagation();
      this.undoManager!.redo();
    };

    const _resizeListener = () => {
      if (!undoButton || !undoButton.isConnected) {
        undoButton?.removeEventListener("click", _undoBtnHandler);
        undoButton = excalidrawDom.querySelector('[aria-label="Undo"]');
        undoButton?.addEventListener("click", _undoBtnHandler);
      }

      if (!redoButton || !redoButton.isConnected) {
        redoButton?.removeEventListener("click", _redoBtnHandler);
        redoButton = excalidrawDom.querySelector('[aria-label="Redo"]');
        redoButton?.addEventListener("click", _redoBtnHandler);
      }
    };

    const ro = new ResizeObserver(debounce(_resizeListener, 100));
    ro.observe(excalidrawDom);
    _resizeListener();

    this.subscriptions.push(() =>
      undoButton?.removeEventListener("click", _undoBtnHandler),
    );
    this.subscriptions.push(() =>
      redoButton?.removeEventListener("click", _redoBtnHandler),
    );
    this.subscriptions.push(() => ro.disconnect());
  }

  destroy() {
    for (const s of this.subscriptions) {
      s();
    }
  }
}