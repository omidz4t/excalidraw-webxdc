# Contributing

## Before you start

1. Read [Development](./development.md) for setup
2. Read [Architecture](./architecture.md) to understand the monorepo
3. For WebXDC work, read [WebXDC](./webxdc.md) and [Collaboration](./collaboration.md)

## Setup

```bash
bun install
```

## Pre-commit checklist

```bash
bun run test:typecheck   # TypeScript
bun run test:update      # Tests (updates snapshots)
bun run fix              # Prettier + ESLint
```

Note: The Husky pre-commit hook was removed in this fork. Run checks manually.

## Where to make changes

| Change type | Location |
| --- | --- |
| Editor tool/feature | `packages/excalidraw/` |
| Element behavior | `packages/element/` |
| WebXDC sync/collab | `excalidraw-app/webxdc/` |
| WebXDC build size | `excalidraw-app/webxdc/vite-slim-plugin.mts` |
| Standard app feature | `excalidraw-app/` (outside webxdc/) |
| Build config | `excalidraw-app/vite.config.mts`, `scripts/` |
| Tests | Co-located `*.test.ts(x)` files |

## Code style

- **TypeScript** strict mode — no `any` without justification
- **Prettier** — `@excalidraw/prettier-config`
- **ESLint** — `@excalidraw/eslint-config`, zero warnings
- Match existing patterns: naming, imports, file structure

## Testing

```bash
bun run test              # Watch mode
bun run test:update       # Update snapshots
bun run test:coverage     # Coverage report
```

Add tests for new logic in the appropriate package's `tests/` directory.

See [Testing](./testing.md) for details.

## WebXDC development workflow

1. Make changes
2. Test single-user: `make run`
3. Test multi-peer: `make run-sim`
4. Build package: `make build-webxdc`
5. Test in Delta Chat with fresh attachment

## Pull request guidelines

### Editor changes (upstream-compatible)

- Keep changes in `packages/` for potential upstream contribution
- Run full test suite
- Avoid WebXDC-specific logic in packages

### WebXDC changes (fork-specific)

- Keep in `excalidraw-app/webxdc/`
- Use Vite plugins for editor modifications (not direct forks)
- Document protocol changes in [Realtime Protocol](./webxdc-realtime-protocol.md)
- Bump `manifest.toml` version for releases

## Versioning

| Artifact | When to bump |
| --- | --- |
| `manifest.toml` version | Every WebXDC release |
| `WEBXDC_VERSION` in Makefile | Keep in sync with manifest |
| `packages/*/package.json` version | When publishing npm packages |

## Upstream contribution

This fork is based on [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw). Editor improvements that aren't WebXDC-specific can be contributed upstream:

- [Contributing guide](https://docs.excalidraw.com/docs/introduction/contributing)
- [Discord](https://discord.gg/UexuTaE)

## Translations

Upstream uses Crowdin. WebXDC build is English-only, so translations are low priority for this fork.

## Reporting issues

- Editor bugs: [excalidraw/excalidraw issues](https://github.com/excalidraw/excalidraw/issues)
- WebXDC-specific: project issue tracker
- Include: version, steps to reproduce, expected vs actual behavior