# WebXDC Internals

Deep dive into every file in `excalidraw-app/webxdc/`.

## Boot chain

```
index.html
  ├── <script src="webxdc.js">     ← host injects API (stub in dev)
  └── <script type="module" src="./index.tsx">
        └── waitForWebxdc()
              └── WebxdcApp.tsx
                    ├── Excalidraw
                    ├── WebxdcMainMenu
                    └── WebxdcCollab
```

## File reference

### `index.html`

Minimal HTML for WebXDC CSP constraints:

- Sets `window.EXCALIDRAW_ASSET_PATH = "./"` (self-hosted fonts)
- Inline theme flash prevention via `localStorage`
- Full viewport, no overflow
- `webxdc.js` must load **before** the app module (realFinger pattern)

### `index.tsx`

Boot entry:

1. Sets `collabSyncStatusAtom.buildId` from `WEBXDC_VERSION`
2. Calls `waitForWebxdc()` (50ms poll, 15s timeout)
3. Shows HTML error if `window.webxdc` missing
4. Renders `<WebxdcApp />`

### `WebxdcApp.tsx`

Editor shell:

- `Provider` with shared `appJotaiStore`
- `ExcalidrawAPIProvider` for imperative API
- `Excalidraw` with WebXDC-specific props
- `webxdcPointerUpdateRef` bridges pointer events to collab
- `webxdcImageInsertContext` for image import
- `useWebxdcAppTheme` for theme

### `WebxdcCollab.tsx`

Collaboration orchestrator (see [Collaboration](./collaboration.md)):

1. `createWebxdcSyncBridge()` — safe webxdc delegate
2. `WebxdcRealtimeChannel` — P2P layer
3. `Y.Doc` + `WebxdcProvider` — persistent layer
4. `ExcalidrawBinding` — editor ↔ Yjs bridge
5. Registers `CollabAPI` on Jotai atoms

### `WebxdcMainMenu.tsx`

Slim menu:

- Search
- Insert image (via `importImagesViaWebxdc`)
- Help
- Clear canvas
- Preferences (with theme toggle, no system theme)
- Change canvas background

### `webxdc-realtime-channel.ts`

`WebxdcRealtimeChannel` class — see [Realtime Protocol](./webxdc-realtime-protocol.md).

### `collab-status.ts`

- `collabSyncStatusAtom` — diagnostic Jotai atom
- `createWebxdcSyncBridge()` — wraps frozen `window.webxdc`

Bridge methods: `sendUpdate`, `setUpdateListener`, `joinRealtimeChannel`, `getAllUpdates`, `sendToChat`, `importFiles`.

### `get-webxdc.ts`

```ts
getWebxdc()         // Returns window.webxdc if present
waitForWebxdc(ms)   // Poll until available or timeout
```

### `constants.ts`

```ts
isWebxdcMode        // import.meta.env.VITE_APP_WEBXDC === "true"
REALTIME_DOC_MS     // 80ms — P2P document throttle
PERSIST_FLUSH_MS    // 500ms — sendUpdate throttle while drawing
PERSIST_SCENE_SYNC_MS // 3000ms — minimum autosave interval
```

### `version.ts`

```ts
WEBXDC_VERSION = import.meta.env.VITE_WEBXDC_VERSION ?? "dev"
```

### `import-image.ts`

Image insertion for WebXDC.

**Auto-installed:** `installWebxdcPasteFix()` runs at module load (when `document` is defined) — no manual setup needed.

- `importImagesViaWebxdc()` — calls `webxdc.importFiles()`, simulates drop event
- `focusCanvasForPaste()` — ensures paste targets canvas
- Clipboard paste fallback via `readSystemClipboard()`
- `webxdcImageInsertContext` — shared container + API refs

### `theme-storage.ts`

Dual persistence:

1. `localStorage` key `excalidraw-theme` — instant flash prevention
2. IndexedDB via `idb-keyval` — durable storage (`excalidraw-webxdc-settings`)

### `useWebxdcAppTheme.ts`

Hook wrapping theme load/save. System theme disabled in WebXDC menu.

### `pointer-ref.ts`

```ts
webxdcPointerUpdateRef = { current: onPointerUpdate | null }
```

Module-level ref so `WebxdcApp` can wire `onPointerUpdate` prop without prop drilling to `WebxdcCollab`.

### `user-colors.ts`

`pickUserColor(selfAddr)` — deterministic color from address hash for cursor/avatar colors.

### `webxdc-stub.js`

Minimal `webxdc.js` copied into `.xdc` zip. Host normally replaces at runtime. Ensures script tag resolves inside zip.

### `ambient.d.ts`

Type augmentations for WebXDC-specific `import.meta.env` fields.

### `pwa-stub.ts`

No-op replacement for `virtual:pwa-register` in WebXDC builds.

## Yjs binding (`y-excalidraw/`)

### `index.ts` — `ExcalidrawBinding`

Bidirectional sync between Excalidraw API and Yjs types:

- `yElements: Y.Array<Y.Map>`
- `yAssets: Y.Map`
- `ySceneSettings: Y.Map`

### `diff.ts`

Delta operation computation:

- `getDeltaOperationsForElements()` — compare last known vs current
- `getDeltaOperationsForAssets()` — image file changes
- `applyElementOperations()` / `applyAssetOperations()` — write to Yjs

Operation types: `update`, `append`, `delete`, `move`, `bulkAppend`, `bulkDelete`.

### `helpers.ts`

- `yjsToExcalidraw()` — Y.Map → ExcalidrawElement
- `areElementsSame()` — equality check
- `debounce()` — remote update debouncing
- `moveArrayItem()` — array reorder helper

### `cursor-sync.ts`

Converts peer state to `Collaborator` objects for the editor's collaborator rendering.

### `scene-settings.ts`

Syncs background color, grid, and theme across peers via `ySceneSettings`.

## Vite plugins

### `webxdc-dev-plugin.mts`

Dev server middleware:

- Rewrites `/webxdc/*` proxied paths for webxdc-dev
- Serves `manifest.toml`
- Serves `public/webxdc.js` shim
- Redirects `/` → `/webxdc/`
- Fixes empty HTML response for `/webxdc/`

### `webxdc-pack-plugin.mts`

Post-build:

- Flatten `webxdc/index.html` → `index.html`
- Inject `webxdc.js` script before app bundle
- Copy versioned `manifest.toml`
- Copy `webxdc-stub.js`

### `vite-slim-plugin.mts`

Pre-build transforms and post-bundle asset filtering. See [WebXDC Stubs](./webxdc-stubs.md).

## Stubs directory

See [WebXDC Stubs](./webxdc-stubs.md).