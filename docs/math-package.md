# Math Package (`@excalidraw/math`)

2D geometry primitives. Entry: `packages/math/src/index.ts`.

## Modules

| File | Purpose |
| --- | --- |
| `types.ts` | `GlobalPoint`, `LocalPoint`, `Vector`, geometric types |
| `point.ts` | Point creation, distance, rotation, translation |
| `vector.ts` | Vector math — dot, cross, normalize, scale |
| `line.ts` | Line segments, intersections |
| `segment.ts` | Line segment operations |
| `curve.ts` | Bezier/cubic curve math |
| `ellipse.ts` | Ellipse intersection, containment |
| `rectangle.ts` | Rectangle operations |
| `triangle.ts` | Triangle math |
| `polygon.ts` | Polygon operations |
| `angle.ts` | Angle calculations, normalization |
| `range.ts` | Numeric range utilities |
| `constants.ts` | Math constants (PI, precision thresholds) |
| `utils.ts` | Shared math helpers |

## Usage in the codebase

| Consumer | Use case |
| --- | --- |
| `@excalidraw/element` | Hit testing, arrow routing, resize |
| `packages/excalidraw` | Snapping guides, gesture handling |
| `@excalidraw/laser-pointer` | Path smoothing geometry |

## Tests (`packages/math/tests/`)

| File | Covers |
| --- | --- |
| `point.test.ts` | Point operations |
| `vector.test.ts` | Vector math |
| `line.test.ts` | Line intersections |
| `segment.test.ts` | Segments |
| `curve.test.ts` | Curves |
| `ellipse.test.ts` | Ellipses |
| `range.test.ts` | Ranges |

## Dependency

Only depends on `@excalidraw/common` (for utility types and constants).