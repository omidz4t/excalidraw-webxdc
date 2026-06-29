# Shape Library System

Shape libraries let users save and reuse drawing elements. Code in `packages/excalidraw/data/library.ts`.

## Data format

```json
{
  "type": "excalidrawlib",
  "version": 2,
  "source": "https://excalidraw.com",
  "libraryItems": [
    {
      "id": "...",
      "status": "published",
      "elements": [ /* ExcalidrawElement[] */ ],
      "created": 1234567890
    }
  ]
}
```

## Key functions

| Function | Purpose |
| --- | --- |
| `serializeLibraryAsJSON` | Export library to JSON string |
| `loadLibraryFromBlob` | Import library from file |
| `mergeLibraryItems` | Merge two libraries (dedup by hash) |
| `getLibraryItemsHash` | Hash for change detection |
| `parseLibraryTokensFromUrl` | Parse library share URL tokens |
| `useHandleLibrary` | React hook for library URL loading |

## UI components

| Component | Purpose |
| --- | --- |
| `LibraryMenu` | Library browser sidebar |
| `LibraryMenuItems` | Grid of library items |
| `LibraryUnit` | Single library item preview |
| `PublishLibrary` | Publish to libraries.excalidraw.com |

## Persistence

| Storage | Key | Content |
| --- | --- | --- |
| IndexedDB | `excalidraw-library` | Local library items |
| Remote CDN | `VITE_APP_LIBRARY_URL` | Published libraries |
| Cloud Functions | `VITE_APP_LIBRARY_BACKEND` | Library persistence API |

## Adding to library

Action: `actionAddToLibrary` — saves selected elements as a library item.

## URL-based sharing

Libraries can be loaded from URL tokens:

```
https://excalidraw.com/#addLibrary=<token>
```

`useHandleLibrary()` hook in `App.tsx` detects and imports these.

## WebXDC status

Library system is **included in the WebXDC bundle** (not stubbed) but:

- No remote library CDN calls in practice (offline chat context)
- `PublishLibrary` may not work without network
- Local library in IndexedDB works if WebView allows storage
- Library UI accessible via sidebar if opened manually

Library is lower priority for WebXDC — not explicitly stripped but not a primary feature.