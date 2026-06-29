# Excalidraw for Delta Chat

A [WebXDC](https://webxdc.org) port of [Excalidraw](https://excalidraw.com) — a collaborative, hand-drawn whiteboard that runs inside [Delta Chat](https://delta.chat). Drawing state syncs through the chat via Yjs; live cursors and strokes use Delta Chat's P2P realtime channel.

**Primary deliverable:** `excalidraw.xdc` — attach to a chat and draw together with end-to-end encryption provided by the messenger.

Based on the upstream [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) monorepo (MIT). See [Fork Changes](docs/fork-changes.md) for what differs from upstream.

---

## Features

### WebXDC (this fork)

- Persistent scene sync via Delta Chat `sendUpdate` and Yjs (`y-webxdc`)
- Live drawing and collaborator cursors over P2P realtime (Delta Chat 1.48+)
- Follow mode — viewport relay when following another user
- Image import via `webxdc.importFiles()` and clipboard paste
- Slim bundle optimized for WebXDC size and CSP constraints

### Editor (from upstream)

- Infinite canvas with hand-drawn aesthetic (Rough.js)
- Shapes, arrows with binding, labeled arrows, frames, images, freedraw
- Undo/redo, zoom/pan, dark mode, shape libraries
- Export to PNG, SVG, clipboard, and `.excalidraw` JSON

Standard excalidraw.com features (Firebase collab, PWA, Excalidraw+) remain in the codebase but are disabled or stubbed in the WebXDC build.

---

## Quick start

### Prerequisites

- **Bun** 1.3+ (package manager)
- **Node.js** ≥ 18

```bash
bun install
```

### Development

| Command | URL | Use case |
| --- | --- | --- |
| `make run` | http://localhost:3000/webxdc/ | Single-tab dev with mocked `webxdc.js` |
| `make run-sim` | http://localhost:7100 | Multi-peer collab simulator (recommended) |

Use `make run-sim` for collaboration testing. `make run` uses BroadcastChannel and only works in a single tab.

### Build

```bash
make build-webxdc
# → excalidraw-app/dist-xdc/excalidraw.xdc
```

Override the package version:

```bash
WEBXDC_VERSION=1.0.5 make build-webxdc
```

### Standard app (optional)

To run the upstream excalidraw.com shell locally:

```bash
bun run start
```

### Quality checks

```bash
bun run test:typecheck   # TypeScript
bun run test:update      # Tests (with snapshot updates)
bun run fix              # Prettier + ESLint
```

---

## Repository layout

```
excalidraw/
├── packages/              # @excalidraw/* editor libraries
│   ├── excalidraw/        # Main React editor
│   ├── element/           # Element model and operations
│   ├── common/            # Shared utilities
│   ├── math/              # 2D geometry
│   └── …
├── excalidraw-app/
│   ├── webxdc/            # WebXDC application layer
│   ├── manifest.toml      # WebXDC manifest (v1.0.4)
│   └── App.tsx            # Standard excalidraw.com app
├── docs/                  # Project documentation
├── Makefile               # WebXDC dev/build targets
└── public/                # Static assets, webxdc.js dev shim
```

| Artifact | Path |
| --- | --- |
| WebXDC package | `excalidraw-app/dist-xdc/excalidraw.xdc` |
| npm packages | `packages/*/dist/` (v0.18.0) |

---

## Architecture

```
Editor onChange
  → ExcalidrawBinding (y-excalidraw)
  → Yjs Y.Doc
  → WebxdcProvider (y-webxdc)
  → webxdc.sendUpdate()          # persistent sync via chat
  → joinRealtimeChannel()        # live strokes + cursors
```

Collaboration replaces the upstream Firebase + socket.io stack. See [Collaboration](docs/collaboration.md) and [WebXDC Internals](docs/webxdc-internals.md).

### Technology stack

| Layer | Technology |
| --- | --- |
| UI | React 19, SCSS, Radix UI |
| State | Jotai |
| Drawing | Rough.js, perfect-freehand |
| Sync | Yjs, y-webxdc |
| Realtime | Delta Chat `joinRealtimeChannel()` |
| Bundler | Vite 5 (app), esbuild (packages) |
| Package manager | Bun workspaces |
| Language | TypeScript 5.9 (strict) |

---

## Documentation

Full documentation lives in [`docs/`](docs/README.md) — 50+ guides covering architecture, WebXDC integration, editor internals, build system, and operations.

| Topic | Document |
| --- | --- |
| Getting started | [Overview](docs/overview.md) · [Development](docs/development.md) |
| WebXDC integration | [WebXDC](docs/webxdc.md) · [Realtime Protocol](docs/webxdc-realtime-protocol.md) |
| Fork differences | [Fork Changes](docs/fork-changes.md) |
| Element model | [Elements](docs/elements.md) · [Data Format](docs/data-format.md) |
| Build and release | [Build & Deploy](docs/build-and-deploy.md) · [Release Process](docs/release-process.md) |
| Troubleshooting | [Troubleshooting](docs/troubleshooting.md) |

---

## Where to work

| Task | Location |
| --- | --- |
| Editor features (tools, rendering) | `packages/excalidraw/` |
| Element model / geometry | `packages/element/` |
| WebXDC collab / sync | `excalidraw-app/webxdc/` |
| Standard app features | `excalidraw-app/` (outside `webxdc/`) |
| Build configuration | `excalidraw-app/vite.config.mts`, `scripts/` |

---

## Upstream Excalidraw

This fork maintains the upstream monorepo structure so editor packages can be updated from [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw). The `@excalidraw/excalidraw` npm package can still be built from `packages/excalidraw/`.

Upstream resources:

- [excalidraw.com](https://excalidraw.com) — hosted editor
- [docs.excalidraw.com](https://docs.excalidraw.com) — upstream documentation
- [@excalidraw/excalidraw on npm](https://www.npmjs.com/package/@excalidraw/excalidraw)

---

## License

MIT — see [LICENSE](LICENSE). Excalidraw is maintained by the [Excalidraw team](https://github.com/excalidraw).