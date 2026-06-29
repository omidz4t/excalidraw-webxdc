# Dependencies

Complete dependency reference for the monorepo.

## Root devDependencies (highlights)

| Package | Version | Purpose |
| --- | --- | --- |
| `typescript` | 5.9.3 | Type checking |
| `vitest` | 3.0.6 | Test runner |
| `vite` | 5.0.12 | App bundler |
| `@vitejs/plugin-react` | 3.1.0 | React support in Vite |
| `vite-plugin-pwa` | 0.21.1 | Service worker (standard app) |
| `eslint` configs | various | Linting |
| `prettier` | 2.6.2 | Formatting |
| `jsdom` | 22.1.0 | Test DOM environment |
| `esbuild` | (via packages) | Package bundling |

## excalidraw-app dependencies

| Package | Purpose |
| --- | --- |
| `react` / `react-dom` 19.0.0 | UI framework |
| `yjs` ^13.6.27 | CRDT document sync |
| `y-webxdc` ^1.1.1 | Yjs ↔ Delta Chat bridge |
| `@webxdc/types` ^2.1.2 | WebXDC TypeScript types |
| `@webxdc/vite-plugins` ^1.4.0 | buildXDC, mockWebxdc |
| `@webxdc/webxdc-dev` ^0.21.0 | Multi-peer dev simulator |
| `js-base64` ^3.7.8 | Base64 for realtime protocol |
| `jotai` 2.11.0 | State management |
| `firebase` 11.3.1 | Standard app backend (stubbed in WebXDC) |
| `socket.io-client` 4.7.2 | Standard app realtime (stubbed in WebXDC) |
| `@sentry/browser` 9.0.1 | Error tracking (stubbed in WebXDC) |
| `idb-keyval` 6.0.3 | IndexedDB wrapper |
| `concurrently` ^9.2.1 | Run Vite + webxdc-dev |
| `i18next-browser-languagedetector` | Language detection (standard app) |

## @excalidraw/excalidraw dependencies (highlights)

| Package | Purpose |
| --- | --- |
| `roughjs` 4.6.4 | Hand-drawn rendering |
| `perfect-freehand` 1.2.0 | Freedraw smoothing |
| `radix-ui` 1.4.3 | Accessible UI primitives |
| `@codemirror/*` | Code/mermaid editing |
| `jotai` / `jotai-scope` | Editor state |
| `pako` 2.0.3 | Compression |
| `nanoid` 3.3.3 | ID generation |
| `browser-fs-access` 0.38.0 | Native file picker |
| `pica` 7.1.1 | Image downscaling |
| `sass` 1.51.0 | SCSS compilation |
| `@excalidraw/mermaid-to-excalidraw` | Mermaid import (stubbed in WebXDC) |
| `tunnel-rat` 0.1.2 | React portal tunneling |

## Internal workspace packages

| Package | Version | Depends on |
| --- | --- | --- |
| `@excalidraw/common` | 0.18.0 | tinycolor2 |
| `@excalidraw/math` | 0.18.0 | common |
| `@excalidraw/element` | 0.18.0 | common, math, fractional-indexing |
| `@excalidraw/excalidraw` | 0.18.0 | all above + laser-pointer |
| `@excalidraw/utils` | 0.1.2 | laser-pointer, roughjs |
| `@excalidraw/fractional-indexing` | 3.3.0 | (standalone) |
| `@excalidraw/laser-pointer` | 1.3.1 | (standalone) |

## Package manager

- **Bun** 1.3.1 (`packageManager` field in root `package.json`)
- Hoisted linker (`bunfig.toml`: `linker = "hoisted"`)
- Lockfile: `bun.lock`

## Engine requirements

```json
"engines": { "node": ">=18.0.0" }
```

Applies to root and excalidraw-app.