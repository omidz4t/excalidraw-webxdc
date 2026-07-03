# minimap

---
STATUS: FIXED
---

## Problem

WebXDC sessions need a lightweight overview of the canvas: where you are looking, what exists on the board, and where collaborators are.

## Desired UX

1. **Bottom-left minimap** — small rectangle overlay above the footer.
2. **Canvas overview** — simplified element bounds show the full drawing area.
3. **Your viewport** — highlighted rectangle for the visible area.
4. **Collaborator dots** — colored dots at remote pointer positions.
5. **Click to pan** — click the minimap to center the viewport on that spot.
6. **Zen mode** — minimap hides with the same left-slide transition as other chrome.

## Implementation (done)

### 1. Minimap geometry (`packages/excalidraw/utils/minimap.ts`)

- `getMinimapSceneBounds()` — union of element bounds and current viewport (same idea as scrollbars).
- `getMinimapTransform()` / `sceneToMinimap()` / `minimapToScene()` — coordinate mapping.
- `getMinimapRenderData()` — element rects, viewport rect, and transform for drawing.

### 2. Minimap component (`packages/excalidraw/components/Minimap.tsx`)

- Canvas-based renderer (140×100px).
- Draws element bounding boxes, viewport highlight, and collaborator dots (`getClientColor`).
- Subscribes to `app.api.onScrollChange()` so pan/zoom updates without LayerUI re-renders.
- Click handler recenters the viewport via `getScrollForSceneCenter()`.

### 3. WebXDC-only wiring (`LayerUI.tsx`)

- Rendered when `VITE_APP_WEBXDC === "true"` on non-phone layouts.
- Positioned bottom-left via `Minimap.scss`, above the footer.

## Acceptance criteria

- [x] Small minimap appears bottom-left in WebXDC builds.
- [x] Shows canvas content, your viewport, and collaborator pointer dots.
- [x] Clicking pans the viewport to the clicked location.
- [x] Hides in zen mode with transition.
- [x] Standard (non-WebXDC) app unchanged.

## Files changed

| File | Change |
|------|--------|
| `packages/excalidraw/utils/minimap.ts` | Geometry + render data helpers |
| `packages/excalidraw/components/Minimap.tsx` | Canvas minimap component |
| `packages/excalidraw/components/Minimap.scss` | Bottom-left positioning + styling |
| `packages/excalidraw/components/LayerUI.tsx` | WebXDC-only render hookup |