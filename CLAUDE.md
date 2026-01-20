# CLAUDE.md

LLM reference for template-mobile-app. Optimized for fast context loading.

## Commands

```bash
make setup          # First-time setup
make dev            # Start dev server
make check          # Lint + typecheck (run before commits)
make test           # Run tests
npm test -- path    # Single test file
make lint-fix       # Auto-fix lint
```

## File Lookup

| Need to find... | Look in... |
|-----------------|------------|
| Screen/page | `app/*.tsx`, `app/(tabs)/*.tsx`, `app/(auth)/*.tsx` |
| UI component | `src/components/ui/*.tsx` |
| Form component | `src/components/forms/*.tsx` |
| React hook | `src/hooks/*.ts` |
| API endpoint | `src/api/endpoints/*.ts` |
| API types | `src/api/types.ts` |
| Zustand store | `src/store/*.store.ts` |
| Business logic | `src/services/*.ts` |
| Auth/OAuth | `src/services/auth/*.ts` |
| Analytics | `src/services/analytics/*.ts` |
| Push notifications | `src/services/notifications/*.ts` |
| Environment config | `src/core/config.ts` |
| OAuth config | `src/core/auth.config.ts` |
| Constants/routes | `src/core/constants.ts` |
| Theme/colors | `src/core/theme.ts` |
| Shared types | `src/core/types.ts` |
| Secure storage | `src/utils/secure-storage.ts` |
| Validation | `src/utils/validation.ts` |
| Formatting | `src/utils/formatting.ts` |
| Tests | `tests/unit/**/*.test.ts` |

## Key Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `app/_layout.tsx` | Root layout, app initialization | `RootLayout` |
| `app.config.ts` | Expo config (replaces app.json) | config object |
| `eas.json` | EAS Build profiles | dev/staging/prod profiles |
| `src/core/config.ts` | Runtime config from env | `config`, `isDev` |
| `src/core/auth.config.ts` | OAuth settings | `authConfig`, `getOAuthConfig`, `validateAuthConfig` |
| `src/api/client.ts` | HTTP client with auth | `apiClient`, `ApiError` |
| `src/store/auth.store.ts` | Auth state | `useAuthStore` |
| `src/services/auth/visma-connect.ts` | OAuth PKCE flow | `vismaConnect`, `VismaConnectError` |
| `src/services/auth/token-manager.ts` | Token lifecycle | `tokenManager`, `setOnTokenRefreshFailed` |
| `src/services/app-initialization.ts` | Startup logic | `initializeApp`, `onUserLogin`, `onUserLogout` |
| `src/hooks/useVismaConnect.ts` | OAuth hook | `useVismaConnect`, `parseVismaUser` |

## Path Aliases

```typescript
@components  → src/components
@hooks       → src/hooks
@core        → src/core
@api         → src/api
@store       → src/store
@services    → src/services
@utils       → src/utils
@/           → project root (for app/ imports)
```

## Architecture

```
app/                    → Screens (Expo Router file-based routing)
src/components/         → UI components (stateless, no business logic)
src/hooks/              → React hooks (combine store + service)
src/services/           → Business logic (API + store orchestration)
src/api/                → HTTP client + endpoint functions
src/store/              → Zustand stores (state management)
src/core/               → Config, types, constants
src/utils/              → Pure utility functions
```

## Data Flow

```
Screen → Hook → Service → API → Backend
                   ↓
              Store.setState()
                   ↓
         Component re-renders via selector
```

## Common Patterns

### Add API Endpoint

```typescript
// 1. src/api/types.ts
export interface CreateItemRequest { name: string; }
export interface ItemResponse { id: string; name: string; }

// 2. src/api/endpoints/items.ts
import { apiClient } from '../client';
import type { CreateItemRequest, ItemResponse } from '../types';

export const itemsApi = {
  create: (data: CreateItemRequest): Promise<ItemResponse> =>
    apiClient.post<ItemResponse>('/items', data),
  getById: (id: string): Promise<ItemResponse> =>
    apiClient.get<ItemResponse>(`/items/${id}`),
};

// 3. src/api/endpoints/index.ts
export { itemsApi } from './items';
```

### Add Zustand Store

```typescript
// src/store/items.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ItemsState {
  items: Item[];
  setItems: (items: Item[]) => void;
}

export const useItemsStore = create<ItemsState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
    }),
    { name: 'items-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### Add Service

```typescript
// src/services/items.service.ts
import { itemsApi } from '@api/endpoints/items';
import { useItemsStore } from '@store/items.store';

export const itemsService = {
  fetchItems: async () => {
    const items = await itemsApi.getAll();
    useItemsStore.getState().setItems(items);
  },
};
```

### Add Screen

```typescript
// app/(tabs)/items.tsx
import { View } from 'react-native';
import { Text } from '@components/ui/Text';

export default function ItemsScreen() {
  return <View><Text>Items</Text></View>;
}

// Add to app/(tabs)/_layout.tsx if tab navigation needed
```

### Protected API Call

```typescript
// API client auto-injects auth header and handles 401 refresh
const data = await apiClient.get('/protected-endpoint');

// Skip auth for public endpoints
const data = await apiClient.post('/auth/login', credentials, { skipAuth: true });
```

### Visma Connect Login

```typescript
import { useVismaConnect } from '@hooks/useVismaConnect';

function LoginScreen() {
  const { login, logout, isLoading, error } = useVismaConnect();
  return <Button onPress={login} disabled={isLoading}>Sign in</Button>;
}
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | Environment: development/staging/production |
| `API_BASE_URL` | Backend API URL |
| `VISMA_CONNECT_CLIENT_ID` | OAuth client ID |
| `APP_SCHEME` | Deep link scheme |
| `ENABLE_ANALYTICS` | Toggle analytics |
| `ENABLE_CRASH_REPORTING` | Toggle crash reporting |

## Backend API Contract

Expected endpoints (implemented by template-python-api):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Email/password login |
| `/auth/register` | POST | User registration |
| `/auth/refresh` | POST | Token refresh |
| `/auth/logout` | POST | Logout (revoke tokens) |
| `/auth/oauth/login` | POST | OAuth token exchange |
| `/user/profile` | GET | Get current user |
| `/user/update` | PATCH | Update profile |
| `/user/push-token` | POST | Register push token |

## Testing

```bash
make test                              # All tests
npm test -- --testPathPattern=auth     # Tests matching "auth"
npm test -- --watch                    # Watch mode
```

Test location: `tests/unit/{category}/{file}.test.ts`

## Pre-commit Checks

Runs automatically: ESLint, Prettier, TypeScript, detect-secrets

## Important Rules

- Use `secureStorage` for tokens (not AsyncStorage)
- Run `make check` before commits
- Use `npx expo install` for RN packages
- Types colocated with code (not in separate types/ folder)
- Services orchestrate API→Store, hooks consume stores
