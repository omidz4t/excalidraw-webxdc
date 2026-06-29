# Packages

All packages live under `packages/` and are versioned together at **0.18.0** (except `@excalidraw/utils` at 0.1.2).

## @excalidraw/excalidraw

**Path:** `packages/excalidraw/`  
**npm:** `@excalidraw/excalidraw`  
**Entry:** `index.tsx`

The main React component library. This is what consumers embed in their apps.

### Key exports

- `Excalidraw` — main editor component
- `ExcalidrawAPIProvider`, `useExcalidrawAPI` — imperative API access
- `MainMenu`, `WelcomeScreen`, `Footer`, etc. — composable UI slots
- `exportToCanvas`, `exportToSvg`, `exportToBlob` — export functions
- `restore`, `restoreAppState`, `restoreElements` — deserialization

### Dependencies

Rough.js, perfect-freehand, Radix UI, CodeMirror, jotai, pako, and all internal `@excalidraw/*` packages.

### Build

```bash
bun run build:excalidraw   # from repo root
# or
bun run --cwd packages/excalidraw build:esm
```

Produces `dist/dev/` and `dist/prod/` ESM bundles plus TypeScript declarations.

---

## @excalidraw/element

**Path:** `packages/element/`  
**Entry:** `src/index.ts`

Element model, geometry, and manipulation logic. Used heavily by the editor and export utilities.

### Responsibilities

- Element types (`ExcalidrawElement`, shapes, text, images, frames, arrows)
- Hit testing, collision detection, selection
- Binding (arrow endpoints), grouping, z-ordering
- Resize, rotate, crop, duplicate, distribute, align
- Fractional indexing for stable element ordering
- Scene versioning (`getSceneVersion`, `hashElementsVersion`)

### Key modules

| Module | Purpose |
| --- | --- |
| `newElement.ts` | Element factory functions |
| `mutateElement.ts` | In-place element updates |
| `binding.ts` | Arrow binding logic |
| `linearElementEditor.ts` | Polyline/arrow editing |
| `renderElement.ts` | Canvas draw routines |
| `Scene.ts` | Scene container |
| `fractionalIndex.ts` | Ordering via fractional indices |

---

## @excalidraw/common

**Path:** `packages/common/`  
**Entry:** `src/index.ts`

Shared utilities, constants, and infrastructure used across packages.

### Exports include

- `bounds`, `colors`, `constants`, `keys`, `points`
- `utils` — general helpers (`throttleRAF`, `toBrandedType`, etc.)
- `emitter`, `appEventBus` — event infrastructure
- `promise-pool`, `queue`, `binary-heap`
- `editorInterface`, `versionedSnapshotStore`

---

## @excalidraw/math

**Path:** `packages/math/`  
**Entry:** `src/index.ts`

2D mathematics: vectors, lines, curves, intersections, angles.

Used for arrow routing, elbow arrows, hit testing, and geometric computations throughout the element package.

---

## @excalidraw/utils

**Path:** `packages/utils/`  
**Entry:** `src/index.ts`  
**Version:** 0.1.2

Standalone export utilities that can be used without the full editor.

### API

- `serializeAsJSON` — serialize scene to `.excalidraw` format
- `exportToBlob` — export diagram to PNG Blob
- `exportToSvg` — export diagram to SVGElement

Depends on Rough.js and laser-pointer for rendering exports.

---

## @excalidraw/fractional-indexing

**Path:** `packages/fractional-indexing/`  
**Entry:** `src/index.ts`

Fractional indexing implementation for maintaining stable element order during concurrent edits. Used by `@excalidraw/element`.

---

## @excalidraw/laser-pointer

**Path:** `packages/laser-pointer/`  
**Entry:** `src/index.ts`

Laser pointer path smoothing and state management. Used by the editor and `@excalidraw/utils`.

### Modules

- `index.ts` — public API
- `state.ts` — pointer state machine
- `simplify.ts` — path simplification
- `math.ts` — geometric helpers

---

## excalidraw-app

**Path:** `excalidraw-app/`  
**Private:** yes

The application workspace. Not published to npm.

### Standard app (`App.tsx`)

Full excalidraw.com experience with PWA, Firebase collab, share dialogs, AI features, etc.

### WebXDC app (`webxdc/`)

Delta Chat integration layer. See [WebXDC](./webxdc.md).

### Key dependencies (app-only)

| Package | Purpose |
| --- | --- |
| `yjs`, `y-webxdc` | CRDT sync over Delta Chat |
| `@webxdc/types` | TypeScript types for WebXDC API |
| `@webxdc/vite-plugins` | Build and dev tooling |
| `@webxdc/webxdc-dev` | Multi-peer dev simulator |
| `firebase` | Standard app collaboration backend |
| `socket.io-client` | Standard app realtime |
| `jotai` | App-level state |
| `idb-keyval` | IndexedDB persistence |

---

## Package build scripts

| Script | Builds |
| --- | --- |
| `scripts/buildBase.js` | common, element, math, fractional-indexing, laser-pointer |
| `scripts/buildPackage.js` | excalidraw (with SCSS) |
| `scripts/buildUtils.js` | utils |
| `scripts/build-node.js` | Node.js test utilities |

All use **esbuild** with separate `development` and `production` env bundles.

```bash
bun run build:packages   # Build all packages in dependency order
```

Build order enforced by root `package.json`:

```
common → fractional-indexing → laser-pointer → math → element → excalidraw
```