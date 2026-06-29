# CLAUDE.md

## Project Structure

Excalidraw is a **monorepo** with a clear separation between the core library and the application:

- **`packages/excalidraw/`** - Main React component library published to npm as `@excalidraw/excalidraw`
- **`excalidraw-app/`** - WebXDC app (`excalidraw-app/webxdc/`) and shared app shell
- **`packages/`** - Core packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`

## Development Workflow

1. **Package Development**: Work in `packages/*` for editor features
2. **App Development**: Work in `excalidraw-app/` for app-specific features
3. **Testing**: Always run `bun run test:update` before committing
4. **Type Safety**: Use `bun run test:typecheck` to verify TypeScript

## Development Commands

```bash
bun run test:typecheck  # TypeScript type checking
bun run test:update     # Run all tests (with snapshot updates)
bun run fix             # Auto-fix formatting and linting issues
```

## Architecture Notes

### Package System

- Uses Bun workspaces for monorepo management
- Internal packages use path aliases (see `vitest.config.mts`)
- Build system uses esbuild for packages, Vite for the app
- TypeScript throughout with strict configuration