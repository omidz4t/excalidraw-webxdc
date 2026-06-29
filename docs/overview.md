# Overview

## What is this project?

**Excalidraw** is an open-source, hand-drawn-style virtual whiteboard. This repository contains:

1. **`@excalidraw/excalidraw`** — a React component library published to npm
2. **`excalidraw-app`** — the reference web application (excalidraw.com)
3. **`excalidraw-app/webxdc/`** — a **Delta Chat WebXDC** variant for encrypted, in-chat collaborative drawing

The Delta Exil fork focuses on item 3: packaging Excalidraw as `excalidraw.xdc` so users can attach it to a Delta Chat conversation and draw together.

## Features

### Editor (from upstream)

- Infinite canvas-based whiteboard with hand-drawn aesthetic
- Shapes: rectangle, diamond, ellipse, arrow, line, freedraw, text, images, frames
- Arrow binding, labeled arrows, shape libraries
- Dark mode, localization (i18n), undo/redo, zoom/pan
- Export to PNG, SVG, clipboard, and `.excalidraw` JSON

### WebXDC / Delta Chat (this fork)

- **Persistent sync** via Delta Chat `sendUpdate` + Yjs (`y-webxdc`)
- **Live drawing** via Delta Chat P2P realtime channel (Delta Chat 1.48+)
- **Live cursors** and selection indicators over realtime
- **Follow mode** — viewport relay when following another user
- **Image import** via `webxdc.importFiles()` and clipboard paste
- **Theme persistence** in `localStorage`
- **Slim bundle** optimized for WebXDC size and CSP constraints

### excalidraw.com app (available but not the WebXDC target)

The standard app in `excalidraw-app/App.tsx` still supports:

- PWA / offline mode
- Firebase-backed collaboration
- Socket.io realtime
- Shareable readonly links
- Excalidraw+ integration

These are **disabled or stubbed** in the WebXDC build.

## Technology stack

| Layer | Technology |
| --- | --- |
| UI | React 19, SCSS, Radix UI |
| State | Jotai |
| Drawing | Rough.js, perfect-freehand |
| Sync | Yjs, y-webxdc |
| Realtime | Delta Chat `joinRealtimeChannel()` |
| Bundler (app) | Vite 5 |
| Bundler (packages) | esbuild |
| Package manager | Bun 1.3+ workspaces |
| Testing | Vitest, Testing Library, jsdom |
| Language | TypeScript 5.9 (strict) |

## Repository layout

```
.
├── excalidraw-app/          # Application
│   ├── App.tsx              # Full excalidraw.com app
│   ├── collab/              # Firebase/socket.io collaboration (standard app)
│   ├── components/          # App-specific UI
│   ├── data/                # Persistence, file management
│   ├── manifest.toml        # WebXDC manifest
│   ├── vite.config.mts      # Vite config (dual-mode: app / webxdc)
│   └── webxdc/              # WebXDC-specific code
├── packages/
│   ├── excalidraw/          # Main editor (~thousands of files)
│   ├── element/             # Element types and operations
│   ├── common/              # Shared constants and helpers
│   ├── math/                # Vectors, curves, intersections
│   ├── utils/               # Export utilities
│   ├── fractional-indexing/ # Stable element ordering
│   └── laser-pointer/       # Laser pointer path smoothing
├── scripts/                 # Build scripts for packages
├── public/                  # Static assets (fonts, icons, webxdc.js shim)
├── vitest.config.mts        # Test configuration
├── tsconfig.json            # Root TypeScript config
├── Makefile                 # WebXDC convenience targets
└── bunfig.toml              # Bun linker config (hoisted)
```

## Versioning

| Artifact | Version source |
| --- | --- |
| npm packages (`@excalidraw/*`) | `0.18.0` in each `package.json` |
| WebXDC app | `manifest.toml` → `version = "1.0.4"` |
| Build-time injection | `WEBXDC_VERSION` env var / `make build-webxdc` |

The WebXDC version is injected at build time as `import.meta.env.VITE_WEBXDC_VERSION` and shown in sync status / boot errors.

## License

MIT — see upstream [LICENSE](https://github.com/excalidraw/excalidraw/blob/master/LICENSE).