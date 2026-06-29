# WebXDC Stubs & Slimming

How the WebXDC build reduces bundle size by stubbing and stripping features.

## Vite alias stubs

In `vite.config.mts`, when `VITE_APP_WEBXDC=true`:

| Import | Replacement | Reason |
| --- | --- | --- |
| `@excalidraw/mermaid-to-excalidraw` | `stubs/empty-module.ts` | Mermaid too heavy |
| `@sentry/browser` | `stubs/sentry-stub.ts` | No error reporting in chat |
| `firebase/app` | `stubs/firebase-stub.ts` | No Firebase in WebXDC |
| `firebase/firestore` | `stubs/firebase-stub.ts` | No Firebase in WebXDC |
| `firebase/storage` | `stubs/firebase-stub.ts` | No Firebase in WebXDC |
| `socket.io-client` | `stubs/empty-module.ts` | No socket.io in WebXDC |
| `virtual:pwa-register` | `pwa-stub.ts` | No service worker |

## Resolve-time stubs (`vite-slim-plugin.mts`)

`resolveId` redirects imports matching patterns:

| Pattern | Stub file | Feature removed |
| --- | --- | --- |
| `/charts$` | `charts-stub.ts` | Spreadsheet charts |
| `TTDDialog/TTDDialog` | `ttd-dialog-stub.tsx` | Text-to-diagram AI |
| `PasteChartDialog` | `paste-chart-dialog-stub.tsx` | Chart paste dialog |
| `HelpDialog` | `null-component.tsx` | Help dialog |
| `ImageExportDialog` | `null-component.tsx` | Image export dialog |
| `JSONExportDialog` | `null-component.tsx` | JSON export dialog |
| `/Stats` | `null-component.tsx` | Stats panel |

### Stub implementations

**`empty-module.ts`** — exports empty object (default export).

**`null-component.tsx`** — renders `null`.

**`sentry-stub.ts`** — no-op `init`, `captureException`, etc.

**`firebase-stub.ts`** — no-op Firebase SDK methods.

**`charts-stub.ts`** — empty chart functions.

**`ttd-dialog-stub.tsx`** — null component.

**`xiaolai-font-stub.ts`** — empty font module.

## Transform-time modifications

### i18n (`packages/excalidraw/i18n.ts`)

- Replace dynamic locale import with English fallback
- Replace `languages` array with `[defaultLang]` only

### Fonts (`packages/excalidraw/fonts/Fonts.ts`)

Strip imports and `init()` calls for:

Cascadia, ComicShanns, Emoji, Excalifont, Helvetica, Liberation, Lilita, Nunito, Xiaolai, CJK fallback, Windows emoji fallback.

### Fonts CSS (`packages/excalidraw/fonts/fonts.css`)

Replaced with self-hosted Assistant font faces only.

### Font CDN (`ExcalidrawFontFace.ts`)

External CDN fallback URL disabled (CSP `font-src 'self'`).

### App.tsx paste handlers

- Mermaid paste: `if (false) { /* mermaid disabled */ }`
- Chart/spreadsheet paste: `if (false) { /* charts disabled */ }`
- Enhanced clipboard paste for WebView compatibility
- Relaxed paste target detection for WebView

## Bundle asset exclusion

`generateBundle` and `webxdcZipFilter` remove:

### Code chunks

- CodeMirror editor chunks
- Mermaid / cytoscape / diagram chunks
- KaTeX math rendering
- QR code chunk
- Desktop-only features
- Treemap, graph, ordinal d3 chunks
- Subset worker chunks

### Locale files

All languages except bundled English (hardcoded in i18n transform).

### Static files

```
service-worker.js, robots.txt, _headers
og-image, promo images, screenshots
Extra favicons (512px, maskable, apple-touch)
Cascadia.woff2, Virgil.woff2 (root level — kept in fonts/ subdir)
```

### Font directories

Only `Virgil/` and `Assistant/` kept. All others excluded:

ComicShanns, Nunito, Xiaolai, Cascadia, Excalifont, Helvetica, Liberation, Lilita, Emoji.

## esbuild options (WebXDC build)

```ts
{
  drop: ["console", "debugger"],
  legalComments: "none",
}
```

## Size impact

The slim build produces a single inline bundle suitable for WebXDC size limits. Exact size varies by build but is significantly smaller than the standard app (which includes PWA, all locales, mermaid, CodeMirror, etc.).

Check size after build:

```bash
make build-webxdc
# Vite reports compressed size with reportCompressedSize: true
```