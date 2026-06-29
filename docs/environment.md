# Environment Variables

Env files live in the **repository root** (`envDir: "../"` in Vite config).

## Files

| File | Purpose |
| --- | --- |
| `.env.development` | Development defaults |
| `.env.production` | Production build values |
| `.env.test` | Test environment |
| `.env.local` | Local overrides (gitignored) |
| `.env.development.local` | Dev overrides (gitignored) |

## WebXDC-specific

Set by build tooling, not env files:

| Variable | Set by | Value |
| --- | --- | --- |
| `VITE_APP_WEBXDC` | `cross-env` in build script | `"true"` |
| `VITE_WEBXDC_VERSION` | Makefile / vite `define` | e.g. `"1.0.4"` |
| `WEBXDC_VERSION` | Makefile | Same as above |
| `VITE_DEV_PORT` | Makefile | Default `3000` |
| `WEBXDC_DEV_PORT` | Makefile | Default `7100` |

### Vite `define` overrides (WebXDC build)

```ts
VITE_APP_DISABLE_SENTRY: "true"
VITE_APP_ENABLE_TRACKING: "false"
VITE_APP_ENABLE_PWA: "false"
VITE_APP_DISABLE_PREVENT_UNLOAD: "true"
```

## Standard app variables

From `.env.development`:

| Variable | Example | Purpose |
| --- | --- | --- |
| `MODE` | `development` | Vite mode |
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/api/v2/` | Share link backend |
| `VITE_APP_BACKEND_V2_POST_URL` | `https://json-dev.excalididraw.com/api/v2/post/` | Share link POST |
| `VITE_APP_LIBRARY_URL` | `https://libraries.excalidraw.com` | Shape libraries CDN |
| `VITE_APP_LIBRARY_BACKEND` | Cloud Functions URL | Library persistence |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket |
| `VITE_APP_FIREBASE_CONFIG` | JSON string | Firebase project config |
| `VITE_APP_PLUS_LP` | `https://plus.excalidraw.com` | Excalidraw+ landing |
| `VITE_APP_PLUS_APP` | `http://localhost:3000` | Excalidraw+ app URL |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI features backend |
| `VITE_APP_PLUS_EXPORT_PUBLIC_KEY` | RSA public key | Excalidraw+ export encryption |

## Feature flags

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_APP_ENABLE_TRACKING` | `true` (dev) | Analytics events |
| `VITE_APP_ENABLE_PWA` | `false` (dev) | Service worker in dev |
| `VITE_APP_ENABLE_ESLINT` | `true` | Vite ESLint overlay |
| `VITE_APP_COLLAPSE_OVERLAY` | `true` | Collapse error overlay |
| `VITE_APP_DISABLE_PREVENT_UNLOAD` | empty | Disable unload warning |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | empty | Disable HMR (SW debugging) |
| `VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX` | empty | Debug text bounds |

## Build-time variables

| Variable | Purpose |
| --- | --- |
| `VERCEL_GIT_COMMIT_SHA` | Git SHA in production builds |
| `VITE_APP_GIT_SHA` | Injected into `window.__EXCALIDRAW_SHA__` |

## Test variables

| Variable | Purpose |
| --- | --- |
| `VITE_DEBUG_DOM` | Show full DOM in test failure output |

## Package build env

Package esbuild scripts read:

- `.env.development` → `DEV: true`
- `.env.production` → `PROD: true`

Via `packages/excalidraw/env.cjs` → `parseEnvVariables()`.

## Local overrides

Create `.env.development.local` for secrets or local service URLs:

```bash
VITE_APP_WS_SERVER_URL=ws://localhost:3002
VITE_APP_FIREBASE_CONFIG='{"apiKey":"..."}'
```

Never commit `.env.local` or `.env.*.local` files.