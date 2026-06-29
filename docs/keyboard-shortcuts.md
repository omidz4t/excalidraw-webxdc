# Keyboard Shortcuts

Shortcuts are defined in `packages/excalidraw/actions/shortcuts.ts` and tool keys in `packages/excalidraw/components/shapes.tsx`. Display uses `getShortcutKey()` from `packages/excalidraw/shortcut.ts` (platform-aware: Cmd on macOS, Ctrl elsewhere).

## Tools (shape toolbar)

From `SHAPES` in `components/shapes.tsx`:

| Tool | Letter key | Number key |
| --- | --- | --- |
| Hand (pan) | `H` | — |
| Selection / Lasso | `V` | `1` |
| Rectangle | `R` | `2` |
| Diamond | `D` | `3` |
| Ellipse | `O` | `4` |
| Arrow | `A` | `5` |
| Line | `L` | `6` |
| Freedraw | `P` or `X` | `7` |
| Text | `T` | `8` |
| Image | — | `9` |
| Eraser | `E` | `0` |
| Laser pointer | `K` | — |

Pressing `A` repeatedly while arrow tool is active cycles arrow type: sharp → round → elbow.

When lasso is the preferred selection tool, `V`/`1` activates lasso instead of rectangle selection.

## General shortcuts

From `actions/shortcuts.ts`:

| Action | Shortcut |
| --- | --- |
| Undo | `Ctrl/Cmd+Z` |
| Redo | `Ctrl/Cmd+Shift+Z` |
| Save scene | `Ctrl/Cmd+S` |
| Open scene | `Ctrl/Cmd+O` |
| Clear canvas | `Ctrl/Cmd+Delete` |
| Export image | `Ctrl/Cmd+Shift+E` |
| Command palette | `Ctrl/Cmd+/` or `Ctrl/Cmd+Shift+P` |
| Search menu | `Ctrl/Cmd+F` |
| Cut | `Ctrl/Cmd+X` |
| Copy | `Ctrl/Cmd+C` |
| Paste | `Ctrl/Cmd+V` |
| Copy styles | `Ctrl/Cmd+Alt+C` |
| Paste styles | `Ctrl/Cmd+Alt+V` |
| Select all | `Ctrl/Cmd+A` |
| Delete | `Delete` |
| Duplicate | `Ctrl/Cmd+D` or `Alt+drag` |
| Send backward | `Ctrl/Cmd+[` |
| Bring forward | `Ctrl/Cmd+]` |
| Send to back | `Ctrl/Cmd+Shift+[` (Win) / `Ctrl/Cmd+Alt+[` (Mac) |
| Bring to front | `Ctrl/Cmd+Shift+]` (Win) / `Ctrl/Cmd+Alt+]` (Mac) |
| Copy as PNG | `Shift+Alt+C` |
| Group | `Ctrl/Cmd+G` |
| Ungroup | `Ctrl/Cmd+Shift+G` |
| Toggle grid | `Ctrl/Cmd+'` |
| Zen mode | `Alt+Z` |
| Object snap | `Alt+S` |
| Stats | `Alt+/` |
| Flip horizontal | `Shift+H` |
| Flip vertical | `Shift+V` |
| View mode | `Alt+R` |
| Hyperlink | `Ctrl/Cmd+K` |
| Lock element | `Ctrl/Cmd+Shift+L` |
| Reset zoom | `Ctrl/Cmd+0` |
| Zoom out | `Ctrl/Cmd+-` |
| Zoom in | `Ctrl/Cmd++` |
| Zoom to fit all | `Shift+1` |
| Zoom to selection in viewport | `Shift+2` |
| Zoom to selection | `Shift+3` |
| Eraser tool | `E` |
| Hand tool | `H` |
| Frame tool | `F` |
| Toggle theme | `Shift+Alt+D` |
| Tool lock | `Q` |
| Keyboard shortcuts help | `?` |

## Arrow keys

When elements are selected:

- `Arrow keys` — nudge selection by 1px
- `Shift+Arrow` — nudge by 10px

## WebXDC notes

- `handleKeyboardGlobally={true}` in WebXDC captures keys even when focus is outside the canvas
- Paste for images uses a capture-phase listener (`installWebxdcPasteFix`) — see [Paste & Clipboard](./paste-clipboard.md)
- Some shortcuts open stubbed dialogs in WebXDC (export, stats) — they have no effect