# Public Assets

Static files served from `public/` (Vite `publicDir: "../public"`).

## Files

| File | Size | Purpose |
| --- | --- | --- |
| `webxdc.js` | ~6KB | Dev shim implementing `window.webxdc` API |
| `Virgil.woff2` | ~140KB | Hand-drawn font (Excalidraw default) |
| `Assistant-Regular.woff2` | ~20KB | UI sans-serif font |
| `Cascadia.woff2` | ~130KB | Code font (standard app only) |
| `android-chrome-192x192.png` | ~8KB | WebXDC app icon |

## webxdc.js dev shim

Implements a minimal `window.webxdc` for browser testing without Delta Chat:

- `selfAddr` / `selfName` — random dev identity
- `sendUpdate` / `setUpdateListener` — BroadcastChannel-based sync
- `joinRealtimeChannel` — BroadcastChannel realtime shim
- `importFiles` — file picker mock
- `sendToChat` — chat draft storage

**Limitations:**
- Single-browser only (BroadcastChannel)
- Not suitable for multi-peer testing
- Use `make run-sim` with `webxdc-dev` for proper multi-peer

### Shim architecture

```
webxdc.js
├── RealtimeChannelShim     ← BroadcastChannel("webxdc-realtime-shim")
├── UpdatesShim             ← BroadcastChannel for sendUpdate replay
└── window.webxdc object     ← API surface matching @webxdc/types
```

## Font files in public/

These are development/cached copies. Production builds generate font assets in `build/fonts/` or `build-webxdc/fonts/` via the Vite woff2 plugin.

WebXDC only bundles Virgil and Assistant (in `fonts/` subdirectories of the .xdc zip).

## Standard app assets

The full standard app uses many more assets from the `public/` directory tree (not all listed in the minimal public/ folder — additional assets come from the build pipeline and `packages/excalidraw/fonts/`).

### PWA assets (standard build)

- `favicon.ico`, `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`
- `apple-touch-icon.png`
- `android-chrome-512x512.png`
- `maskable_icon_x192.png`, `maskable_icon_x512.png`
- `screenshots/` — PWA store screenshots
- `robots.txt`, `_headers` — hosting config

These are excluded from the WebXDC zip.

## EXCALIDRAW_ASSET_PATH

Controls where the editor loads fonts from:

```js
// WebXDC index.html
window.EXCALIDRAW_ASSET_PATH = "./";

// Standard app / self-hosted
window.EXCALIDRAW_ASSET_PATH = "/";
```

Without this, fonts load from the Excalidraw CDN (blocked by WebXDC CSP).

## Icon

`android-chrome-192x192.png` is referenced in `manifest.toml`:

```toml
icon = "android-chrome-192x192.png"
```

Shown in Delta Chat's app list and chat headers.