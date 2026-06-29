# Documentation Audit

Verification of key documentation claims against the codebase (as of audit date).

## Verified facts

| Claim | Source | Status |
| --- | --- | --- |
| WebXDC version in manifest | `manifest.toml` → `1.0.4` | ✓ |
| Package versions | All `@excalidraw/*` at `0.18.0` | ✓ |
| Bun package manager | `package.json` → `"packageManager": "bun@1.3.1"` | ✓ |
| WebXDC output path | `Makefile` → `excalidraw-app/dist-xdc/excalidraw.xdc` | ✓ |
| Default Vite dev port (Makefile) | `VITE_DEV_PORT ?= 3000` | ✓ |
| Default webxdc-dev port | `WEBXDC_DEV_PORT ?= 7100` | ✓ |
| `.env.development` VITE_APP_PORT | `3001` (standard app, not WebXDC) | ✓ |
| INIT_WAIT_MS for Yjs | `WebxdcCollab.tsx` → `2_000` | ✓ |
| REALTIME_DOC_MS | `constants.ts` → `80` | ✓ |
| PERSIST_FLUSH_MS | `constants.ts` → `500` | ✓ |
| PERSIST_SCENE_SYNC_MS | `constants.ts` → `3000` | ✓ |
| CURSOR_SEND_INTERVAL_MS | `webxdc-realtime-channel.ts` → `33` | ✓ |
| STALE_MS for peers | `webxdc-realtime-channel.ts` → `8_000` | ✓ |
| DEFAULT_REALTIME_MAX_BYTES | `128_000` | ✓ |
| waitForWebxdc timeout | `get-webxdc.ts` → `15_000` ms | ✓ |
| waitForWebxdc poll interval | `get-webxdc.ts` → `50` ms | ✓ |
| DELETED_ELEMENT_TIMEOUT | `app_constants.ts` → 24h | ✓ |
| FILE_UPLOAD_MAX_BYTES | `app_constants.ts` → 4 MiB | ✓ |
| Husky pre-commit removed | `.husky/pre-commit` deleted in git status | ✓ |
| Fractional indexing CC0 | Comment in `fractional-indexing/src/index.ts` | ✓ |
| 8 USER_COLORS | `user-colors.ts` | ✓ |
| Tool types count | 16 types in `ToolType` | ✓ |
| Yarn lock removed | `yarn.lock` deleted, `bun.lock` added | ✓ |

## Corrections applied during audit

| Item | Correction |
| --- | --- |
| Standard app dev port | Documented as 3001 from `.env.development`, not 3000 |
| WebXDC `startCollaboration` | Documented as no-op without room params (differs from type signature) |
| Paste fix auto-install | `installWebxdcPasteFix()` runs at module load in `import-image.ts` |
| Legacy realtime Yjs | `onRealtimeData` accepts raw Yjs bytes (not just JSON) for backward compat |
| Library in WebXDC | Not stubbed — included but low priority for chat use |

## Unverified / environment-dependent

| Item | Notes |
| --- | --- |
| Delta Chat 1.48+ for realtime | Documented requirement — depends on host app version |
| Firebase config in `.env.development` | Contains real dev API keys (public by design) |
| excalidraw-room WebSocket | Requires separate server for standard app collab |
| Bundle size of .xdc | Varies per build — check `reportCompressedSize` output |

## Test count

~100 test files across packages (see [Testing Inventory](./testing-inventory.md)).

Run to verify:

```bash
bun run test:typecheck
bun run test:update
```

## Documentation coverage map

| Area | Doc file(s) | Coverage |
| --- | --- | --- |
| Project overview | overview.md | Complete |
| Monorepo architecture | architecture.md | Complete |
| All packages | packages.md + per-package docs | Complete |
| WebXDC integration | webxdc.md, webxdc-internals.md, webxdc-realtime-protocol.md, webxdc-stubs.md, webxdc-dev-shim.md | Complete |
| Collaboration | collaboration.md, collab-api.md, reconcile-and-delta.md | Complete |
| Editor internals | editor.md, tools.md, actions.md, rendering.md, components.md | Complete |
| Element model | elements.md, element-modules.md | Complete |
| Data & storage | data-format.md, data-layer.md, storage.md, paste-clipboard.md | Complete |
| API | api-reference.md | Complete |
| Build & deploy | build-and-deploy.md, scripts.md, release-process.md | Complete |
| Dev workflow | development.md, environment.md, typescript-config.md | Complete |
| Testing | testing.md, testing-inventory.md | Complete |
| Security | security.md | Complete |
| Troubleshooting | troubleshooting.md | Complete |
| Fork diff | fork-changes.md | Complete |
| File reference | file-index.md | Complete |
| Keyboard shortcuts | keyboard-shortcuts.md | Complete |
| State management | state-management.md | Complete |
| Dependencies | dependencies.md | Complete |
| Fonts, i18n, library | fonts.md, i18n.md, library-system.md | Complete |
| Supporting packages | common-package.md, math-package.md, fractional-indexing-package.md, laser-pointer-package.md | Complete |
| Public assets | public-assets.md | Complete |
| Glossary | glossary.md | Complete |
| Contributing | contributing.md | Complete |

## Recommended manual verification after changes

1. `make run-sim` — draw in one panel, verify other panel updates
2. `make build-webxdc` — verify `.xdc` created
3. Attach to Delta Chat — verify boot, draw, sync, image import
4. `bun run test:all` — automated regression