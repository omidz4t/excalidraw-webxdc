# Excalidraw (Delta Exil) — Documentation

Complete documentation for the **Excalidraw WebXDC** fork: a collaborative whiteboard running inside [Delta Chat](https://delta.chat), built on the [Excalidraw](https://excalidraw.com) monorepo.

**52 documents** (~6,450 lines) covering every package, the WebXDC integration, editor internals, build system, and operations. See [Audit](./audit.md) for verification status.

---

## Getting started

| Document | Description |
| --- | --- |
| [Overview](./overview.md) | Project purpose, features, tech stack, versioning |
| [Development](./development.md) | Setup, commands, env vars, workflow |
| [Troubleshooting](./troubleshooting.md) | Common problems and fixes |
| [Glossary](./glossary.md) | Terms and definitions |
| [Contributing](./contributing.md) | How to contribute, PR guidelines |
| [Release Process](./release-process.md) | Building and shipping `.xdc` releases |

## Architecture

| Document | Description |
| --- | --- |
| [Architecture](./architecture.md) | Monorepo layout, build modes, dependency graph |
| [Fork Changes](./fork-changes.md) | What differs from upstream Excalidraw |
| [File Index](./file-index.md) | Important files and directories |
| [Dependencies](./dependencies.md) | All npm/workspace dependencies |
| [TypeScript Config](./typescript-config.md) | tsconfig, path aliases, type imports |
| [State Management](./state-management.md) | Jotai atoms, AppState, Yjs state |
| [Audit](./audit.md) | Documentation verification against codebase |

## Packages

| Document | Description |
| --- | --- |
| [Packages](./packages.md) | All workspace packages overview |
| [Common Package](./common-package.md) | `@excalidraw/common` modules |
| [Math Package](./math-package.md) | `@excalidraw/math` geometry |
| [Element Modules](./element-modules.md) | `@excalidraw/element` every file |
| [Fractional Indexing](./fractional-indexing-package.md) | Element ordering algorithm |
| [Laser Pointer](./laser-pointer-package.md) | Laser trail rendering |

## WebXDC / Delta Chat

| Document | Description |
| --- | --- |
| [WebXDC](./webxdc.md) | Integration, dev modes, deployment |
| [WebXDC Internals](./webxdc-internals.md) | Every file in `excalidraw-app/webxdc/` |
| [Realtime Protocol](./webxdc-realtime-protocol.md) | P2P message format (`pos`, `sel`, `doc`, etc.) |
| [WebXDC Stubs](./webxdc-stubs.md) | Bundle slimming and feature stubs |
| [WebXDC Dev Shim](./webxdc-dev-shim.md) | `public/webxdc.js` API reference |
| [Collaboration](./collaboration.md) | Yjs sync, sendUpdate, realtime layers |
| [CollabAPI](./collab-api.md) | Collaboration interface (standard vs WebXDC) |
| [Paste & Clipboard](./paste-clipboard.md) | WebXDC paste fix, image import |
| [Security](./security.md) | Encryption, CSP, privacy |
| [Public Assets](./public-assets.md) | Static files, fonts, icons |

## Editor (`packages/excalidraw`)

| Document | Description |
| --- | --- |
| [Editor Internals](./editor.md) | Component structure, state, data flow |
| [Tools](./tools.md) | All 16 drawing tools |
| [Keyboard Shortcuts](./keyboard-shortcuts.md) | Complete shortcut reference |
| [Actions](./actions.md) | Command/action system |
| [Rendering](./rendering.md) | Canvas layers, Rough.js pipeline |
| [Components](./components.md) | ~80 UI components catalogued |
| [Data Format](./data-format.md) | `.excalidraw` JSON schema |
| [API Reference](./api-reference.md) | Props, imperative API, exports |
| [History & Undo](./history-undo.md) | Undo/redo via StoreDelta |
| [Fonts](./fonts.md) | Font loading and WebXDC constraints |
| [i18n](./i18n.md) | 50+ locales, WebXDC English-only |
| [Library System](./library-system.md) | Shape libraries |
| [Reconcile & Delta](./reconcile-and-delta.md) | Change tracking and merge algorithms |

## Data & persistence

| Document | Description |
| --- | --- |
| [Data Layer](./data-layer.md) | Editor + app data modules |
| [Storage](./storage.md) | localStorage, IndexedDB, Firebase, Yjs |
| [Elements](./elements.md) | Element types, ordering, binding |

## Standard App (excalidraw.com)

| Document | Description |
| --- | --- |
| [Standard App](./standard-app.md) | excalidraw.com application shell |
| [Standard Collab](./standard-collab.md) | Firebase + socket.io collaboration |

## Build & operations

| Document | Description |
| --- | --- |
| [Build & Deploy](./build-and-deploy.md) | Vite, esbuild, `.xdc` packaging |
| [Scripts](./scripts.md) | Build script reference |
| [Environment](./environment.md) | All environment variables |
| [Testing](./testing.md) | Vitest, typecheck, lint, coverage |
| [Testing Inventory](./testing-inventory.md) | Complete list of ~100 test files |

---

## Quick reference

### Repository layout

```
excalidraw/
├── packages/                  # @excalidraw/* libraries (7 packages)
│   ├── excalidraw/            # Main React editor (~2000+ files)
│   ├── element/               # Element model (47 modules)
│   ├── common/                # Shared utilities (17 modules)
│   ├── math/                  # 2D geometry (13 modules)
│   ├── utils/                 # Export helpers
│   ├── fractional-indexing/   # Element ordering (CC0)
│   └── laser-pointer/         # Laser trail rendering
├── excalidraw-app/            # Application shell
│   ├── App.tsx                # excalidraw.com app
│   ├── collab/                # Firebase/socket.io collab
│   ├── data/                  # App persistence layer
│   ├── webxdc/                # Delta Chat WebXDC (20+ files)
│   └── manifest.toml          # WebXDC manifest (v1.0.4)
├── scripts/                   # esbuild builders (6 scripts)
├── public/                    # webxdc.js shim, fonts, icon
├── docs/                      # This documentation (52 files)
├── Makefile                   # WebXDC dev/build targets
├── package.json               # Bun workspaces root
├── tsconfig.json              # TypeScript + path aliases
└── vitest.config.mts          # Test configuration
```

### Primary commands

```bash
bun install                  # Install dependencies
make run                     # Single-user WebXDC dev → :3000/webxdc/
make run-sim                 # Multi-peer simulator → :7100
make build-webxdc            # Build excalidraw.xdc
bun run start                # Standard app dev → :3001
bun run test:typecheck       # TypeScript check
bun run test:update          # Run all tests
bun run fix                  # Prettier + ESLint
```

### Key artifacts

| Artifact | Path | Version |
| --- | --- | --- |
| WebXDC package | `excalidraw-app/dist-xdc/excalidraw.xdc` | manifest `1.0.4` |
| Standard app | `excalidraw-app/build/` | git SHA |
| npm packages | `packages/*/dist/` | `0.18.0` |

### Upstream

Based on [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) (MIT). See [Fork Changes](./fork-changes.md).