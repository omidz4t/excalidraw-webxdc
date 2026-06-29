# Laser Pointer Package

`@excalidraw/laser-pointer` — smooth laser pointer trails for presentations and collaboration.

## Modules

| File | Purpose |
| --- | --- |
| `index.ts` | Public API exports |
| `state.ts` | Pointer state machine (down/up/move) |
| `simplify.ts` | Path simplification for trail rendering |
| `math.ts` | Point/vector math for trail curves |

## Usage

### In editor

- Laser tool (`K` key) activates laser pointer mode
- `packages/excalidraw/animatedTrail.ts` renders the trail on canvas
- Trail fades over time

### In collaboration

Remote laser positions received via collab layer:

- Standard app: socket.io `MOUSE_LOCATION` with `tool: "laser"`
- WebXDC: realtime `pos` message with `tl: "laser"`

### In exports

`@excalidraw/utils` uses laser-pointer for rendering laser trails in exported images.

## API (from `state.ts`)

The state machine tracks:
- Current pointer position
- Whether pointer is down
- Trail point history
- Simplified path for rendering

## Dependencies

Standalone package — no internal `@excalidraw/*` dependencies.

## Tests

`packages/excalidraw/tests/laser.test.tsx` — integration test with editor.