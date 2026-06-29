# Fork Changes (Delta Exil)

What this repository changes compared to upstream [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw).

## Summary

This fork transforms Excalidraw into a **Delta Chat WebXDC app** while maintaining the upstream monorepo structure for the editor packages.

## Package manager

| Upstream | This fork |
| --- | --- |
| Yarn workspaces | **Bun workspaces** |
| `yarn.lock` | `bun.lock` + `bunfig.toml` |
| `yarn` commands in docs | `bun` commands |

## Primary deliverable

| Upstream | This fork |
| --- | --- |
| excalidraw.com web app | **excalidraw.xdc** WebXDC package |
| npm package publishing focus | Delta Chat integration focus |

## New files and directories

```
excalidraw-app/webxdc/          # Entire WebXDC application layer
excalidraw-app/manifest.toml    # WebXDC manifest
Makefile                        # WebXDC dev/build targets
docs/                           # Project documentation
public/webxdc.js                # Dev shim for window.webxdc
bunfig.toml                     # Bun configuration
```

## New dependencies

| Package | Purpose |
| --- | --- |
| `yjs` | CRDT document sync |
| `y-webxdc` | Yjs ↔ Delta Chat bridge |
| `@webxdc/types` | WebXDC TypeScript types |
| `@webxdc/vite-plugins` | buildXDC, mockWebxdc |
| `@webxdc/webxdc-dev` | Multi-peer dev simulator |
| `js-base64` | Base64 encoding for realtime protocol |
| `concurrently` | Run Vite + webxdc-dev together |

## Modified files

| File | Changes |
| --- | --- |
| `package.json` | Bun workspaces, WebXDC scripts, removed yarn |
| `excalidraw-app/package.json` | WebXDC deps and dev scripts |
| `excalidraw-app/vite.config.mts` | Dual build mode, WebXDC plugins, stubs |
| `README.md` | Added bun alongside npm install instructions |
| `packages/*/README.md` | Added bun install examples |
| `CLAUDE.md` | Updated for Bun + WebXDC workflow |
| `.gitignore` | WebXDC build output, bun.lock kept |
| `scripts/build-node.js` | Bun compatibility |

## Removed

| Item | Notes |
| --- | --- |
| `.husky/pre-commit` | Pre-commit hook removed |
| `yarn.lock` | Replaced by `bun.lock` |

## Build system additions

### WebXDC Vite plugins

1. `webxdcSlimPlugin` — bundle size reduction
2. `webxdcDevPlugin` — dev server path rewriting
3. `webxdcPackPlugin` — HTML flattening for .xdc
4. `buildXDC` — zip packaging

### Makefile targets

- `make run` — single-user WebXDC dev
- `make run-sim` — multi-peer simulator
- `make build-webxdc` — produce excalidraw.xdc

## Collaboration architecture

| Upstream (excalidraw.com) | This fork (WebXDC) |
| --- | --- |
| Firebase Firestore | Yjs + y-webxdc |
| Socket.io | Delta Chat sendUpdate + realtime |
| Room URL hash | Chat attachment |
| App-level AES encryption | Delta Chat E2E encryption |
| Firebase Storage for images | Yjs assets map |

## Editor package

The `packages/excalidraw/` source is **not forked**. WebXDC modifications happen at build time via `vite-slim-plugin.mts` transforms:

- English-only i18n
- Stubbed mermaid/charts/TTD
- Self-hosted fonts only
- Enhanced WebView paste handling

## Features disabled in WebXDC

- PWA / service worker
- Sentry error tracking
- Firebase collaboration
- Socket.io realtime
- Mermaid diagram import
- Spreadsheet charts
- Text-to-diagram AI
- Multi-language UI
- Export dialogs
- Excalidraw+ integration
- Analytics tracking
- Most font families
- CodeMirror editor chunks

## Features added in WebXDC

- Yjs CRDT sync over Delta Chat
- P2P realtime drawing + cursors
- Follow mode with viewport relay
- Image import via webxdc.importFiles
- Theme persistence (localStorage + IndexedDB)
- Sync status diagnostics
- Boot error guidance for version mismatches
- Slim .xdc package optimized for CSP

## Dev workflow differences

| Task | Upstream | Fork |
| --- | --- | --- |
| Install | `yarn` | `bun install` |
| Dev server | `yarn start` | `make run-sim` (WebXDC) |
| Build | `yarn build` | `make build-webxdc` |
| Test | `yarn test:update` | `bun run test:update` |

## Upstream compatibility

Editor packages (`packages/*`) remain structurally compatible with upstream. Changes to those packages should be made in an upstream-compatible way when possible, using the Vite plugin system for WebXDC-specific build-time modifications.