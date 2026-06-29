# Security & Privacy

## Delta Chat / WebXDC

### Transport encryption

WebXDC Excalidraw relies on **Delta Chat's end-to-end encryption** for all `sendUpdate` messages. No additional app-level encryption is applied to the Yjs payload.

### Content Security Policy

WebXDC apps run inside a sandboxed iframe with strict CSP:

| Directive | Constraint | Impact |
| --- | --- | --- |
| `font-src` | `'self'` only | No CDN fonts; self-hosted Virgil + Assistant |
| `script-src` | Restricted | No external scripts |
| Network | Limited | No Firebase, Sentry, or analytics calls |

The slim build enforces this by:

- Stubbing external service SDKs
- Removing CDN font fallbacks
- Bundling all assets in the `.xdc` zip

### webxdc.js injection

Delta Chat injects `window.webxdc` via a host-provided `webxdc.js`. The `.xdc` zip includes a minimal stub so the script tag resolves, but the host replaces it at runtime.

The app treats `window.webxdc` as **frozen** — methods are wrapped, not replaced.

### Realtime channel

P2P realtime uses Delta Chat's encrypted channel. Payloads are JSON (cursors) or base64 Yjs updates (drawing). Max payload size enforced by host (`sendUpdateMaxSize`).

### File import

`webxdc.importFiles()` opens the system file picker. Only image files accepted via `isSupportedImageFile()` check. Files stay local to the device until embedded in the Yjs document and sent via `sendUpdate`.

### No telemetry

WebXDC build disables:

- Sentry (`VITE_APP_DISABLE_SENTRY`)
- Analytics tracking (`VITE_APP_ENABLE_TRACKING: false`)
- Console output (`esbuild.drop: ["console"]`)

## Standard app

### Collaboration encryption

Room links include a 22-character encryption key:

```
#room=<roomId>,<roomKey>
```

Scene data encrypted with AES-GCM before Firebase upload (`data/encryption.ts`).

### Firebase

Uses public Firebase config (API keys are not secret). Security enforced by Firebase Security Rules on the server.

### Share links

Readonly share links use a separate backend (`VITE_APP_BACKEND_V2_GET_URL`) with no encryption key in the URL.

### Excalidraw+ export

Uses RSA public key encryption (`VITE_APP_PLUS_EXPORT_PUBLIC_KEY`) for exports to Excalidraw+.

### PWA service worker

Caches assets locally. Does not cache user drawings (only app shell, fonts, locales).

## Supply chain

- Dependencies managed via Bun lockfile (`bun.lock`)
- MIT licensed project
- Published npm packages from `@excalidraw/*` namespace

## Recommendations for WebXDC users

1. Only open `.xdc` files from trusted contacts (standard WebXDC guidance)
2. Delete old attachments when upgrading to a new version
3. Enable realtime in Delta Chat settings only if needed (1.48+)