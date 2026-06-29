# Standard App (`excalidraw-app`)

The excalidraw.com reference application. Not the WebXDC target, but shares the editor package.

## Entry point

```
excalidraw-app/index.tsx
  → sentry.ts (error tracking)
  → App.tsx (main application)
  → PWA registration (if not WebXDC)
```

## `App.tsx` structure

The app component (~1300 lines) orchestrates:

- Excalidraw editor with full UI
- Collaboration via `<Collab />`
- Local persistence (localStorage + IndexedDB)
- Share dialogs and readonly links
- Command palette
- Library management
- AI / TTD features
- Excalidraw+ integration
- Analytics tracking

### Key imports

- Firebase for collab backend
- Socket.io for realtime
- Sentry for error reporting
- Jotai for app-level state

## App-specific directories

```
excalidraw-app/
├── App.tsx                    # Main app component
├── index.tsx                  # React DOM entry
├── index.html                 # HTML template
├── index.scss                 # App-level styles
├── app-jotai.ts               # Shared Jotai store
├── app_constants.ts           # Timeouts, storage keys, WS events
├── useHandleAppTheme.ts       # Theme persistence
├── sentry.ts                  # Sentry initialization
├── CustomStats.tsx            # Debug stats overlay
├── DesktopOnlyFeatures.tsx    # Desktop-only UI
├── ExcalidrawPlusIframeExport.tsx
├── components/
│   ├── AppMainMenu.tsx        # excalidraw.com menu items
│   ├── AppFooter.tsx
│   ├── AppSidebar.tsx
│   ├── AppWelcomeScreen.tsx
│   ├── AI.tsx                 # AI features
│   ├── DebugCanvas.tsx
│   ├── EncryptedIcon.tsx
│   ├── ExportToExcalidrawPlus.tsx
│   └── TopErrorBoundary.tsx
├── collab/                    # Collaboration layer
├── data/                      # App data layer
├── share/                     # Share dialog + QR codes
└── app-language/              # Language selection
```

## Data layer (`excalidraw-app/data/`)

| File | Purpose |
| --- | --- |
| `index.ts` | Room links, encryption, socket data types |
| `firebase.ts` | Firestore read/write |
| `FileManager.ts` | Image upload to Firebase Storage |
| `localStorage.ts` | Username, preferences |
| `Locker.ts` | Concurrent save locking |
| `LocalData.ts` | IndexedDB scene persistence |
| `TTDStorage.ts` | Text-to-diagram chat history |
| `syncable.ts` | Elements safe for socket sync |
| `tabSync.ts` | Multi-tab browser sync |
| `fileStatusStore.ts` | Image loading status |

## Share features (`excalidraw-app/share/`)

- `ShareDialog.tsx` — collaboration link UI
- `QRCode.tsx` — QR code for room links
- `qrcode.chunk.ts` — lazy-loaded QR library

## Storage keys

From `app_constants.ts`:

| Key | Storage | Content |
| --- | --- | --- |
| `excalidraw` | localStorage | Scene elements |
| `excalidraw-state` | localStorage | App state |
| `excalidraw-collab` | localStorage | Collab preferences |
| `excalidraw-theme` | localStorage | Theme |
| `excalidraw-library` | IndexedDB | Shape library |
| `excalidraw-ttd-chats` | IndexedDB | TTD history |
| `excalidraw-webxdc-settings` | IndexedDB | WebXDC theme (shared key namespace) |

## PWA

Standard build registers a service worker via `vite-plugin-pwa`:

- Precaches app shell
- Runtime caching for fonts, locales, chunks
- Offline support
- Share target for `.excalidraw` files

Disabled in WebXDC (`virtual:pwa-register` stubbed).

## Running locally

```bash
bun run start
# Default port from VITE_APP_PORT (3001 in .env.development)
```

Full collaboration requires:

- Firebase project (configured in `.env.development`)
- WebSocket server at `VITE_APP_WS_SERVER_URL` ([excalidraw-room](https://github.com/excalidraw/excalidraw-room))
- Optional: AI backend, Excalidraw+ endpoints

## Relationship to WebXDC

| Feature | Standard app | WebXDC |
| --- | --- | --- |
| Entry | `index.tsx` → `App.tsx` | `webxdc/index.tsx` → `WebxdcApp.tsx` |
| Collab | `collab/Collab.tsx` | `webxdc/WebxdcCollab.tsx` |
| Persistence | Firebase + localStorage | Yjs + sendUpdate |
| Menu | `AppMainMenu.tsx` | `WebxdcMainMenu.tsx` |
| PWA | Yes | No |
| Analytics | Sentry + tracking | Disabled |