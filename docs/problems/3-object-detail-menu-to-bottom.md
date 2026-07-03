# Move the object detail menu to the bottom

---
STATUS: FIXED
---

## Problem

When selecting a shape (or multi-selecting), Excalidraw shows a **properties / shape-actions panel** on the **left** (`App-menu_top__left`). For the WebXDC fork this feels heavy and wastes horizontal canvas space.

Desired UX:

1. **Bottom placement** — shape properties live in a single horizontal bar at the bottom of the canvas (like mobile, but for WebXDC desktop/tablet too).
2. **One row of buttons** — stroke, fill, combined style popovers, text props, duplicate/delete, align/group extras — all in one scrollable line.
3. **Sub-panels open upward** — color pickers, fill style, arrow options, “more” menus open on a **second row above** the bar (popover `side="top"`), not to the right.
4. **Zen mode** — bar hides when zen mode is on, same transition pattern as toolbar/footer (slide off-screen).
5. **Multi-select** — group/align actions currently appear in a secondary left column; they move into the same bottom bar via existing `CombinedExtraActions` / `MobileShapeActions`.

## Current architecture

| Piece | Role |
|-------|------|
| `LayerUI.tsx` | Renders `SelectedShapeActions` (full, vertical) or `CompactShapeActions` (compact, vertical) in **top-left** |
| `MobileMenu.tsx` + `MobileShapeActions` | Phone layout: horizontal bar in `App-bottom-bar` |
| `PropertiesPopover.tsx` | Radix popover; `side="right"` on desktop, `side="bottom"` on mobile portrait |
| `deriveStylesPanelMode()` | `phone → mobile`, `tablet → compact`, `desktop → full` |
| `showSelectedShapeActions()` | When to show the panel (selection / drawing tool) |

WebXDC build sets `import.meta.env.VITE_APP_WEBXDC === "true"` (see `excalidraw-app/vite.config.mts`).

## Implementation (done)

### 1. New styles panel mode: `bottom` (WebXDC only)

- Extended `StylesPanelMode` with `"bottom"`.
- Added `resolveStylesPanelMode()` in `packages/excalidraw/utils/stylesPanelMode.ts`: WebXDC + non-phone → `"bottom"`.
- Wired through `useStylesPanelMode()`, `App` class, and `getStylesPanelInfo()`.

### 2. Bottom rendering in `LayerUI.tsx`

- When `stylesPanelMode === "bottom"`:
  - Top-left `selected-shape-actions-container` is **not** rendered.
  - `MobileShapeActions` renders in `.bottom-shape-actions-bar` above the footer.
  - `zen-mode-transition` + `transition-bottom` slides the bar off-screen in zen mode.

### 3. Popovers open upward

- `PropertiesPopover.tsx`: `side="top"` + `align="center"` when `stylesPanelMode === "bottom"`.

### 4. Styles & text editing

- `LayerUI.scss`: bottom bar layout (centered, horizontal scroll, above footer).
- `textWysiwyg.tsx`: treats `.bottom-shape-actions-bar` like other shape-action surfaces (no focus steal while editing).

### 5. Scope

- **WebXDC build only** — standard app unchanged (`VITE_APP_WEBXDC` guard).
- Phone WebXDC keeps existing `MobileMenu` path (`mobile` mode).

## Acceptance criteria

- [x] Selecting a shape shows a **horizontal** property bar at the **bottom**, not left.
- [x] Color / background / combined property buttons open panels **above** the bar.
- [x] Multi-select shows align/group controls in the same bottom bar.
- [x] Zen mode hides the bar (transition), consistent with other chrome.
- [x] `make build-webxdc` succeeds.

## Files changed

| File | Change |
|------|--------|
| `packages/common/src/editorInterface.ts` | `StylesPanelMode` + `"bottom"` |
| `packages/excalidraw/utils/stylesPanelMode.ts` | `resolveStylesPanelMode()` |
| `packages/excalidraw/components/App.tsx` | Use resolver |
| `packages/excalidraw/actions/actionProperties.tsx` | Use resolver in `getStylesPanelInfo` |
| `packages/excalidraw/components/LayerUI.tsx` | Bottom bar render + hide top-left |
| `packages/excalidraw/components/PropertiesPopover.tsx` | `side="top"` for bottom mode |
| `packages/excalidraw/components/LayerUI.scss` | Bottom bar + zen transition |
| `packages/excalidraw/components/Actions.tsx` | Treat `bottom` like `compact` in toolbar |
| `packages/excalidraw/wysiwyg/textWysiwyg.tsx` | Bottom bar focus handling |