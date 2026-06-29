# Glossary

| Term | Definition |
| --- | --- |
| **AppState** | The editor's UI and viewport state (zoom, colors, selection, theme, etc.) |
| **BinaryFiles** | Map of `fileId` → image data (base64 data URLs) for embedded images |
| **Binding** | Connection between an arrow endpoint and a target element at a fixed point |
| **CollabAPI** | Imperative interface for collaboration features, set on Jotai atom |
| **CRDT** | Conflict-free Replicated Data Type — Yjs provides this for document sync |
| **Delta Chat** | Messenger that runs WebXDC apps in encrypted chats |
| **Element** | A single object on the canvas (rectangle, arrow, text, image, etc.) |
| **ExcalidrawBinding** | WebXDC class bridging Excalidraw API ↔ Yjs document |
| **FractionalIndex** | String-based ordering key allowing concurrent insertions without renumbering |
| **Rough.js** | Library producing hand-drawn/sketchy rendering |
| **sendUpdate** | Delta Chat WebXDC API for sending status updates to chat peers |
| **setUpdateListener** | Delta Chat WebXDC API for receiving status updates (with history replay) |
| **WebXDC** | Web eXchangeable Delta Chat — ZIP-based portable web app format (`.xdc`) |
| **WebxdcProvider** | y-webxdc class that syncs Yjs doc via sendUpdate/setUpdateListener |
| **Yjs** | CRDT framework for shared document editing |
| **y-webxdc** | Adapter connecting Yjs to Delta Chat WebXDC APIs |
| **Realtime channel** | Delta Chat P2P channel for low-latency messages (1.48+) |
| **Scene** | The complete set of elements on the canvas |
| **CaptureUpdateAction** | Controls whether a scene update triggers onChange and history |
| **Imperative API** | `ExcalidrawImperativeAPI` — programmatic editor control |
| **Store / StoreDelta** | Internal change tracking system for elements and history |
| **Sync bridge** | `createWebxdcSyncBridge` — safe wrapper around frozen window.webxdc |
| **Slim plugin** | Vite plugin that stubs/strips features for WebXDC bundle size |
| **realFinger** | Pattern where host injects webxdc.js before app code loads |
| **Monorepo** | Single repository containing multiple packages (workspaces) |
| **Workspace** | Bun/npm package within the monorepo (e.g. `packages/excalidraw`) |
| **PWA** | Progressive Web App — offline-capable web app with service worker |
| **TTD** | Text-to-Diagram — AI feature converting text to Excalidraw elements |
| **Mermaid** | Diagram markup language importable into Excalidraw |
| **Jotai** | Atomic state management library used for editor and app state |
| **Vitest** | Test runner (Vite-native, Jest-compatible API) |
| **esbuild** | Fast JavaScript bundler used for package builds |
| **Vite** | Dev server and bundler used for the application |