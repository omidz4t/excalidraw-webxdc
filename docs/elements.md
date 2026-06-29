# Element Data Model

Elements are defined in `packages/element/src/types.ts` and manipulated via `packages/element/src/`.

## Design principles

From the type definition:

> ExcalidrawElement should be JSON serializable and (eventually) contain no computed data. The list of all ExcalidrawElements should be shareable between peers and contain no state local to the peer.

Every element has a stable `id`, monotonically increasing `version`, and `versionNonce` for conflict resolution.

## Element types

| `type` | Description |
| --- | --- |
| `rectangle` | Rectangle with optional rounded corners |
| `diamond` | Diamond/rhombus shape |
| `ellipse` | Ellipse/circle |
| `arrow` | Arrow with optional bindings and labels |
| `line` | Straight or multi-point line |
| `freedraw` | Hand-drawn stroke (points array) |
| `text` | Text with font family, size, alignment |
| `image` | Embedded image (references `fileId`) |
| `frame` | Grouping frame with clip |
| `magicframe` | AI generation frame |
| `iframe` | Embedded iframe |
| `embeddable` | Embeddable content |
| `selection` | Transient selection helper (not persisted) |

## Common base properties

All elements share (`_ExcalidrawElementBase`):

```
id, type, x, y, width, height, angle
strokeColor, backgroundColor, fillStyle
strokeWidth, strokeStyle, roughness, opacity
groupIds, frameId, roundness
seed, version, versionNonce
isDeleted, boundElements, updated
link, locked
index (FractionalIndex for ordering)
```

## Ordering: fractional indexing

Elements are ordered by a `FractionalIndex` string (not array position). This allows concurrent insertions without renumbering.

Package: `@excalidraw/fractional-indexing`  
Used by: element reordering, Yjs sync diff operations

WebXDC `diff.ts` uses `generateKeyBetween` / `generateNKeysBetween` when computing append/move operations.

## Arrow binding

Arrows can bind to other elements at computed fixed points:

```ts
type FixedPointBinding = {
  elementId: string;
  fixedPoint: [number, number];  // 0.0–1.0 ratios
  mode: "inside" | "orbit" | "skip";
};
```

Managed in `packages/element/src/binding.ts` and `elbowArrow.ts`.

## Scene container

`Scene` class (`packages/element/src/Scene.ts`) provides:

- Element lookup by id
- Non-deleted element filtering
- Selection helpers
- Frame hierarchy

## Key operations

| Function | Module | Purpose |
| --- | --- | --- |
| `newRectangleElement()` etc. | `newElement.ts` | Create elements |
| `mutateElement()` | `mutateElement.ts` | Update in place |
| `duplicateElements()` | `duplicate.ts` | Clone with new IDs |
| `resizeElements()` | `resizeElements.ts` | Multi-element resize |
| `alignElements()` | `align.ts` | Alignment |
| `distributeElements()` | `distribute.ts` | Even spacing |
| `getCommonBounds()` | `bounds.ts` | Bounding box |
| `hitTest()` | `collision.ts` | Pointer hit testing |
| `renderElement()` | `renderElement.ts` | Canvas draw |
| `getSceneVersion()` | `index.ts` | Scene version hash |

## Versioning and sync

```ts
getSceneVersion(elements)     // number — quick change detection
hashElementsVersion(elements)  // hash for deduplication
```

During collaboration, `reconcileElements()` merges remote elements with local state, resolving version conflicts.

## Yjs representation (WebXDC)

In WebXDC sync, each element is stored as a `Y.Map` inside `Y.Array("elements")`:

- Properties are set key-by-key on the Y.Map
- Delta operations: `update`, `append`, `delete`, `move`, `bulkAppend`, `bulkDelete`
- Assets stored separately in `Y.Map("assets")` keyed by `fileId`

See `excalidraw-app/webxdc/y-excalidraw/diff.ts` for the full operation types.

## Synced scene settings (WebXDC)

Not all `AppState` is synced. Only these fields cross peers:

| Key | Description |
| --- | --- |
| `viewBackgroundColor` | Canvas background |
| `gridSize` | Grid cell size |
| `gridStep` | Grid subdivision |
| `gridModeEnabled` | Grid visibility |
| `objectsSnapModeEnabled` | Snap to objects |
| `theme` | Light/dark |

Defined in `webxdc/y-excalidraw/scene-settings.ts`.

## Image elements

Images reference binary data via `fileId`:

```ts
type ExcalidrawImageElement = {
  type: "image";
  fileId: FileId;
  status: "pending" | "saved" | "error";
  // ... position, size, etc.
};
```

Binary data lives in `BinaryFiles` (app state), not inline in the element. WebXDC syncs assets via `yAssets` Y.Map; large images go through `sendUpdate` only (not realtime).