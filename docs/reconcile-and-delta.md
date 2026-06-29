# Reconcile & Delta System

Two related systems for tracking and merging changes.

## Store Delta (`packages/element/src/delta.ts`)

Used by history (undo/redo) and the editor `Store` class.

### Classes

| Class | Tracks changes to |
| --- | --- |
| `ElementsDelta` | Scene elements (add/update/delete) |
| `AppStateDelta` | App state fields |
| `StoreDelta` | Combined elements + app state |

### CaptureUpdateAction

```ts
IMMEDIATELY  // Record in history now
EVENTUALLY   // Defer until next IMMEDIATELY
NEVER        // Skip history (remote sync, init)
```

### Store class (`store.ts`)

- Maintains current snapshot of elements + app state
- Emits `DurableIncrement` and `EphemeralIncrement` events
- Used by `History` class for undo/redo stacks
- `hashElementsVersion()` for quick change detection

## Reconciliation (`packages/excalidraw/data/reconcile.ts`)

Used by **standard app** socket.io collaboration to merge remote element updates.

### Algorithm

For each remote element:

1. Find matching local element by ID
2. `shouldDiscardRemoteElement()` — keep local if:
   - Local element is being edited (text resize, new element)
   - Local `version` is higher
   - Same version but local `versionNonce` ≤ remote (deterministic tiebreak)
3. Otherwise accept remote element
4. `orderByFractionalIndex()` — restore ordering
5. `syncInvalidIndices()` — repair broken fractional indices

### Key functions

```ts
reconcileElements(local, remote, localAppState)
shouldDiscardRemoteElement(localAppState, local, remote)
```

### Tests

`packages/excalidraw/tests/data/reconcile.test.ts`

## WebXDC: Yjs instead of reconcile

WebXDC does **not** use `reconcileElements`. Yjs CRDT handles concurrent edits automatically:

- Local changes → delta operations → Yjs (origin = binding)
- Remote changes → Yjs observe → `yjsToExcalidraw()` → `updateScene(NEVER)`

Conflict resolution is built into Yjs merge semantics.

## Yjs delta operations (`webxdc/y-excalidraw/diff.ts`)

Separate from StoreDelta — these are sync operations:

| Operation | When |
| --- | --- |
| `update` | Element properties changed |
| `append` | New element added |
| `delete` | Element removed (soft delete) |
| `move` | Element reordered |
| `bulkAppend` | Multiple elements added at once |
| `bulkDelete` | Multiple elements deleted |

Uses fractional indexing (`generateKeyBetween`) for position keys.

## Comparison

| Aspect | StoreDelta | reconcileElements | Yjs diff |
| --- | --- | --- | --- |
| Purpose | Undo/redo | Socket.io merge | WebXDC sync |
| Granularity | Property-level | Whole elements | Property maps |
| Conflict policy | N/A (local only) | Version + versionNonce | CRDT merge |
| Used by | History | Collab.tsx | WebxdcCollab |