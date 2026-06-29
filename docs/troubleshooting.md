# Troubleshooting

## WebXDC / Delta Chat

### "window.webxdc was not found"

**Cause:** The host did not inject the WebXDC API before the app loaded.

**Fix:**
1. Delete all old Excalidraw attachments in the chat
2. Attach a fresh `excalidraw.xdc` built with `make build-webxdc`
3. Open the **new** attachment (not an old message)

**Dev fix:** Use `make run` or `make run-sim` — these serve the `public/webxdc.js` shim.

### Drawing doesn't sync between users

**Check:**
1. Are you using `make run-sim` for dev testing? (`make run` only supports single-tab BroadcastChannel)
2. Is realtime enabled in Delta Chat Advanced settings (1.48+)?
3. Do SENT/RECEIVED counters increase in the simulator panels?
4. Check `collabSyncStatusAtom.hint` for status messages

**Without realtime:** Sync still works via `sendUpdate` but with ~few second latency.

### Canvas is blank

**Check:**
1. CSS imported? (`@excalidraw/excalidraw/index.css`)
2. Parent container has height? (needs `height: 100%` or `100vh`)
3. WebXDC: check browser console inside Delta Chat WebView

### Old version showing after update

WebXDC caches the attachment per chat message. You must attach a **new** `.xdc` file — editing an old message won't update the app.

Verify version in boot error or `WEBXDC_VERSION` env at build time.

### Images won't paste/import

**WebXDC specifics:**
- Use menu → "Insert image…" (calls `webxdc.importFiles`)
- Tap canvas before pasting (focus required)
- Clipboard paste has WebView-specific fallbacks in slim `App.tsx` transform

### Theme doesn't persist

Theme stored in localStorage (`excalidraw-theme`) and IndexedDB (`excalidraw-webxdc-settings`). If WebView clears storage between sessions, theme resets to light.

## Development

### Port already in use

```bash
# Makefile kills ports automatically, or manually:
fuser -k 3000/tcp 7100/tcp
# Or change ports:
VITE_DEV_PORT=3001 WEBXDC_DEV_PORT=7101 make run-sim
```

### TypeScript errors after changes

```bash
bun run test:typecheck
```

Ensure path aliases in `tsconfig.json` match your imports.

### Tests fail with snapshot mismatch

```bash
bun run test:update
```

Review snapshot diffs before committing.

### ESLint / Prettier failures

```bash
bun run fix
```

### `bun install` issues

```bash
bun run clean-install
```

### Vite empty page at /webxdc/

The `webxdc-dev-plugin` must serve `webxdc/index.html` for HTML requests. Ensure `VITE_APP_WEBXDC=true` is set.

## Build

### WebXDC build fails: missing nested HTML

```
WebXDC build failed: expected build-webxdc/webxdc/index.html
```

Ensure `VITE_APP_WEBXDC=true` and entry is `webxdc/index.html` in vite config.

### Bundle too large

Check `vite-slim-plugin.mts` exclusions. Run build with `reportCompressedSize: true` to identify large chunks.

## Standard app

### Collaboration not connecting

1. Is `excalidraw-room` WebSocket server running at `VITE_APP_WS_SERVER_URL`?
2. Is Firebase config valid in `.env.development`?
3. Check browser console for CORS or WebSocket errors

### PWA not updating

Clear service worker cache or set `VITE_APP_ENABLE_PWA=true` in dev to test SW behavior.

## Getting help

- [Excalidraw GitHub Issues](https://github.com/excalidraw/excalidraw/issues)
- [Excalidraw Discord](https://discord.gg/UexuTaE)
- [Delta Chat forum](https://support.delta.chat)
- [WebXDC specification](https://webxdc.org)