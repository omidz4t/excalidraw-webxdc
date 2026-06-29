# UI Components

Reference for major React components in `packages/excalidraw/components/`.

## Core

| Component | File | Purpose |
| --- | --- | --- |
| `App` | `App.tsx` | Main editor — canvas, events, state |
| `LayerUI` | `LayerUI.tsx` | Toolbars, properties panel, menus |
| `InitializeApp` | `InitializeApp.tsx` | Font loading, initialization |
| `Actions` | `Actions.tsx` | Action button rendering |

## Toolbars & tools

| Component | Purpose |
| --- | --- |
| `shapes.tsx` | Shape tool buttons |
| `HandButton` | Pan/hand tool |
| `PenModeButton` | Drawing mode toggle |
| `LaserPointerButton` | Laser pointer tool |
| `LockButton` | Element lock toggle |
| `MobileToolBar` | Mobile tool strip |
| `MobileMenu` | Mobile hamburger menu |
| `ToolButton` / `ToolPopover` | Generic tool UI |

## Menus

| Component | Purpose |
| --- | --- |
| `MainMenu` | Hamburger menu container + items |
| `ContextMenu` | Right-click context menu |
| `SearchMenu` | Element search (Cmd+F) |
| `QuickSearch` | Quick search input |

## Dialogs

| Component | Purpose |
| --- | --- |
| `Dialog` / `Modal` | Base dialog components |
| `ConfirmDialog` | Yes/no confirmation |
| `ErrorDialog` | Error display |
| `HelpDialog` | Help content |
| `ImageExportDialog` | PNG/SVG export |
| `JSONExportDialog` | JSON export |
| `ShareableLinkDialog` | Collaboration link |
| `PasteChartDialog` | Chart data paste |
| `PublishLibrary` | Publish shape library |
| `ElementLinkDialog` | Element hyperlink |
| `OverwriteConfirmDialog` | Save conflict (in App/) |

## Properties & styling

| Component | Purpose |
| --- | --- |
| `ColorPicker/` | Stroke/fill color picker |
| `FontPicker/` | Font family selection |
| `IconPicker` | Icon selection |
| `PropertiesPopover` | Element properties panel |
| `ConvertElementTypePopup` | Change element type |
| `DarkModeToggle` | Theme toggle |
| `EyeDropper` | Color picker from canvas |

## Panels & sidebars

| Component | Purpose |
| --- | --- |
| `Sidebar/` | Collapsible side panel system |
| `DefaultSidebar` | Default sidebar tabs |
| `LibraryMenu` | Shape library browser |
| `LibraryMenuItems` | Library item grid |
| `Stats/` | Canvas statistics |
| `HintViewer` | Contextual hints |

## Collaboration UI

| Component | Purpose |
| --- | --- |
| `UserList` | Active collaborators list |
| `Avatar` | User avatar circle |
| `LiveCollaborationTrigger` | Start collab button |
| `LaserPointerButton` | Laser pointer for presentations |

## Layout

| Component | Purpose |
| --- | --- |
| `FixedSideContainer` | Fixed-position panels |
| `Island` | Floating UI island |
| `Footer` / `footer/` | Bottom bar |
| `WelcomeScreen` | Empty canvas onboarding |
| `Section` | UI section grouping |
| `Stack` | Vertical/horizontal stack |
| `Card` | Card container |

## Input

| Component | Purpose |
| --- | --- |
| `TextField` | Text input |
| `Button` / `FilledButton` | Buttons |
| `CheckboxItem` | Checkbox menu item |
| `RadioGroup` / `RadioSelection` | Radio buttons |
| `Switch` | Toggle switch |
| `Range` | Slider input |

## Special features

| Component | Purpose |
| --- | --- |
| `CommandPalette/` | Cmd+K command palette |
| `TTDDialog/` | Text-to-diagram AI |
| `DiagramToCodePlugin/` | Diagram → code export |
| `SVGLayer` | SVG overlay layer |
| `ElementCanvasButtons` | On-canvas element buttons |
| `UnlockPopup` | Unlock locked elements |
| `MagicButton` | Magic frame AI |
| `Toast` | Toast notifications |
| `LoadingMessage` | Loading indicator |
| `Spinner` | Loading spinner |
| `TopErrorBoundary` | Error boundary (app-level) |

## Composable slots

Host apps compose these as children of `<Excalidraw>`:

```tsx
<Excalidraw>
  <MainMenu>...</MainMenu>
  <WelcomeScreen>...</WelcomeScreen>
  <Footer>...</Footer>
  <Sidebar>...</Sidebar>
</Excalidraw>
```

WebXDC uses only `<MainMenu>` (via `WebxdcMainMenu`).

## Styling

Components use SCSS co-located with components (e.g. `Dialog.scss`, `Toolbar.scss`). Global editor styles in `packages/excalidraw/css/`.

App-level styles in `excalidraw-app/index.scss`.