# API Reference

Public API exported from `@excalidraw/excalidraw` (`packages/excalidraw/index.tsx`).

## Components

### `<Excalidraw />`

Main editor component. Must be inside a container with explicit height.

```tsx
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

<div style={{ height: "100vh" }}>
  <Excalidraw
    initialData={null}
    isCollaborating={false}
    onChange={(elements, appState, files) => {}}
  />
</div>
```

### Key props (`ExcalidrawProps`)

| Prop | Type | Description |
| --- | --- | --- |
| `initialData` | `ExcalidrawInitialDataState \| Promise \| fn` | Starting scene |
| `onChange` | `(elements, appState, files) => void` | Scene change callback |
| `onPointerUpdate` | `PointerUpdateHandler` | Pointer position (collab) |
| `isCollaborating` | `boolean` | Show collaborator UI |
| `theme` | `"light" \| "dark"` | Color theme |
| `onThemeChange` | `(theme) => void` | Theme change callback |
| `langCode` | `string` | Language code (e.g. `"en"`) |
| `viewModeEnabled` | `boolean` | Read-only mode |
| `zenModeEnabled` | `boolean` | Hide UI chrome |
| `gridModeEnabled` | `boolean` | Show grid |
| `UIOptions` | `Partial<UIOptions>` | Toggle UI features |
| `renderTopLeftUI` | `RenderFn` | Custom top-left slot |
| `renderTopRightUI` | `RenderFn` | Custom top-right slot |
| `onPaste` | `PasteHandler` | Intercept paste |
| `onDuplicate` | `DuplicateHandler` | Intercept duplication |
| `handleKeyboardGlobally` | `boolean` | Capture keyboard outside canvas |
| `autoFocus` | `boolean` | Focus canvas on mount |
| `detectScroll` | `boolean` | Browser scroll detection |
| `children` | `ReactNode` | Slot components (menu, collab, etc.) |

WebXDC sets: `isCollaborating={true}`, `langCode="en"`, `detectScroll={false}`, `handleKeyboardGlobally={true}`, `autoFocus={true}`.

### Slot components

| Component | Purpose |
| --- | --- |
| `<MainMenu>` | Hamburger menu items |
| `<WelcomeScreen>` | Empty canvas onboarding |
| `<Footer>` | Bottom bar |
| `<Sidebar>` | Side panels |
| `<LiveCollaborationTrigger>` | Start collaboration button |

### `<ExcalidrawAPIProvider>` / `useExcalidrawAPI()`

Provides imperative API via context:

```tsx
<ExcalidrawAPIProvider>
  <MyComponent />  {/* useExcalidrawAPI() inside */}
</ExcalidrawAPIProvider>
```

## Imperative API (`ExcalidrawImperativeAPI`)

### Scene manipulation

| Method | Description |
| --- | --- |
| `updateScene({ elements, appState, files, captureUpdate })` | Replace/update scene |
| `applyDeltas(deltas)` | Apply incremental changes |
| `mutateElement(id, updates)` | Update single element |
| `resetScene()` | Clear canvas |
| `getSceneElements()` | Non-deleted elements |
| `getSceneElementsIncludingDeleted()` | All elements |
| `getSceneElementsMapIncludingDeleted()` | Id → element map |
| `getAppState()` | Current app state |
| `getFiles()` | Binary files map |
| `addFiles(data)` | Add image files |
| `scrollToContent()` | Center viewport on content |

### Tools & UI

| Method | Description |
| --- | --- |
| `setActiveTool(tool)` | Switch active tool |
| `setCursor(cursor)` | Custom cursor |
| `resetCursor()` | Default cursor |
| `setToast({ message, closable })` | Show toast |
| `toggleSidebar(opts)` | Open/close sidebar |
| `updateLibrary(opts)` | Shape library |
| `registerAction(action)` | Custom action |
| `refresh()` | Force re-render |
| `getName()` / scene name | Project name |

### Event subscriptions

| Method | Returns |
| --- | --- |
| `onChange(callback)` | Unsubscribe fn |
| `onPointerDown(callback)` | Unsubscribe fn |
| `onPointerUp(callback)` | Unsubscribe fn |
| `onScrollChange(callback)` | Unsubscribe fn |
| `onUserFollow(callback)` | Unsubscribe fn |
| `onStateChange(callback)` | Unsubscribe fn |
| `onEvent(callback)` | Unsubscribe fn |
| `onIncrement(callback)` | Unsubscribe fn |

### History

```ts
excalidrawAPI.history.clear();  // Reset undo stack
```

## Export functions

```ts
import {
  exportToCanvas,
  exportToBlob,
  exportToSvg,
  exportToClipboard,
} from "@excalidraw/excalidraw";
```

Re-exported from `@excalidraw/utils/export`.

## Serialization

```ts
import {
  serializeAsJSON,
  serializeLibraryAsJSON,
  loadFromBlob,
  loadSceneOrLibraryFromBlob,
  restoreElements,
  restoreAppState,
  reconcileElements,
} from "@excalidraw/excalidraw";
```

## Element utilities

```ts
import {
  mutateElement,
  newElementWith,
  bumpVersion,
  getSceneVersion,
  getCommonBounds,
  getVisibleSceneBounds,
  convertToExcalidrawElements,
  isLinearElement,
  isElementLink,
} from "@excalidraw/excalidraw";
```

## Constants

```ts
import {
  FONT_FAMILY,
  THEME,
  MIME_TYPES,
  ROUNDNESS,
  CaptureUpdateAction,
  throttleRAF,
} from "@excalidraw/excalidraw";
```

## Hooks

| Hook | Description |
| --- | --- |
| `useExcalidrawAPI()` | Imperative API from context |
| `useExcalidrawStateValue(prop)` | Subscribe to app state field |
| `useOnExcalidrawStateChange(callback)` | App state changes |
| `useEditorInterface()` | Tool/style interface state |
| `useI18n()` | Translation function |
| `useHandleLibrary()` | Library URL handling |

## Type imports

Use `import type` from subpaths:

```ts
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";
```

See [packages/excalidraw/README.md](../packages/excalidraw/README.md) for 0.18.x migration table.