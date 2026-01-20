# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

```bash
# Development
make setup          # Initial setup (install deps, pre-commit)
make dev            # Start Expo dev server
make dev-web        # Web browser only

# Quality
make check          # Lint + typecheck
make test           # Run tests
make test-cov       # Tests with coverage
npm test -- path/to/test.test.ts  # Single test file

# Formatting
make lint-fix       # Auto-fix lint issues
make format         # Format with Prettier

# EAS Build (requires eas-cli)
eas build --profile development --platform ios
eas build --profile staging --platform all
eas build --profile production --platform all
```

## Project Overview

React Native + Expo template with production-ready architecture. Uses file-based routing (Expo Router), Zustand for state management, and TypeScript in strict mode. Includes Visma Connect OAuth integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      app/ (Screens)                         │
│              File-based routing via Expo Router             │
├─────────────────────────────────────────────────────────────┤
│                src/components/ (UI Layer)                   │
│        Reusable components: Button, Input, Card, etc.       │
├─────────────────────────────────────────────────────────────┤
│                  src/hooks/ (React Hooks)                   │
│          useAuth, useApi, useNetworkState, etc.             │
├─────────────────────────────────────────────────────────────┤
│                src/services/ (Business Logic)               │
│     Orchestrates API calls + state updates                  │
│     - auth/: Visma Connect OAuth + token management         │
│     - analytics/: Analytics + crash reporting               │
│     - notifications/: Push notification handling            │
├─────────────────────────────────────────────────────────────┤
│    src/api/ (API Client)    │    src/store/ (State)        │
│    Fetch wrapper + endpoints │    Zustand stores            │
├─────────────────────────────────────────────────────────────┤
│                   src/core/ (Configuration)                 │
│     config.ts, theme.ts, constants.ts, auth.config.ts       │
├─────────────────────────────────────────────────────────────┤
│                    src/utils/ (Utilities)                   │
│      secure-storage, storage, formatting, validation        │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout with providers |
| `app/(tabs)/_layout.tsx` | Tab navigation config |
| `app.config.ts` | Dynamic Expo config (replaces app.json) |
| `eas.json` | EAS Build profiles (dev/staging/prod) |
| `src/core/config.ts` | Runtime environment configuration |
| `src/core/auth.config.ts` | Visma Connect OAuth settings |
| `src/store/auth.store.ts` | Auth state with persistence |
| `src/api/client.ts` | API client with auth headers |
| `src/services/auth/visma-connect.ts` | OAuth flow implementation |

## Path Aliases

```typescript
import { Button } from '@components/ui/Button';  // src/components/ui/Button
import { useAuth } from '@hooks/useAuth';        // src/hooks/useAuth
import { config } from '@core/config';           // src/core/config
import { authApi } from '@api/endpoints/auth';   // src/api/endpoints/auth
import { useAuthStore } from '@store/auth.store'; // src/store/auth.store
import { formatDate } from '@utils/formatting';  // src/utils/formatting
```

## Data Flow

```
User Action → Screen → Hook → Service → API → Backend
                              ↓
                           Store ← Response
                              ↓
                    Re-render via Zustand selector
```

## Environment Configuration

Three environments: `development`, `staging`, `production`

Set `APP_ENV` to switch environments. Key variables (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | Environment (development/staging/production) |
| `API_BASE_URL` | Backend API URL |
| `VISMA_CONNECT_CLIENT_ID` | OAuth client ID from developer.visma.com |
| `APP_SCHEME` | Deep link scheme for OAuth callbacks |
| `ENABLE_ANALYTICS` | Toggle analytics tracking |
| `ENABLE_CRASH_REPORTING` | Toggle crash reporting |

EAS builds inject env vars per profile (see `eas.json`).

## Adding New Features

### New Screen
1. Create file in `app/` following Expo Router conventions
2. Add to navigation in parent `_layout.tsx` if needed

### New API Endpoint
1. Add types to `src/api/types.ts`
2. Add endpoint function to `src/api/endpoints/`
3. Create service in `src/services/` if needed

### New Store
1. Create Zustand store in `src/store/`
2. Add persistence middleware if data should persist
3. Export from barrel `index.ts`

## State Management Patterns

### Zustand Store Pattern
```typescript
// src/store/example.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExampleState {
  items: Item[];
  addItem: (item: Item) => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    }),
    {
      name: 'example-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Service Pattern
```typescript
// src/services/example.service.ts
import { exampleApi } from '@api/endpoints/example';
import { useExampleStore } from '@store/example.store';

export const exampleService = {
  fetchItems: async () => {
    const store = useExampleStore.getState();
    const items = await exampleApi.getItems();
    store.setItems(items);
  },
};
```

## Testing

Test files go in `tests/unit/` or `tests/integration/`.

```bash
make test                           # Run all tests
make test-cov                       # With coverage
npm test -- --watch                 # Watch mode
npm test -- tests/unit/auth.test.ts # Single file
```

## Important Notes

- **Strict TypeScript**: Enabled - fix all type errors
- **Secure storage**: Use `secureStorage` (expo-secure-store) for tokens/secrets
- **Run checks before committing**: `make check && make test`
- **OAuth setup**: Register app at developer.visma.com, set `VISMA_CONNECT_CLIENT_ID`
