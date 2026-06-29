# Testing

## Test runner

**Vitest** 3.x with jsdom environment and global test APIs.

Configuration: `vitest.config.mts`  
Setup: `setupTests.ts`

## Running tests

```bash
bun run test              # Watch mode
bun run test:update       # Run once, update snapshots
bun run test:all          # Full CI suite
bun run test:coverage     # With coverage report
bun run test:ui           # Vitest UI + coverage
```

### CI-equivalent full check

```bash
bun run test:all
# = test:typecheck + test:code + test:other + test:app --watch=false
```

## Type checking

```bash
bun run test:typecheck    # tsc --noEmit
```

Uses root `tsconfig.json` with strict mode. Includes `packages/` and `excalidraw-app/`.

## Linting

```bash
bun run test:code         # ESLint (max-warnings=0)
bun run fix:code          # ESLint --fix
```

ESLint config extends `@excalidraw/eslint-config`. Scans `.js`, `.ts`, `.tsx` across the repo.

## Formatting

```bash
bun run test:other        # Prettier --list-different
bun run fix:other         # Prettier --write
bun run fix               # fix:other + fix:code
```

Prettier config: `@excalidraw/prettier-config`  
Scanned extensions: `css`, `scss`, `json`, `md`, `html`, `yml`

## Test locations

Tests are co-located with source:

```
packages/element/tests/          # Element geometry, binding, etc.
packages/excalidraw/tests/       # Editor component tests
packages/math/tests/             # Math primitives
excalidraw-app/tests/            # App shell tests
```

### Example app tests

- `LanguageList.test.tsx`
- `MobileMenu.test.tsx`
- `collab.test.tsx`

### Snapshot tests

Some tests use Vitest snapshots (e.g. `MobileMenu.test.tsx.snap`). Update with:

```bash
bun run test:update
```

## Vitest configuration

Key settings from `vitest.config.mts`:

| Setting | Value |
| --- | --- |
| Environment | jsdom |
| Globals | true (`describe`, `it`, `expect`) |
| Setup files | `setupTests.ts` |
| Hook sequence | parallel |
| Hide skipped | true |

### Path aliases

Same `@excalidraw/*` aliases as Vite/tsconfig — tests import package source directly.

### Coverage thresholds

| Metric | Threshold |
| --- | --- |
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

Reporters: text, json-summary, json, html, lcovonly

## setupTests.ts

The setup file configures the test environment (canvas mocks, DOM polyfills, etc.). Vitest uses `vitest-canvas-mock` for canvas API support.

## Writing tests

### Element package example

```ts
import { describe, it, expect } from "vitest";
import { /* function under test */ } from "../src/...";
```

### React component example

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
```

Testing Library packages:
- `@testing-library/react` 16.x
- `@testing-library/dom` 10.x
- `@testing-library/jest-dom` 6.x

## Pre-commit workflow

The Husky pre-commit hook was removed from this fork. Run manually before committing:

```bash
bun run test:typecheck
bun run test:update
bun run fix
```

## Debugging test failures

```bash
# Run a single test file
bun run test -- packages/element/tests/binding.test.tsx

# Run with verbose output
bun run test -- --reporter=verbose --watch=false

# UI mode for interactive debugging
bun run test:ui
```