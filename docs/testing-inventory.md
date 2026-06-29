# Testing Inventory

Complete list of test files in the repository (~100 test files).

## excalidraw-app (3 tests)

| File | Covers |
| --- | --- |
| `tests/LanguageList.test.tsx` | Language picker |
| `tests/MobileMenu.test.tsx` | Mobile menu UI |
| `tests/collab.test.tsx` | Collaboration component |

## packages/element (22 tests)

| File | Covers |
| --- | --- |
| `tests/binding.test.tsx` | Arrow binding |
| `tests/elbowArrow.test.tsx` | Elbow arrows |
| `tests/linearElementEditor.test.tsx` | Line/arrow editing |
| `tests/collision.test.tsx` | Hit testing |
| `tests/resize.test.tsx` | Resize |
| `tests/selection.test.ts` | Selection |
| `tests/align.test.tsx` | Alignment |
| `tests/distribute.test.tsx` | Distribution |
| `tests/duplicate.test.tsx` | Duplication |
| `tests/frame.test.tsx` | Frames |
| `tests/flowchart.test.tsx` | Flowcharts |
| `tests/fractionalIndex.test.ts` | Ordering |
| `tests/zindex.test.tsx` | Z-order |
| `tests/textElement.test.ts` | Text |
| `tests/textWrapping.test.ts` | Text wrapping |
| `tests/cropElement.test.tsx` | Image crop |
| `tests/delta.test.tsx` | Store deltas |
| `tests/bounds.test.ts` | Bounds |
| `tests/typeChecks.test.ts` | Type guards |
| `tests/sizeHelpers.test.ts` | Size helpers |
| `tests/embeddable.test.ts` | Embeddables |
| `tests/sortElements.test.ts` | Sorting |
| `src/__tests__/transform.test.ts` | Element skeleton transform |

## packages/excalidraw (~50 tests)

### Core

| File | Covers |
| --- | --- |
| `tests/App.test.tsx` | Main app component |
| `tests/excalidraw.test.tsx` | Excalidraw component |
| `tests/appState.test.tsx` | App state |
| `tests/appStateHooks.test.tsx` | State hooks |
| `tests/history.test.tsx` | Undo/redo |
| `tests/selection.test.tsx` | Selection behavior |
| `tests/contextmenu.test.tsx` | Context menu |

### Tools & interaction

| File | Covers |
| --- | --- |
| `tests/tool.test.tsx` | Tool switching |
| `tests/dragCreate.test.tsx` | Drag to create |
| `tests/multiPointCreate.test.tsx` | Multi-point lines |
| `tests/move.test.tsx` | Move elements |
| `tests/rotate.test.tsx` | Rotation |
| `tests/flip.test.tsx` | Flip |
| `tests/lasso.test.tsx` | Lasso selection |
| `tests/freedrawMode.test.tsx` | Freedraw |
| `tests/laser.test.tsx` | Laser pointer |
| `tests/elementLocking.test.tsx` | Element lock |
| `tests/convertElementType.test.tsx` | Type conversion |

### Data & export

| File | Covers |
| --- | --- |
| `tests/data/reconcile.test.ts` | Element reconciliation |
| `tests/data/restore.test.ts` | Scene restoration |
| `tests/export.test.tsx` | Export functions |
| `tests/scene/export.test.ts` | Scene export |
| `tests/image.test.tsx` | Image elements |
| `data/library.test.ts` | Shape library |

### Features

| File | Covers |
| --- | --- |
| `tests/search.test.tsx` | Search menu |
| `tests/scroll.test.tsx` | Scroll/zoom |
| `tests/fitToContent.test.tsx` | Zoom to fit |
| `tests/library.test.tsx` | Library UI |
| `tests/charts.test.tsx` | Charts |
| `charts.test.ts` | Chart parsing |
| `tests/MermaidToExcalidraw.test.tsx` | Mermaid import |
| `tests/arrowBinding.test.tsx` | Arrow binding |
| `mermaid.test.ts` | Mermaid parsing |
| `clipboard.test.ts` | Clipboard |
| `tests/animation.test.ts` | Animation |
| `tests/colorInput.test.ts` | Color input |
| `tests/clients.test.ts` | Client state |
| `tests/regressionTests.test.tsx` | Regression suite |

### Actions

| File | Covers |
| --- | --- |
| `actions/actionDeleteSelected.test.tsx` | Delete |
| `actions/actionDuplicateSelection.test.tsx` | Duplicate |
| `actions/actionFlip.test.tsx` | Flip |
| `actions/actionElementLock.test.tsx` | Lock |
| `actions/actionProperties.test.tsx` | Properties |
| `actions/actionStyles.test.tsx` | Copy/paste styles |

### Components

| File | Covers |
| --- | --- |
| `components/Trans.test.tsx` | Translation component |
| `components/DefaultSidebar.test.tsx` | Sidebar |
| `components/Sidebar/Sidebar.test.tsx` | Sidebar tabs |
| `components/FontPicker/FontPicker.test.tsx` | Font picker |
| `components/Stats/stats.test.tsx` | Stats panel |
| `components/dropdownMenu/DropdownMenu.test.tsx` | Dropdown |
| `components/hoc/withInternalFallback.test.tsx` | HOC fallback |
| `components/TTDDialog/*.test.ts` | Text-to-diagram |

## packages/common (6 tests)

| File | Covers |
| --- | --- |
| `src/utils.test.ts` | Utils |
| `src/colors.test.ts` | Colors |
| `src/appEventBus.test.ts` | Event bus |
| `tests/queue.test.ts` | Queue |
| `tests/binary-heap.test.ts` | Heap |
| `tests/keys.test.ts` | Keys |
| `tests/url.test.tsx` | URL |

## packages/math (7 tests)

`point`, `vector`, `line`, `segment`, `curve`, `ellipse`, `range`

## packages/utils (4 tests)

`export`, `geometry`, `utils.unmocked`

## Running specific tests

```bash
# Single file
bun run test -- packages/element/tests/binding.test.tsx

# Pattern
bun run test -- --testNamePattern="arrow"

# With UI
bun run test:ui
```

## WebXDC-specific testing

No dedicated WebXDC unit tests exist yet. WebXDC collab is tested manually via:

1. `make run-sim` — multi-peer drawing sync
2. Delta Chat — attach `.xdc` and test with real peers

Recommended manual test matrix:

| Test | Command |
| --- | --- |
| Single-user boot | `make run` |
| Multi-peer sync | `make run-sim` |
| Image import | Menu → Insert image |
| Image paste | Ctrl+V image in WebView |
| Theme toggle | Menu → Preferences → Theme |
| Follow mode | Click collaborator → follow |
| History replay | Close and reopen attachment |