# File Index

Quick reference for important files and directories. Excludes `node_modules/`, `build/`, `dist/`.

## Root

| File | Purpose |
| --- | --- |
| `package.json` | Monorepo root — workspaces, scripts, devDependencies |
| `bunfig.toml` | Bun config (`linker = "hoisted"`) |
| `bun.lock` | Lockfile |
| `tsconfig.json` | Root TypeScript config + path aliases |
| `vitest.config.mts` | Test runner configuration |
| `setupTests.ts` | Test environment setup (mocks, polyfills) |
| `Makefile` | WebXDC convenience targets |
| `CLAUDE.md` | AI assistant project guide |
| `README.md` | Upstream Excalidraw readme |
| `.env.development` | Dev environment variables |
| `.env.production` | Production environment variables |
| `.env.test` | Test environment variables |
| `.gitignore` | Git ignore rules |

## `excalidraw-app/` — Application

| File | Purpose |
| --- | --- |
| `App.tsx` | Standard excalidraw.com app |
| `index.tsx` | React DOM entry |
| `index.html` | Standard app HTML template |
| `index.scss` | App styles |
| `vite.config.mts` | Vite config (dual WebXDC/standard mode) |
| `package.json` | App dependencies and scripts |
| `manifest.toml` | WebXDC app manifest |
| `app-jotai.ts` | Shared Jotai store |
| `app_constants.ts` | Timeouts, storage keys, WS constants |
| `sentry.ts` | Sentry error tracking init |
| `useHandleAppTheme.ts` | Theme hook (standard app) |

### `excalidraw-app/webxdc/`

| File | Purpose |
| --- | --- |
| `index.html` | WebXDC HTML entry |
| `index.tsx` | WebXDC boot (waitForWebxdc) |
| `WebxdcApp.tsx` | WebXDC editor shell |
| `WebxdcCollab.tsx` | Collaboration orchestrator |
| `WebxdcMainMenu.tsx` | Slim main menu |
| `webxdc-realtime-channel.ts` | P2P realtime protocol |
| `collab-status.ts` | Sync status atom + API bridge |
| `get-webxdc.ts` | window.webxdc detection |
| `constants.ts` | Sync timing constants |
| `version.ts` | Build version |
| `import-image.ts` | Image import via webxdc API |
| `theme-storage.ts` | Theme persistence |
| `useWebxdcAppTheme.ts` | Theme hook |
| `pointer-ref.ts` | Pointer update ref |
| `user-colors.ts` | Deterministic user colors |
| `webxdc-stub.js` | Minimal webxdc.js for .xdc zip |
| `pwa-stub.ts` | PWA register no-op |
| `webxdc-dev-plugin.mts` | Vite dev server middleware |
| `webxdc-pack-plugin.mts` | Post-build HTML flattening |
| `vite-slim-plugin.mts` | Bundle slimming transforms |
| `ambient.d.ts` | Type augmentations |

### `excalidraw-app/webxdc/y-excalidraw/`

| File | Purpose |
| --- | --- |
| `index.ts` | ExcalidrawBinding class |
| `diff.ts` | Delta operations for Yjs sync |
| `helpers.ts` | Yjs ↔ Excalidraw conversion |
| `cursor-sync.ts` | Collaborator cursor state |
| `scene-settings.ts` | Shared scene settings sync |

### `excalidraw-app/webxdc/stubs/`

| File | Purpose |
| --- | --- |
| `empty-module.ts` | Empty default export |
| `null-component.tsx` | Renders null |
| `sentry-stub.ts` | No-op Sentry |
| `firebase-stub.ts` | No-op Firebase |
| `charts-stub.ts` | No-op charts |
| `ttd-dialog-stub.tsx` | No-op TTD dialog |
| `paste-chart-dialog-stub.tsx` | No-op chart paste |
| `xiaolai-font-stub.ts` | No-op CJK font |

### `excalidraw-app/collab/`

| File | Purpose |
| --- | --- |
| `Collab.tsx` | Firebase + socket.io collaboration |
| `Portal.tsx` | Socket.io client |
| `atoms.ts` | Collab Jotai atoms |
| `types.ts` | Collab type definitions |
| `socket-types.ts` | WebSocket message types |
| `CollabError.tsx` | Error indicator UI |

### `excalidraw-app/data/`

| File | Purpose |
| --- | --- |
| `index.ts` | Room links, encryption |
| `firebase.ts` | Firestore integration |
| `FileManager.ts` | Image file management |
| `localStorage.ts` | Local storage helpers |
| `LocalData.ts` | IndexedDB persistence |
| `Locker.ts` | Save concurrency lock |
| `syncable.ts` | Sync-safe element filter |
| `tabSync.ts` | Multi-tab sync |
| `TTDStorage.ts` | TTD chat storage |

