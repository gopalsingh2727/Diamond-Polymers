# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**27 Manufacturing** - Electron desktop application for manufacturing management.

**Stack:** React 19 + TypeScript + Vite + Electron 30 + Redux Toolkit + Tailwind CSS + Radix UI

**Backend API:** `https://api.27infinity.in`

## Commands

```bash
# Development
npm run dev                    # Start dev server (Vite + Electron)

# Building
npm run build                  # Build for production
npm run build:win              # Build Windows installer
npm run make-mac               # Build macOS installer (arm64)
npm run build:check            # TypeScript check + build

# Quality
npm run lint                   # ESLint check
```

## Architecture

### State Management (Redux)

The app uses a unified reducer pattern in `src/componest/redux/`:

```
rootReducer.tsx                 # Main reducer combining all slices
├── v2 (unifiedV2Reducer)       # All entity CRUD operations via factory pattern
├── auth                        # Login/logout/token management
├── orders                      # Order management
├── orderFormData               # Cached form dropdown data
├── machineTemplate             # Template configuration
├── dataCache                   # Universal data cache
└── websocket                   # Real-time updates
```

**Unified V2 System:** All CRUD entities use `src/componest/redux/unifiedV2/` with a factory-based reducer pattern. Actions follow `{ENTITY}_V2_{OPERATION}_{STATUS}` naming.

**V2 Entities:** account, customerCategory, parentCompany, machineType, machine, step, operator, deviceAccess, category, optionType, optionSpec, option, orderType, printType, excelExportType, reportType, template

**V2 State Access:**
```typescript
const { list, loading, error } = useSelector((state: RootState) => state.v2.account);
const { list: machines } = useSelector((state: RootState) => state.v2.machine);
```

### Key Patterns

**API Calls:** Use `crudAPI` from `src/utils/crudHelpers.ts`:
```typescript
import { crudAPI } from '@/utils/crudHelpers';
await crudAPI.create('/endpoint', data);
await crudAPI.read('/endpoint');
await crudAPI.update('/endpoint', data);
await crudAPI.delete('/endpoint');
```

**Form Operations:** Use `useCRUD` hook with `ActionButton`:
```typescript
const { handleSave, saveState } = useCRUD();
handleSave(() => dispatch(createEntity(data)), {
  successMessage: 'Created successfully',
  onSuccess: () => resetForm()
});
```

**Formula Evaluation:** Use `expr-eval` Parser (not `eval()`):
```typescript
import { Parser } from 'expr-eval';
const parser = new Parser();
const result = parser.evaluate(formula);
```

**HTML Sanitization:** Use DOMPurify for any `dangerouslySetInnerHTML`:
```typescript
import DOMPurify from 'dompurify';
DOMPurify.sanitize(content, { ALLOWED_TAGS: ['strong', 'code', 'br'] });
```

### Directory Structure

```
src/
├── components/           # Reusable UI components (ActionButton, Toast, etc.)
├── componest/            # Business logic components
│   ├── redux/            # Redux modules
│   │   ├── unifiedV2/    # Factory-based entity reducers/actions
│   │   ├── oders/        # Order management
│   │   └── login/        # Authentication
│   └── second/menu/      # Main app screens
│       ├── create/       # Creation forms
│       ├── Edit/         # Edit interfaces
│       └── SystemSetting/
├── hooks/                # useCRUD, useToast, useWebSocket, useDataCache, useOrderFormData
├── utils/                # crudHelpers, security, dateUtils
└── styles/               # Global CSS + platform fixes
electron/
├── main.ts               # Electron main process
└── preload.mjs           # Preload script
```

### Cross-Platform CSS

CSS files must be imported in this order in `src/index.css`:
```css
@import './styles/animations.css';
@import './styles/cross-platform-fixes.css';
@import './styles/windows-optimizations.css';  /* Windows fixes - must be last */
@tailwind base;
```

For animations, use GPU acceleration: `transform: translateZ(0); will-change: transform;`

## Environment Variables

Required in `.env`:
```
VITE_API_27INFINITY_IN=https://api.27infinity.in
VITE_API_KEY=your_api_key
VITE_WEBSOCKET_URL=wss://ws.27infinity.in
```

Copy from `.env.example` if missing. Local dev uses `http://localhost:4000/dev` and `ws://localhost:3001`.

## Redux V2 Action Pattern

When creating new entity actions in unifiedV2:
```typescript
// src/componest/redux/unifiedV2/{entity}Actions.ts
export const createEntity = (data: EntityData) => async (dispatch: Dispatch, getState: () => RootState) => {
  const token = getToken(getState);
  dispatch({ type: 'ENTITY_V2_CREATE_REQUEST' });
  try {
    const response = await crudAPI.create('/entity', data);
    dispatch({ type: 'ENTITY_V2_CREATE_SUCCESS', payload: response });
    dispatch(refreshOrderFormData()); // Refresh cached dropdowns
    return response;
  } catch (error) {
    dispatch({ type: 'ENTITY_V2_CREATE_FAILURE', payload: error.message });
    throw error;
  }
};
```

## Known Constraints

- **No test suite:** Test framework not installed (vitest recommended if adding tests)
- **Typo in directory:** `componest` (not `components`) contains business logic - don't rename
- **Branch header:** API calls include `x-selected-branch` header for data isolation
- **Token storage:** Auth token in localStorage as `authToken` or `token`
