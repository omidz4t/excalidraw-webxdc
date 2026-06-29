# State Management

Excalidraw uses **Jotai** for reactive state at two levels.

## Editor store (`packages/excalidraw/editor-jotai.ts`)

Internal to the editor package. Manages:

- UI state atoms (open menus, dialogs)
- Tool state
- Not directly accessible from host apps

## App store (`excalidraw-app/app-jotai.ts`)

Shared between standard app and WebXDC:

```ts
import { createStore } from "jotai";

export const appJotaiStore = createStore();
export const { Provider, useAtom, useAtomValue, useSetAtom } = createStoreContext(appJotaiStore);
```

Both `App.tsx` and `WebxdcApp.tsx` wrap content in:

```tsx
<Provider store={appJotaiStore}>
```

## Key atoms

### Collaboration (`collab/atoms.ts`)

| Atom | Type | Purpose |
| --- | --- | --- |
| `collabAPIAtom` | `CollabAPI \| null` | Imperative collab API |
| `isCollaboratingAtom` | `boolean` | Collab mode flag |
| `activeRoomLinkAtom` | `string \| null` | Current room URL |
| `isOfflineAtom` | `boolean` | Network offline state |

### WebXDC sync (`webxdc/collab-status.ts`)

| Atom | Type | Purpose |
| --- | --- | --- |
| `collabSyncStatusAtom` | `CollabSyncStatus` | Diagnostics and status hints |

`CollabSyncStatus` fields documented in [Collaboration](./collaboration.md).

### App language (`app-language/language-state.ts`)

| Atom | Purpose |
| --- | --- |
| Language selection | Current locale (standard app only) |

### Collab errors (`collab/CollabError.tsx`)

| Atom | Purpose |
| --- | --- |
| `collabErrorIndicatorAtom` | Error message for collab failures |

### LocalData (`data/LocalData.ts`)

| Atom | Purpose |
| --- | --- |
| Persistence state | Tracks save status (standard app) |

## Editor AppState vs Jotai

The main editor state (`AppState` in `types.ts`) is **React class state** inside `App.tsx`, not Jotai atoms. Host apps access it via:

- `excalidrawAPI.getAppState()`
- `useExcalidrawStateValue(prop)` hook
- `onChange` callback

Jotai is used for cross-cutting concerns (collab API, sync status, language) that live outside the editor component tree.

## ExcalidrawBinding state

`ExcalidrawBinding` maintains local tracking state (not Jotai):

- `lastKnownElements` — for delta computation
- `lastKnownFileIds` — for asset delta
- `lastKnownSceneSettings` — for settings sync

## Yjs state (WebXDC)

The shared document state lives in `Y.Doc`:

```
ydoc
├── elements: Y.Array<Y.Map>   — not Jotai, not React state
├── assets: Y.Map
└── sceneSettings: Y.Map
```

This is the authoritative store for WebXDC collaboration.