### `excalidraw-app/components/`

| File | Purpose |
| --- | --- |
| `AppMainMenu.tsx` | excalidraw.com menu |
| `AppFooter.tsx` | App footer |
| `AppSidebar.tsx` | App sidebar |
| `AppWelcomeScreen.tsx` | Welcome screen |
| `AI.tsx` | AI features |
| `TopErrorBoundary.tsx` | Error boundary |
| `EncryptedIcon.tsx` | E2E encryption indicator |

## `packages/excalidraw/` — Editor

| File | Purpose |
| --- | --- |
| `index.tsx` | Public API exports |
| `types.ts` | Props, AppState, API types |
| `appState.ts` | Default state, export cleaning |
| `history.ts` | Undo/redo |
| `i18n.ts` | Internationalization |
| `clipboard.ts` | Paste/copy handling |
| `mermaid.ts` | Mermaid import |
| `analytics.ts` | Event tracking |
| `editor-jotai.ts` | Editor Jotai store |
| `gesture.ts` | Multi-touch gestures |
| `scroll.ts` | Scroll/zoom |
| `snapping.ts` | Object snapping |
| `polyfill.ts` | Browser polyfills |

### Key subdirectories

| Directory | Contents |
| --- | --- |
| `actions/` | ~40 user action handlers |
| `charts/` | Spreadsheet chart generation |
| `components/` | ~200 React UI components |
| `components/App.tsx` | Core editor component |
| `components/LayerUI.tsx` | Toolbars and panels |
| `data/` | Serialization, restore, blob, library |
| `fonts/` | Font loading and families |
| `hooks/` | React hooks |
| `locales/` | ~50 translation JSON files |
| `renderer/` | Canvas rendering (static + interactive) |
| `subset/` | HarfBuzz font subsetting |
| `eraser/` | Eraser tool |

## `packages/element/` — Element model

| Directory/File | Contents |
| --- | --- |
| `src/types.ts` | Element type definitions |
| `src/newElement.ts` | Element factories |
| `src/mutateElement.ts` | Element updates |
| `src/binding.ts` | Arrow binding |
| `src/renderElement.ts` | Canvas rendering |
| `src/Scene.ts` | Scene container |
| `src/selection.ts` | Selection logic |
| `src/collision.ts` | Hit testing |
| `src/bounds.ts` | Bounding boxes |
| `src/fractionalIndex.ts` | Element ordering |
| `tests/` | Element unit tests |

## `packages/common/` — Shared utilities

| File | Purpose |
| --- | --- |
| `src/constants.ts` | App-wide constants |
| `src/colors.ts` | Color palette |
| `src/utils.ts` | General helpers |
| `src/bounds.ts` | Bounds utilities |
| `src/emitter.ts` | Event emitter |
| `src/editorInterface.ts` | Editor interface types |

## `packages/math/` — 2D math

| File | Purpose |
| --- | --- |
| `src/vector.ts` | Vector operations |
| `src/line.ts` | Line math |
| `src/curve.ts` | Curve math |
| `src/ellipse.ts` | Ellipse math |
| `src/point.ts` | Point operations |
| `src/polygon.ts` | Polygon operations |

## `packages/utils/` — Export utilities

| File | Purpose |
| --- | --- |
| `src/export.ts` | exportToCanvas/Svg/Blob |
| `src/shape.ts` | Shape rendering for export |

## Other packages

| Package | Entry |
| --- | --- |
| `fractional-indexing` | `src/index.ts` |
| `laser-pointer` | `src/index.ts` |

## `scripts/` — Build tooling

| File | Purpose |
| --- | --- |
| `buildBase.js` | esbuild for base packages |
| `buildPackage.js` | esbuild for excalidraw package |
| `buildUtils.js` | esbuild for utils |
| `build-node.js` | Node.js build |
| `buildWasm.js` | HarfBuzz WASM build |
| `build-version.js` | Version.json for standard app |
| `woff2/` | WOFF2 Vite/esbuild plugins |

## `public/` — Static assets

| File | Purpose |
| --- | --- |
| `webxdc.js` | Dev shim for window.webxdc |
| `Virgil.woff2` | Hand-drawn font |
| `Assistant-Regular.woff2` | UI font |
| `android-chrome-192x192.png` | App icon |

## `docs/` — This documentation

See [README.md](./README.md) for the full documentation index.