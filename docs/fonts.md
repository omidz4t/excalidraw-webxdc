# Fonts

Excalidraw uses custom fonts for its hand-drawn aesthetic and UI typography.

## Font families

| Family | Purpose | Package path |
| --- | --- | --- |
| **Virgil** | Hand-drawn element text | `fonts/Virgil/` |
| **Excalifont** | Alternative hand-drawn | `fonts/Excalifont/` |
| **Cascadia** | Code/monospace | `fonts/Cascadia/` |
| **Comic Shanns** | Comic style | `fonts/ComicShanns/` |
| **Nunito** | Sans-serif UI | `fonts/Nunito/` |
| **Assistant** | UI labels and chrome | Bundled in public/ |
| **Helvetica** | Fallback sans | `fonts/Helvetica/` |
| **Liberation Sans** | Open source fallback | `fonts/Liberation/` |
| **Lilita One** | Display | `fonts/Lilita/` |
| **Xiaolai** | CJK hand-drawn | `fonts/Xiaolai/` |
| **Emoji** | Emoji fallback | `fonts/Emoji/` |

## Font system architecture

```
fonts/Fonts.ts          ← Registry, init() calls per family
fonts/ExcalidrawFontFace.ts  ← FontFace wrapper, CDN fallback
fonts/fonts.css         ← @font-face declarations
fonts/index.ts          ← Family metadata
subset/                 ← HarfBuzz WASM subsetting
```

### Loading flow

1. Editor needs font for text element
2. `Fonts.ts` checks if family initialized
3. `ExcalidrawFontFace` loads WOFF2 from CDN or `EXCALIDRAW_ASSET_PATH`
4. Optional: subset to needed glyphs via Web Worker + HarfBuzz WASM
5. `document.fonts.add()` registers the face

### CDN vs self-hosted

Default: fonts load from `esm.run/@excalidraw/excalidraw/dist/prod` CDN.

Self-hosted:

```html
<script>window.EXCALIDRAW_ASSET_PATH = "/";</script>
```

Copy `node_modules/@excalidraw/excalidraw/dist/prod/fonts/` to static assets.

## WebXDC font constraints

Delta Chat WebXDC enforces CSP `font-src 'self'`. External CDN fonts are blocked.

### WebXDC bundled fonts

| Font | Location in .xdc |
| --- | --- |
| Virgil | `fonts/Virgil/*.woff2` |
| Assistant | `fonts/Assistant/*.woff2` |

### WebXDC CSS

`vite-slim-plugin` replaces `fonts.css` with:

```css
@font-face {
  font-family: "Assistant";
  src: url(../fonts/Assistant/Assistant-Regular.woff2) format("woff2");
  /* Medium, SemiBold, Bold variants */
}
```

### Stripped fonts

All other families have their `import` and `init()` calls removed from `Fonts.ts` at build time. CJK and emoji fallbacks are also stripped.

### HTML preload

`webxdc/index.html` sets:

```js
window.EXCALIDRAW_ASSET_PATH = "./";
```

## Font picker

`components/FontPicker/` provides UI for selecting font family on text elements. In WebXDC, only loaded fonts appear functional (Virgil for drawing, Assistant for UI).

## Font subsetting

`packages/excalidraw/subset/`:

- `subset-main.ts` — worker entry
- `subset-shared.chunk.ts` — shared subsetting logic
- `harfbuzz/` — WASM bindings for glyph extraction

Subsetting reduces font payload by including only glyphs used on canvas. Excluded from WebXDC bundle (subset worker chunks filtered out).

## Font metadata

`@excalidraw/common/font-metadata.ts` — font family metrics, line heights, baseline adjustments.

## Testing

Tests mock font loading in `setupTests.ts`:

- `FontFace` class stub
- `document.fonts` API stub
- `ExcalidrawFontFace.fetchFont` reads local files via `file://` protocol