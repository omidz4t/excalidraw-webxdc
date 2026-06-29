# Release Process

## WebXDC releases

### 1. Update version

Edit `excalidraw-app/manifest.toml`:

```toml
version = "1.0.5"
```

Or let Makefile handle it:

```bash
make build-webxdc WEBXDC_VERSION=1.0.5
```

This runs `sed` to update `manifest.toml` and passes `WEBXDC_VERSION` to Vite.

### 2. Build

```bash
make build-webxdc
# Output: excalidraw-app/dist-xdc/excalidraw.xdc
```

Build steps (automated):
1. `bun install`
2. Set version in manifest
3. `VITE_APP_WEBXDC=true vite build`
4. Slim, pack, zip via Vite plugins
5. Print output path

### 3. Verify

- [ ] File exists at `excalidraw-app/dist-xdc/excalidraw.xdc`
- [ ] Version in manifest matches expected
- [ ] Test in Delta Chat: attach fresh `.xdc`, open, draw, verify sync
- [ ] Test multi-peer: `make run-sim` before release
- [ ] SENT/RECEIVED counters increase on draw

### 4. Distribute

- Attach `excalidraw.xdc` to a Delta Chat message
- Users must open the **new** attachment (old messages keep old version)
- Communicate that old attachments should be deleted

### 5. Version injection

Build embeds version as `import.meta.env.VITE_WEBXDC_VERSION`:
- Shown in boot errors
- Set in `collabSyncStatusAtom.buildId`
- Written to packaged `manifest.toml`

## Standard app releases (upstream workflow)

Not the primary focus of this fork, but available:

```bash
bun run build
# Output: excalidraw-app/build/
```

Post-build: `scripts/build-version.js` writes `build/version.json` with git SHA.

## npm package releases (upstream)

```bash
bun run build:packages
# Publishes from packages/*/dist/
```

Packages versioned at 0.18.0 in this fork. Publishing is upstream's responsibility.

## Pre-release checklist

```bash
bun run test:typecheck
bun run test:update
bun run fix
make build-webxdc
```

## Git artifacts

`.gitignore` excludes:
- `excalidraw-app/build-webxdc/`
- `excalidraw-app/dist-xdc/`
- `*.xdc`

Commit source changes; distribute `.xdc` separately.