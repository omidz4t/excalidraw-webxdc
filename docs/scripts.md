# Build Scripts

Scripts in `scripts/` and root `package.json`.

## Package builders

### `buildBase.js`

Used by: `common`, `element`, `math`, `fractional-indexing`, `laser-pointer`

- esbuild ESM output
- Separate `dist/dev/` and `dist/prod/` bundles
- Environment variables from `.env.development` / `.env.production`

### `buildPackage.js`

Used by: `packages/excalidraw`

- esbuild + `esbuild-sass-plugin` for SCSS
- Bundles CSS alongside JS
- Handles font subset chunk imports

### `buildUtils.js`

Used by: `packages/utils`

- Similar to buildBase but with utils-specific entry points

### `build-node.js`

Node.js build for server-side test utilities.

### `buildWasm.js`

Builds HarfBuzz WASM for font subsetting.

### `build-version.js`

Post-build for standard app:

1. Runs `git rev-parse --short HEAD` for commit hash
2. Writes `build/version.json` with timestamp + hash
3. Replaces `{version}` placeholder in `build/index.html`

## Root package.json scripts

### Build

| Script | Command chain |
| --- | --- |
| `build` | `excalidraw-app build:app` + `build:version` |
| `build:app` | Standard Vite production build |
| `build:webxdc` | WebXDC Vite build |
| `build:preview` | Build + `vite preview` |
| `build:packages` | All packages in dependency order |
| `build:common` | `@excalidraw/common` |
| `build:element` | `@excalidraw/element` |
| `build:math` | `@excalidraw/math` |
| `build:excalidraw` | `@excalidraw/excalidraw` |
| `build:fractional-indexing` | `@excalidraw/fractional-indexing` |
| `build:laser-pointer` | `@excalidraw/laser-pointer` |
| `build-node` | Node.js utilities |

### Development

| Script | Description |
| --- | --- |
| `start` | `excalidraw-app start` (Vite dev) |
| `start:production` | Build + serve on port 5001 |
| `dev:webxdc` | Multi-peer WebXDC dev |
| `dev:webxdc:vite` | Vite-only WebXDC dev |

### Test & quality

| Script | Description |
| --- | --- |
| `test` | Vitest watch |
| `test:app` | Vitest |
| `test:update` | Vitest with snapshot update |
| `test:all` | Full CI pipeline |
| `test:typecheck` | `tsc` |
| `test:code` | ESLint |
| `test:other` | Prettier check |
| `test:coverage` | Coverage report |
| `test:ui` | Vitest UI |

### Maintenance

| Script | Description |
| --- | --- |
| `fix` | Prettier write + ESLint fix |
| `rm:build` | Delete all build artifacts |
| `rm:node_modules` | Delete all node_modules |
| `clean-install` | rm node_modules + reinstall |
| `prettier` | Run prettier on md/css/json/html |

## Makefile targets

See [Development](./development.md). Wraps bun commands with port management via `fuser`.

### Version bump

```makefile
build-webxdc:
    sed -i 's/^version = .*/version = "$(WEBXDC_VERSION)"/' manifest.toml
```

## WOFF2 plugins

`scripts/woff2/woff2-vite-plugins` — browser-compatible WOFF2 handling in Vite builds.

## Package build order

```
1. @excalidraw/common
2. @excalidraw/fractional-indexing
3. @excalidraw/laser-pointer
4. @excalidraw/math
5. @excalidraw/element
6. @excalidraw/excalidraw
```

`@excalidraw/utils` builds independently.

Each package's `build:esm` runs:

```bash
rimraf dist && node ../../scripts/build*.js && bun run gen:types
```

`gen:types` runs `tsc` to emit TypeScript declarations to `dist/types/`.