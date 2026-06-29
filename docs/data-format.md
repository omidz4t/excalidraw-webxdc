# Data Format

Excalidraw scenes are stored as JSON with an open format.

## `.excalidraw` file structure

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [ /* ExcalidrawElement[] */ ],
  "appState": { /* partial AppState */ },
  "files": { /* fileId → BinaryFileData */ }
}
```

### Fields

| Field | Type | Description |
| --- | --- | --- |
| `type` | `"excalidraw"` | Format identifier (`EXPORT_DATA_TYPES.excalidraw`) |
| `version` | `number` | Schema version (`VERSIONS.excalidraw`, currently 2) |
| `source` | `string` | Origin URL or app identifier |
| `elements` | `ExcalidrawElement[]` | All elements including deleted |
| `appState` | `Partial<AppState>` | Viewport, colors, name, etc. |
| `files` | `BinaryFiles` | Embedded images (local export only) |

### Serialization

```ts
import { serializeAsJSON } from "@excalidraw/excalidraw";

const json = serializeAsJSON(elements, appState, files, "local");
```

Types:
- `"local"` — includes files, cleans app state for export
- `"database"` — strips files, clears sensitive app state

Implementation: `packages/excalidraw/data/json.ts`

## Library format

Shape libraries use a separate format:

```json
{
  "type": "excalidrawlib",
  "version": 2,
  "source": "...",
  "libraryItems": [ /* LibraryItem[] */ ]
}
```

Functions: `serializeLibraryAsJSON`, `mergeLibraryItems`, `getLibraryItemsHash`

## Binary file data

```ts
type BinaryFileData = {
  mimeType: string;
  id: FileId;
  dataURL: string;       // base64 data URL
  created: number;
  lastRetrieved?: number;
};
```

Images are stored separately from elements. Elements reference them via `fileId`.

## Compression & encoding

`packages/excalidraw/data/encode.ts`:

- `compressData()` / `decompressData()` — deflate compression for collab payloads
- Used by standard app Firebase sync

## Encryption

`packages/excalidraw/data/encryption.ts`:

- `generateEncryptionKey()` — room encryption keys
- `encryptData()` / `decryptData()` — AES-GCM encryption
- Used for excalidraw.com collaboration links: `#room=<id>,<key>`

WebXDC does not use this — Delta Chat provides transport encryption.

## Restoration

```ts
import { restoreElements, restoreAppState } from "@excalidraw/excalidraw";

const restored = restoreElements(elements, null, { refreshDimensions: true });
const appState = restoreAppState(appState, null);
```

`restore.ts` handles:

- Schema migrations between versions
- Missing property defaults
- Font family validation
- Dimension recalculation

## Reconciliation (collaboration)

```ts
import { reconcileElements } from "@excalidraw/excalidraw";

const merged = reconcileElements(localElements, remoteElements, localAppState);
```

Used by standard app collab to merge concurrent edits. WebXDC uses Yjs CRDT instead.

## Clipboard formats

On copy, Excalidraw puts multiple formats on the clipboard:

| Format | Content |
| --- | --- |
| `text/plain` | JSON or SVG |
| `image/png` | Rendered image (optional) |
| Custom MIME | `application/vnd.excalidraw+json` |

Paste handler in `App.tsx` detects format and imports accordingly.

## WebXDC persistence

In WebXDC, the canonical store is the **Yjs document** serialized through `y-webxdc` → `sendUpdate`. The `.excalidraw` JSON format is not used for sync; it's the internal representation within Yjs maps.

Chat history replays Yjs updates, not raw JSON files.