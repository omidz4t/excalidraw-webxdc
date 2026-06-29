# CollabAPI Interface

Defined in `excalidraw-app/collab/types.ts`. Both standard and WebXDC collab layers implement this interface and register it on `collabAPIAtom`.

## Interface

```ts
interface CollabAPI {
  isCollaborating: () => boolean;
  onPointerUpdate: (payload) => void;
  startCollaboration: (roomLinkData) => Promise<{ elements, appState }>;
  stopCollaboration: (keepRemoteState?: boolean) => void;
  syncElements: (elements) => void;
  fetchImageFilesFromFirebase: (opts) => Promise<{ loadedFiles, erroredFiles, elements }>;
  setUsername: (username: string) => void;
  getUsername: () => string;
  getActiveRoomLink: () => string | null;
  setCollabError: (message: string | null) => void;
}
```

## Standard app implementation (`Collab.tsx`)

| Method | Behavior |
| --- | --- |
| `isCollaborating` | Returns true when in a room |
| `onPointerUpdate` | Broadcasts cursor via socket.io |
| `startCollaboration` | Parses room link, loads Firebase, connects socket |
| `stopCollaboration` | Disconnects socket, optionally clears state |
| `syncElements` | Pushes element updates to socket |
| `fetchImageFilesFromFirebase` | Downloads images from Firebase Storage |
| `setUsername` | Saves to localStorage, broadcasts |
| `getUsername` | Reads from localStorage |
| `getActiveRoomLink` | Returns current `#room=...` URL |
| `setCollabError` | Sets error indicator atom |

## WebXDC implementation (`WebxdcCollab.tsx`)

| Method | Behavior |
| --- | --- |
| `isCollaborating` | Always `true` |
| `onPointerUpdate` | Forwards to `WebxdcRealtimeChannel` |
| `startCollaboration` | No-op async — returns current scene (no room params) |
| `stopCollaboration` | No-op |
| `syncElements` | No-op (Yjs binding handles sync) |
| `fetchImageFilesFromFirebase` | Returns empty (no Firebase) |
| `setUsername` | No-op |
| `getUsername` | Returns `webxdc.selfName` |
| `getActiveRoomLink` | Always `null` |
| `setCollabError` | No-op |

Note: WebXDC's `startCollaboration` signature differs — it takes no `roomLinkData` argument. TypeScript allows this because the implementation is assigned to the atom without strict checking of all call sites.

## Jotai atoms (`collab/atoms.ts`)

| Atom | WebXDC value |
| --- | --- |
| `collabAPIAtom` | WebXDC CollabAPI instance |
| `isCollaboratingAtom` | `true` |
| `activeRoomLinkAtom` | `null` |
| `isOfflineAtom` | Not set by WebXDC |

## How the editor uses CollabAPI

The editor checks `collabAPIAtom` for:

- Rendering collaborator cursors (from realtime channel → `appState.collaborators`)
- `onPointerUpdate` callback wiring
- `LiveCollaborationTrigger` (hidden in WebXDC — always collaborating)
- Username display in collaborator list

## Pointer update payload

```ts
{
  pointer: { x: number; y: number; tool: "pointer" | "laser" };
  button: "down" | "up";
  pointersMap: Gesture["pointers"];  // multi-touch
}
```

WebXDC ignores multi-touch (`pointersMap.size >= 2` returns early).