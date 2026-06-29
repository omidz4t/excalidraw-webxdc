# Architecture

## Monorepo structure

The project uses **Bun workspaces** with two top-level workspace roots:

```json
"workspaces": [
  "excalidraw-app",
  "packages/*"
]
```

During development, Vite and Vitest resolve `@excalidraw/*` packages directly to **TypeScript source** via path aliases — no pre-build of packages is required for app or WebXDC development.

## Dependency graph

```mermaid
graph TD
    subgraph app [excalidraw-app]
        WebxdcApp[webxdc/WebxdcApp.tsx]
        App[App.tsx]
        Collab[collab/Collab.tsx]
    end

    subgraph core [packages/excalidraw]
        Editor[Excalidraw component]
    end

    subgraph foundation [foundation packages]
        Element[@excalidraw/element]
        Common[@excalidraw/common]
        Math[@excalidraw/math]
        FI[@excalidraw/fractional-indexing]
        LP[@excalidraw/laser-pointer]
    end

    Utils[@excalidraw/utils]

    WebxdcApp --> Editor
    App --> Editor
    App --> Collab
    WebxdcApp --> WebxdcCollab[webxdc/WebxdcCollab.tsx]

    Editor --> Element
    Editor --> Common
    Editor --> Math
    Editor --> LP
    Element --> Common
    Element --> Math
    Element --> FI
    Math --> Common
    Utils --> LP
```

## Dual build modes

`excalidraw-app/vite.config.mts` supports two distinct targets controlled by `VITE_APP_WEBXDC=true`:

| Aspect | Standard app | WebXDC build |
| --- | --- | --- |
| Entry HTML | `index.html` | `webxdc/index.html` |
| Output dir | `build/` | `build-webxdc/` → `dist-xdc/excalidraw.xdc` |
| Base URL | `/` (default) | `./` (relative paths for zip) |
| PWA | Enabled | Disabled (stubbed) |
| Sentry / Firebase / socket.io | Enabled | Stubbed empty modules |
| Mermaid / charts | Enabled | Stubbed / stripped |
| i18n | Full locale set | English only |
| Fonts | CDN + many families | Virgil + Assistant only (self-hosted) |
| Code splitting | Manual chunks | Single inline bundle |
| Source maps | Yes | No |
| Console | Kept | Dropped (`esbuild.drop`) |

## Path aliases

Both `tsconfig.json`, `vitest.config.mts`, and `vite.config.mts` map package names to source:

```
@excalidraw/excalidraw  → packages/excalidraw/index.tsx
@excalidraw/element     → packages/element/src/index.ts
@excalidraw/common      → packages/common/src/index.ts
@excalidraw/math        → packages/math/src/index.ts
@excalidraw/utils       → packages/utils/src/index.ts
@excalidraw/fractional-indexing → packages/fractional-indexing/src/index.ts
@excalidraw/laser-pointer       → packages/laser-pointer/src/index.ts
```

## Editor architecture (packages/excalidraw)

The main editor is a large React application structured roughly as:

| Area | Location | Responsibility |
| --- | --- | --- |
| Entry | `index.tsx` | Public API exports |
| Main component | `components/App.tsx` | Canvas, tools, UI shell |
| Elements | `packages/element/` | Data model, hit testing, rendering |
| Actions | `actions/` | User operations (delete, align, etc.) |
| Renderer | `renderer/` | Canvas rendering via Rough.js |
| Data | `data/` | Serialization, restore, blob handling |
| i18n | `i18n.ts`, `locales/` | Translations |
| Fonts | `fonts/` | Font loading and subsetting |

The editor exposes an imperative API (`ExcalidrawImperativeAPI`) used by both the standard collab layer and the WebXDC collab layer.

## App shell architecture (excalidraw-app)

### Standard app flow

```
index.tsx → App.tsx → Excalidraw + Collab (Firebase/socket.io)
```

### WebXDC app flow

```
webxdc/index.tsx → waitForWebxdc() → WebxdcApp.tsx
  → Excalidraw + WebxdcCollab (Yjs + y-webxdc + realtime)
```

WebXDC boot sequence:

1. Poll for `window.webxdc` (Delta Chat injects it via `webxdc.js`)
2. Show boot error if missing after 15s timeout
3. Render `WebxdcApp` with collaboration always enabled
4. `WebxdcCollab` initializes Yjs document, `y-webxdc` provider, and optional realtime channel

## State management

| Layer | Library | Usage |
| --- | --- | --- |
| Editor internals | Jotai + jotai-scope | Tool state, UI state |
| App shell | Jotai (`app-jotai.ts`) | Collab API atom, theme, sync status |
| Document sync | Yjs | Shared CRDT for elements, assets, scene settings |

## WebXDC build pipeline plugins

Vite plugins applied only in WebXDC mode:

1. **`webxdcSlimPlugin`** — Stubs heavy features, strips locales/fonts, removes bundle assets
2. **`webxdcDevPlugin`** — Dev server helpers
3. **`mockWebxdc`** — Injects `public/webxdc.js` shim for local dev
4. **`webxdcPackPlugin`** — Flattens `webxdc/index.html` → `index.html`, copies manifest + stub
5. **`buildXDC`** — Zips `build-webxdc/` into `dist-xdc/excalidraw.xdc`

See [Build & Deploy](./build-and-deploy.md) for the full pipeline.