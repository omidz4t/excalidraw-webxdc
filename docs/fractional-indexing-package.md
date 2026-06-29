# Fractional Indexing Package

`@excalidraw/fractional-indexing` — vendored implementation of fractional indexing for stable element ordering.

## Source

Based on [fractional-indexing](https://www.npmjs.com/package/fractional-indexing) (CC0 license). Observable notebook: [Implementing Fractional Indexing](https://observablehq.com/@dgreensp/implementing-fractional-indexing).

Location: `packages/fractional-indexing/src/index.ts`

## Purpose

Elements need a stable ordering that supports concurrent insertions without renumbering all items. Fractional indices are strings that can always have a new value generated between any two existing values.

## API

| Function | Purpose |
| --- | --- |
| `generateKeyBetween(a, b)` | Generate index between two indices |
| `generateNKeysBetween(a, b, n)` | Generate N indices between two indices |
| `generateKey()` | Generate index after all existing |

### Example

```ts
generateKeyBetween("a0", "a1")  // → "a0V" (something between)
generateKeyBetween(null, "a0")  // → index before "a0"
generateKeyBetween("a1", null)  // → index after "a1"
```

Uses base-62 digits: `0-9A-Za-z`

## Usage in codebase

| Consumer | Usage |
| --- | --- |
| `@excalidraw/element` | `fractionalIndex.ts` — validation, repair, ordering |
| `webxdc/y-excalidraw/diff.ts` | Compute append/move positions during sync |
| `data/reconcile.ts` | `orderByFractionalIndex()` after merge |

## Element ordering

Each element has an `index` field (type `FractionalIndex` = branded string):

```ts
type OrderedExcalidrawElement = ExcalidrawElement & {
  index: FractionalIndex;
};
```

Array position is derived from fractional index sort order, not array index.

## Validation

`validateFractionalIndices()` — checks ordering in dev/test.

`syncInvalidIndices()` — repairs broken indices after concurrent edits.

## Tests

`packages/element/tests/fractionalIndex.test.ts`