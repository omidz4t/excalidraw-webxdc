# Common Package (`@excalidraw/common`)

Shared foundation used by all other packages. Entry: `packages/common/src/index.ts`.

## Modules

| File | Exports / purpose |
| --- | --- |
| `constants.ts` | `APP_NAME`, `EVENT`, `TOOL_TYPE`, `FONT_FAMILY`, `THEME`, `MIME_TYPES`, `VERSIONS`, thresholds |
| `colors.ts` | `COLOR_PALETTE`, color utilities |
| `bounds.ts` | Generic bounds helpers |
| `points.ts` | Point type and operations |
| `keys.ts` | `KEYS`, `CODES` — keyboard constants |
| `utils.ts` | `debounce`, `throttleRAF`, `resolvablePromise`, `toBrandedType`, `cloneJSON`, env checks |
| `url.ts` | URL parsing and normalization |
| `random.ts` | Random ID generation |
| `emitter.ts` | Generic `Emitter<T>` class |
| `appEventBus.ts` | Cross-component event bus |
| `editorInterface.ts` | `isDarwin`, form factor detection |
| `font-metadata.ts` | Font metrics and fallbacks |
| `binary-heap.ts` | Priority heap |
| `queue.ts` | Queue data structure |
| `promise-pool.ts` | Concurrent promise limiter |
| `versionedSnapshotStore.ts` | Versioned snapshot storage |
| `utility-types.ts` | `ValueOf`, `MakeBrand`, `MaybePromise`, etc. |
| `debug.ts` | Debug utilities (exported as `Debug`) |

## Key constants (`constants.ts`)

| Constant | Value | Purpose |
| --- | --- | --- |
| `DRAGGING_THRESHOLD` | 10px | Min drag before move |
| `TEXT_AUTOWRAP_THRESHOLD` | 36px | Text auto-wrap vs fixed width |
| `MINIMUM_ARROW_SIZE` | 20px | Min arrow length |
| `LINE_CONFIRM_THRESHOLD` | 8px | Min line length |
| `DEFAULT_LASER_COLOR` | `"red"` | Laser pointer default |
| `ENCRYPTION_KEY_BITS` | 128 | AES-GCM key size |

## EVENT enum

DOM and custom events used throughout the editor:

`COPY`, `PASTE`, `CUT`, `KEYDOWN`, `KEYUP`, `POINTER_DOWN`, `POINTER_UP`, `POINTER_MOVE`, `WHEEL`, `SCROLL`, `HASHCHANGE`, `VISIBILITY_CHANGE`, `BEFORE_UNLOAD`, etc.

WebXDC paste fix listens on `EVENT.PASTE` at capture phase.

## TOOL_TYPE

Re-exported tool type string constants matching `ToolType` in excalidraw types.

## THEME

```ts
THEME.LIGHT = "light"
THEME.DARK = "dark"
```

## VERSIONS

```ts
VERSIONS.excalidraw        // JSON schema version (2)
VERSIONS.excalidrawLibrary // Library schema version
```

## MIME_TYPES

Export MIME types for clipboard and file handling:

- `application/vnd.excalidraw+json`
- `image/png`, `image/svg+xml`
- etc.

## Tests

| File | Covers |
| --- | --- |
| `utils.test.ts` | Utility functions |
| `colors.test.ts` | Color utilities |
| `appEventBus.test.ts` | Event bus |
| `tests/queue.test.ts` | Queue |
| `tests/binary-heap.test.ts` | Heap |
| `tests/keys.test.ts` | Key constants |
| `tests/url.test.tsx` | URL helpers |