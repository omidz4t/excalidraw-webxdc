# WebXDC Dev Shim (`public/webxdc.js`)

Complete reference for the development `window.webxdc` implementation.

## Purpose

```js
// Minimal shim for standalone browser testing ONLY.
// In Delta Chat (or webxdc-dev), window.webxdc is injected by the host
```

- Used by `make run` (Vite + `mockWebxdc` plugin)
- Served at `/webxdc/webxdc.js` by `webxdc-dev-plugin.mts`
- **Not included** in production `.xdc` zip (replaced by `webxdc-stub.js`)
- Delta Chat and `webxdc-dev` inject their own `window.webxdc` at runtime

## API surface

| Property/Method | Shim behavior |
| --- | --- |
| `selfAddr` | `dev-<random>@example.org` |
| `selfName` | `"Local Tester"` |
| `sendUpdateInterval` | `250` ms |
| `sendUpdateMaxSize` | `128000` bytes |
| `sendUpdate(payload, desc)` | Increments serial, stores locally, broadcasts via BroadcastChannel |
| `setUpdateListener(cb, minSerial)` | Replays stored updates ≥ minSerial |
| `getAllUpdates()` | Returns all stored updates |
| `sendToChat(message)` | Pushes to `chatDrafts` array, logs to console |
| `importFiles(filter)` | Creates `<input type="file">` and returns selected files |
| `getAppInfo()` | `{ name: "Excalidraw", version: "1.0.0" }` |
| `joinRealtimeChannel()` | Creates BroadcastChannel-based realtime shim |
| `__getChatDrafts()` | Debug: returns chat drafts (shim-only) |

## sendUpdate shim

```js
sendUpdate(payload, description) {
  serial += 1;
  const update = { ...payload, serial, max_serial: serial };
  updates.push(update);
  updateListener(update);
  // Broadcast to other tabs via BroadcastChannel("webxdc-updates-shim")
}
```

Updates persist in memory only (lost on page reload).

## Realtime shim

Uses `BroadcastChannel("webxdc-realtime-shim")`:

```js
class RealtimeChannelShim {
  setListener(cb)    // receive Uint8Array messages
  send(data)         // broadcast to other tabs (max 128KB)
  leave()            // detach from channel
}
```

Each instance gets a unique `instanceId` to avoid echo.

### Limitations

- **Same browser only** — BroadcastChannel doesn't cross devices
- **No webxdc-dev WebSocket** — doesn't simulate real Delta Chat networking
- For multi-peer testing, use `make run-sim` (webxdc-dev with WebSocket)

## importFiles shim

Creates a hidden file input:

```js
importFiles(filter) {
  // filter: { mimeTypes, extensions, multiple }
  // Returns Promise<File[]>
}
```

Works in any modern browser for local image testing.

## Integration with Vite dev

### `mockWebxdc` plugin

From `@webxdc/vite-plugins` — injects shim script into dev HTML.

### `webxdc-dev-plugin.mts`

Serves shim at:
- `/webxdc/webxdc.js`
- `/webxdc.js`

With `Content-Type: application/javascript`.

## Comparison: shim vs Delta Chat vs webxdc-dev

| Feature | `public/webxdc.js` | `webxdc-dev` | Delta Chat |
| --- | --- | --- | --- |
| sendUpdate transport | BroadcastChannel | WebSocket relay | Chat messages |
| Realtime transport | BroadcastChannel | WebSocket P2P | P2P channel |
| Multi-device | No | Yes (simulated) | Yes |
| History replay | In-memory only | Full | Full chat history |
| importFiles | File input | File input | Native picker |
| selfAddr | Random dev addr | Simulated addrs | Real chat address |

## Testing with shim

```bash
make run
# Open http://localhost:3000/webxdc/
# Single tab — draw, verify no errors
# Open second tab same URL — limited sync via BroadcastChannel
```

For reliable multi-peer:

```bash
make run-sim
# Open http://localhost:7100
# Two side-by-side panels with WebSocket sync
```