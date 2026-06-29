# Development Guide

## Prerequisites

- **Node.js** ≥ 18
- **Bun** 1.3+ (package manager; specified in root `package.json`)
- Linux/macOS recommended (Makefile uses `fuser` for port cleanup)

## Getting started

```bash
# Clone and install
git clone <repo-url>
cd excalidraw
bun install
```

Bun uses a hoisted linker (`bunfig.toml`: `linker = "hoisted"`).

## Development modes

### WebXDC development (primary for this fork)

```bash
# Single-tab dev with mocked webxdc
make run
# → http://localhost:3000/webxdc/

# Multi-peer simulator (recommended for collab testing)
make run-sim
# → http://localhost:7100
```

See [WebXDC](./webxdc.md) for details on dev vs. simulator.

### Standard excalidraw.com app

```bash
bun run start
# → http://localhost:3000 (opens browser)
```

Requires Firebase env vars for full collaboration features (`.env.development` in repo root).

## Where to work

| Task | Location |
| --- | --- |
| Editor features (tools, rendering) | `packages/excalidraw/` |
| Element model / geometry | `packages/element/` |
| Shared utilities | `packages/common/`, `packages/math/` |
| WebXDC collab / sync | `excalidraw-app/webxdc/` |
| Standard app features | `excalidraw-app/` (outside `webxdc/`) |
| Build configuration | `excalidraw-app/vite.config.mts`, `scripts/` |
| Tests | Co-located `*.test.ts(x)` in packages and app |

## Commands reference

### Root `package.json` scripts

| Command | Description |
| --- | --- |
| `bun run start` | Start standard Vite dev server |
| `bun run dev:webxdc` | WebXDC multi-peer dev |
| `bun run build:webxdc` | Build `.xdc` package |
| `bun run build` | Build standard app |
| `bun run build:packages` | Build all npm packages |
| `bun run test` | Run Vitest (watch mode) |
| `bun run test:update` | Run tests, update snapshots |
| `bun run test:typecheck` | `tsc` type checking |
| `bun run test:code` | ESLint |
| `bun run test:other` | Prettier check |
| `bun run test:all` | typecheck + lint + prettier + tests |
| `bun run fix` | Auto-fix prettier + eslint |
| `bun run test:coverage` | Vitest with coverage |
| `bun run test:ui` | Vitest UI with coverage |
| `bun run rm:build` | Remove all build artifacts |
| `bun run clean-install` | Remove node_modules and reinstall |

### Makefile targets

| Target | Description |
| --- | --- |
| `make install` | `bun install` |
| `make run` | Single-user WebXDC dev |
| `make run-sim` | Multi-peer WebXDC simulator |
| `make build-webxdc` | Build `excalidraw.xdc` |
| `make test` | Run all tests (`bun run test:all`) |
| `make test-update` | Run tests and update snapshots |
| `make fix` | Auto-fix formatting and linting |
| `make clean` | Remove WebXDC build output |
| `make clean-install` | Remove node_modules and reinstall |

## Environment variables

Env files live in the **repo root** (`envDir: "../"` in Vite config).

| Variable | Purpose |
| --- | --- |
| `VITE_APP_WEBXDC` | Enable WebXDC build mode (`true`) |
| `WEBXDC_VERSION` | WebXDC app version string |
| `VITE_APP_PORT` | Dev server port (default 3000) |
| `VITE_DEV_PORT` | WebXDC Vite port (Makefile) |
| `WEBXDC_DEV_PORT` | webxdc-dev simulator port |
| `VITE_APP_GIT_SHA` | Git commit SHA (standard app build) |
| `VITE_APP_ENABLE_TRACKING` | Analytics toggle |
| `VITE_APP_ENABLE_PWA` | PWA in dev |
| `VITE_APP_ENABLE_ESLINT` | Vite ESLint overlay |
| `VITE_APP_DISABLE_SENTRY` | Disable Sentry |
| `VERCEL_GIT_COMMIT_SHA` | Set by Vercel for production builds |

## Code style

- **TypeScript** strict mode
- **Prettier** via `@excalidraw/prettier-config`
- **ESLint** via `@excalidraw/eslint-config`
- Pre-commit hook was removed (`.husky/pre-commit` deleted); run `bun run fix` manually

## TypeScript path aliases

Packages resolve to source during development. If your editor shows import errors, ensure `tsconfig.json` paths are picked up. The root `tsconfig.json` includes `packages` and `excalidraw-app`.

## Pre-commit checklist

Before committing:

```bash
bun run test:typecheck   # TypeScript
bun run test:update      # Tests + snapshot updates
bun run fix              # Formatting + lint
```

## Debugging WebXDC sync

1. Use `make run-sim` (not `make run`) for multi-peer testing
2. Watch SENT/RECEIVED counters in each simulator panel
3. Check `collabSyncStatusAtom` fields if you add debug UI
4. Boot errors reference `WEBXDC_VERSION` — ensure chat has the matching `.xdc`

## Common issues

| Problem | Solution |
| --- | --- |
| Canvas blank in embed | Import CSS, ensure parent has height (see packages/excalidraw README) |
| `window.webxdc` not found | Use `make run-sim`, or attach fresh `.xdc` in Delta Chat |
| Multi-peer sync not working with `make run` | Expected — use `make run-sim` for WebSocket realtime |
| Port already in use | Makefile kills ports via `fuser`; or set `VITE_DEV_PORT` |
| Type errors after package changes | Run `bun run test:typecheck` |