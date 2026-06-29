# Remove web embedding

---
STATUS: FIXED (WebXDC runtime)
---

Web embedding is not possible in Delta Chat WebXDC (no internet). Runtime embedding has been removed from the shipped `.xdc` build.

## What was removed (runtime)

| Area | Change |
| --- | --- |
| URL parsing | `packages/element/src/embeddable.ts` replaced at build time with offline stub (`getEmbedLink` → `null`, `embeddableURLValidator` → `false`) |
| iframe DOM rendering | `App.renderEmbeddables()` returns `null` |
| YouTube/Vimeo postMessage | `onWindowMessage` disabled |
| Embed tool | Removed from desktop + mobile toolbars |
| Paste/drop embed URLs | Disabled in `App.tsx` |
| Create iframe/embeddable | `insertIframeElement` / `insertEmbeddableElement` no-op |
| Help dialog | Removed (had external doc/social links) |

Implemented in `excalidraw-app/webxdc/offline-transforms.mts` and `excalidraw-app/webxdc/stubs/embed-stub.ts`.

## Bundle verification

After `make build-webxdc`, the JS bundle contains **no** `youtube.com`, `player.vimeo`, or `figma.com` URLs. Remaining `embeddable` / `iframe` strings are type identifiers only (for reading legacy scenes that may already contain such elements).

## What remains in source (not deleted)

Upstream Excalidraw source still defines `iframe` / `embeddable` element types in `packages/element/src/types.ts` and related renderers. These are **stripped or stubbed at build time**, not deleted from the monorepo, to keep upstream merge compatibility and allow opening old `.excalidraw` files without crashing.

Existing embed elements in a scene render as inert shapes (no live iframe loads).