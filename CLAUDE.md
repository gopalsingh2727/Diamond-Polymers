# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**27 Manufacturing** is a desktop manufacturing management system (React + Electron) for managing orders, machines, operators, and analytics across multiple branches with real-time collaboration.

## Commands

```bash
npm run dev          # Start Vite dev server + Electron (HMR enabled)
npm run build        # Full production build: TypeScript + Vite + Electron Builder
npm run build:check  # TypeScript check + Vite + Electron Builder (strict)
npm run lint         # ESLint (must pass with 0 warnings before committing)
npm run make         # Create distributable for current platform
npm run make-mac     # macOS ARM64 build
npm run build:win    # Windows-specific build
npm run preview      # Preview production build (no Electron)
```

Build uses `NODE_OPTIONS=--max-old-space-size=4096` for large TypeScript compilation.

## Architecture

### Layers

1. **Electron** (`/electron/`) — `main.ts` creates the BrowserWindow, handles IPC, auto-updates via `electron-updater`, and a dashboard data cache. `preload.ts` is the secure IPC bridge.
2. **React SPA** — `src/main.tsx` → `src/App.tsx` (Redux Provider + PersistGate) → `MainRount.tsx` (HashRouter, required for Electron).
3. **Redux Store** (`src/store.tsx`) — Redux Thunk + WebSocket middleware. Persists only `orders` and `dataCache` to localStorage. Auth and WebSocket state are blacklisted from persistence.
4. **API/WebSocket** — Axios with automatic primary/fallback server switching on 502/503/504/ECONNREFUSED errors (retries primary every 5 min). WebSocket middleware (`websocketMiddleware.ts`) handles real-time order sync.
5. **Components** — Two parallel directories: `src/componest/` (main app pages — note the typo is intentional/historic) and `src/components/` (shared UI).

### Auth & Route Guard

- Roles: `master_admin` → `admin` → `manager` → `operator`
- JWT stored in Redux (not persisted). Branch selection persisted to localStorage.
- Route guard in `MainRount.tsx` checks: authenticated → token expiry → branch selected (required for admin/master_admin roles).
- Token refreshes on visibility change and window focus events.

### Redux State

**Unified V2** (`src/componest/redux/unifiedV2/`) consolidates ~30 entities (machines, operators, categories, templates, inventory, etc.) into a single reducer with per-entity action files. This is the canonical pattern for new entities.

**Legacy reducers** remain for auth, orders, branches, and admin/manager (gradually migrating to V2).

`rootReducer.tsx` handles two special cross-slice actions: `LOGOUT` (clears all state) and `CLEAR_BRANCH_DATA` (clears branch-scoped state on branch switch).

### Data Caching

`dataCache` reducer caches API responses to reduce calls. It is branch-scoped — clears automatically on branch switch. Cache entries keyed by endpoint + params.

### Key Technologies

- **React 19**, **TypeScript**, **Vite** (with vendor code splitting)
- **Redux** + **Redux Toolkit** + **Redux Persist**
- **React Router DOM v7** (HashRouter)
- **Tailwind CSS** + **Radix UI** (primitives) + **Material-UI** (icons)
- **Recharts** (analytics dashboards)
- **XLSX** + **html2pdf.js** (Excel/PDF export)
- **WebSocket** (`wss://api.27infinity.in/dev`)
- **GraphQL** (read-only orders via `POST /graphql`)
- **Firebase** (file storage)
- **Vosk Browser** (offline speech recognition — desktop only)
- **FFmpeg Static** (video processing — desktop only)

### Environment Variables

Stored in `.env` (not committed). Key vars:
- `VITE_API_27INFINITY_IN` — primary API base URL
- `VITE_WEBSOCKET_URL` — WebSocket endpoint

### Electron Build Targets

- **macOS**: DMG + ZIP (universal x64 + arm64), icon at `build/icon.icns`
- **Windows**: NSIS + ZIP (x64 + ia32), icon at `build/icon.ico`
- Auto-publishes to GitHub releases via `npm run publish`

## Adding a New Entity (Unified V2 Pattern)

1. Create `src/componest/redux/unifiedV2/<entity>Actions.ts` with Axios thunks.
2. Add the entity key to `unifiedV2Reducer.ts`.
3. Export from `src/componest/redux/unifiedV2/index.ts`.
4. Wire the action dispatches through the `dataCache` layer if the entity needs caching.

## Adding a New Route/Page

1. Add the route in `MainRount.tsx` inside the appropriate auth guard.
2. Add menu entry to `src/componest/main/sidebar/indexMenuRoute.tsx`.
3. Role-gate using the permission utilities in `src/utils/`.
