# Element Package Modules

Complete reference for `packages/element/src/` — every module and its responsibility.

## Core types

| File | Purpose |
| --- | --- |
| `types.ts` | All element type definitions, `ExcalidrawElement`, bindings, frames |
| `typeChecks.ts` | Type guard functions (`isTextElement`, `isImageElement`, etc.) |
| `index.ts` | Public exports, `getSceneVersion`, `hashElementsVersion` |

## Creation & mutation

| File | Purpose |
| --- | --- |
| `newElement.ts` | Factory functions for all element types |
| `mutateElement.ts` | `mutateElement()`, `newElementWith()`, `bumpVersion()` |
| `duplicate.ts` | Element duplication with new IDs |
| `delta.ts` | `ElementsDelta`, `AppStateDelta` — incremental change tracking |
| `store.ts` | `Store` class, `CaptureUpdateAction`, snapshot management |

## Geometry & layout

| File | Purpose |
| --- | --- |
| `bounds.ts` | Bounding boxes, `getCommonBounds()`, `getVisibleSceneBounds()` |
| `shape.ts` | Shape-specific geometry helpers |
| `collision.ts` | Hit testing, intersection detection |
| `distance.ts` | Distance calculations between elements/points |
| `sizeHelpers.ts` | Size constraint helpers |
| `textMeasurements.ts` | Text width/height measurement |
| `textWrapping.ts` | Text line wrapping logic |
| `containerCache.ts` | Cached text container dimensions |

## Manipulation

| File | Purpose |
| --- | --- |
| `selection.ts` | Selection logic, multi-select, lasso |
| `resizeElements.ts` | Resize single and multiple elements |
| `resizeTest.ts` | Resize handle hit testing |
| `dragElements.ts` | Drag/move elements |
| `transformHandles.ts` | Transform handle positions |
| `transform.ts` | `ExcalidrawElementSkeleton`, SVG import transform |
| `align.ts` | Alignment operations |
| `distribute.ts` | Even distribution |
| `sortElements.ts` | Element sorting |
| `zindex.ts` | Z-order operations |
| `positionElementsOnGrid.ts` | Grid placement |
| `cropElement.ts` | Image cropping |
| `groups.ts` | Element grouping |
| `frame.ts` | Frame creation and hierarchy |
| `flowchart.ts` | Flowchart auto-layout |
| `heading.ts` | Frame heading detection |

## Arrows & binding

| File | Purpose |
| --- | --- |
| `binding.ts` | Arrow endpoint binding to elements |
| `elbowArrow.ts` | Elbow/routed arrow geometry |
| `linearElementEditor.ts` | Polyline and arrow point editing |
| `arrowheads.ts` | Arrowhead rendering |

## Rendering

| File | Purpose |
| --- | --- |
| `renderElement.ts` | Canvas draw dispatch per element type |
| `image.ts` | Image element status and rendering helpers |
| `textElement.ts` | Text element helpers |

## Ordering

| File | Purpose |
| --- | --- |
| `fractionalIndex.ts` | Fractional index validation, ordering, repair |

## Utilities

| File | Purpose |
| --- | --- |
| `comparisons.ts` | Element equality comparisons |
| `utils.ts` | Miscellaneous element utilities |
| `elementLink.ts` | Hyperlink elements |
| `embeddable.ts` | Embeddable element logic |
| `showSelectedShapeActions.ts` | Context actions for selected shapes |
| `visualdebug.ts` | Debug rendering overlays |
| `Scene.ts` | Scene container class |

## Tests (`packages/element/tests/`)

| Test file | Covers |
| --- | --- |
| `binding.test.tsx` | Arrow binding |
| `elbowArrow.test.tsx` | Elbow arrows |
| `linearElementEditor.test.tsx` | Line/arrow editing |
| `collision.test.tsx` | Hit testing |
| `resize.test.tsx` | Resize operations |
| `selection.test.ts` | Selection |
| `align.test.tsx` | Alignment |
| `distribute.test.tsx` | Distribution |
| `duplicate.test.tsx` | Duplication |
| `frame.test.tsx` | Frames |
| `flowchart.test.tsx` | Flowcharts |
| `fractionalIndex.test.ts` | Ordering |
| `zindex.test.tsx` | Z-order |
| `textElement.test.ts` | Text |
| `textWrapping.test.ts` | Text wrapping |
| `cropElement.test.tsx` | Image crop |
| `delta.test.tsx` | Store deltas |
| `bounds.test.ts` | Bounding boxes |
| `typeChecks.test.ts` | Type guards |
| `sizeHelpers.test.ts` | Size helpers |
| `embeddable.test.ts` | Embeddables |
| `sortElements.test.ts` | Sorting |