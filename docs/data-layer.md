# Data Layer

How data flows through serialization, persistence, and sync layers.

## Editor data (`packages/excalidraw/data/`)

| File | Purpose |
| --- | --- |
| `json.ts` | `serializeAsJSON`, `saveAsJSON`, `loadFromJSON` |
| `blob.ts` | `loadFromBlob`, `exportToCanvas`, file type detection, `getDataURL` |
| `restore.ts` | `restoreElements`, `restoreAppState`, schema migration |
| `reconcile.ts` | `reconcileElements` — merge local + remote (standard collab) |
| `encode.ts` | `compressData` / `decompressData` — zlib compression |
| `encryption.ts` | AES-GCM encrypt/decrypt for room keys |
| `library.ts` | Shape library load/save/merge |
| `filesystem.ts` | `fileOpen`, `fileSave` via browser-fs-access |
| `image.ts` | Image dimension detection, processing |
| `resave.ts` | Re-save with updated schema |
| `types.ts` | `ImportedDataState`, `ExportedDataState` |
| `EditorLocalStorage.ts` | Editor-internal preferences |
| `ai/types.ts` | AI feature data types |

See also [Data Format](./data-format.md) and [Reconcile & Delta](./reconcile-and-delta.md).

## App data (`excalidraw-app/data/`)

| File | Purpose |
| --- | --- |
| `index.ts` | Room link parsing, encryption key generation, socket data types |
| `firebase.ts` | Firestore read/write for collaboration rooms |
| `FileManager.ts` | Image encoding/upload, stale image status updates |
| `LocalData.ts` | IndexedDB persistence for elements, files, app state |
| `localStorage.ts` | Username and preference storage |
| `Locker.ts` | Mutex for concurrent save operations |
| `syncable.ts` | Filter elements safe for socket transmission |
| `tabSync.ts` | `BroadcastChannel` sync across browser tabs |
| `fileStatusStore.ts` | Track image loading status per file ID |
| `TTDStorage.ts` | Text-to-diagram chat history in IndexedDB |

## Syncable elements (`syncable.ts`)

Not all elements are sent over the network:

```ts
isSyncableElement(element):
  - Non-deleted elements that aren't invisibly small → syncable
  - Recently deleted (< 24h) → still syncable (for peer cleanup)
  - Invisibly small or old deleted → filtered out
```

`DELETED_ELEMENT_TIMEOUT` = 24 hours (`app_constants.ts`).

## Room links (`data/index.ts`)

```ts
// URL hash format
#room=<roomId>,<roomKey>

isCollaborationLink(link)     // regex test
getCollaborationLinkData(link) // extract roomId + roomKey
generateCollaborationLinkData() // create new room
```

Backend URLs from env:
- `VITE_APP_BACKEND_V2_GET_URL` — fetch readonly share links
- `VITE_APP_BACKEND_V2_POST_URL` — create share links

## LocalData architecture

`LocalData.ts` manages IndexedDB stores:

| Store | Content |
| --- | --- |
| `files-db` | Binary image files |
| Elements | Serialized via `ImportedDataState` |

Autosave debounced at `SAVE_TO_LOCAL_STORAGE_TIMEOUT` (300ms).

Uses `Locker` to prevent concurrent writes corrupting state.

## WebXDC data path

WebXDC does **not** use `LocalData`, `firebase.ts`, or `data/index.ts` room links.

Instead:

```
Editor onChange
  → ExcalidrawBinding (y-excalidraw)
  → Yjs Y.Doc
  → WebxdcProvider (y-webxdc)
  → webxdc.sendUpdate()
```

See [Collaboration](./collaboration.md) and [Storage](./storage.md).