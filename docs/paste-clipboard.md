# Paste & Clipboard

Clipboard handling spans `packages/excalidraw/clipboard.ts` and WebXDC-specific fixes.

## Standard paste flow (`App.tsx`)

On paste (`EVENT.PASTE`):

1. Parse clipboard via `parseClipboard()` / `parseDataTransferEvent()`
2. Detect format priority:
   - Excalidraw JSON (`application/vnd.excalidraw+json`)
   - SVG
   - Plain text (may be Mermaid, spreadsheet, or text element)
   - Image files
3. Import or create elements accordingly

## Copy flow

| Action | Formats placed on clipboard |
| --- | --- |
| Copy | JSON + plain text |
| Copy as PNG | PNG image |
| Copy as SVG | SVG string |
| Copy styles | Style properties |

## WebXDC paste fix (`import-image.ts`)

Delta Chat / Electron WebView hosts often omit image files from paste events. The WebXDC layer adds:

### `installWebxdcPasteFix()`

Registered at module load (line 174–176):

```ts
document.addEventListener(EVENT.PASTE, onPasteCapture, { capture: true });
```

Flow:
1. Intercept paste at **capture phase** (before editor handlers)
2. `filesFromClipboardEvent()` — try `clipboardData.items`, then `readSystemClipboard()`
3. Filter to supported images via `isSupportedImageFile()`
4. If images found: `preventDefault()`, `stopImmediatePropagation()`
5. `dropImageFilesOnCanvas()` — synthetic drop event on canvas

### Synthetic drop

`createFileDropEvent()` builds a fake `drop` event with:
- `dataTransfer.files` populated
- `clientX/clientY` at canvas center
- Dispatched on `.excalidraw.excalidraw-container`

This bypasses paste focus guards in the editor that block WebView paste.

### `App.tsx` transform (WebXDC build)

`vite-slim-plugin` also modifies paste handling in `App.tsx`:

- Relaxes "is excalidraw active" focus check
- Adds `readSystemClipboard()` fallback in data transfer parsing
- Only blocks paste when target is a writable HTML element (inputs)

## Image import via menu

`WebxdcMainMenu` → "Insert image…" → `importImagesViaWebxdc()`:

```ts
const files = await webxdc.importFiles({
  mimeTypes: ["image/png", "image/jpeg", ...],
  extensions: [".png", ".jpg", ...],
  multiple: true,
});
dropImageFilesOnCanvas(files);
```

Uses Delta Chat native file picker.

## Focus for paste

`WebxdcApp` calls `focusCanvasForPaste()` on pointer down:

```ts
container.querySelector("canvas.interactive")?.focus({ preventScroll: true });
```

Ensures canvas has focus before paste in WebView.

## Supported image types

From `data/blob.ts` → `isSupportedImageFile()`:

- PNG, JPEG, GIF, WebP, SVG (and BMP in some paths)

## Clipboard API compatibility

`readSystemClipboard()` in `clipboard.ts` uses the async Clipboard API where available. Falls back gracefully when blocked by permissions or WebView restrictions.