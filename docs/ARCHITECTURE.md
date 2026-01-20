# Architecture

## Layer Structure

```
app/           → Screens (Expo Router file-based routing)
src/components → UI components (ui/, forms/, layout/)
src/hooks      → React hooks (useAuth, useApi, etc.)
src/services   → Business logic orchestration
src/api        → API client + endpoint functions
src/store      → Zustand state stores
src/core       → Config, theme, constants, types
src/utils      → Helpers (secure-storage, formatting)
```

## Data Flow

```
User Action → Screen → Hook → Service → API → Backend
                                 ↓
                              Store ← Response
                                 ↓
                     Re-render (Zustand selector)
```

## Directory → Purpose

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `app/` | Screens, navigation | `_layout.tsx`, `(tabs)/`, `(auth)/` |
| `src/components/ui/` | Base primitives | `Button.tsx`, `Text.tsx`, `Input.tsx` |
| `src/components/forms/` | Form components | `LoginForm.tsx` |
| `src/components/layout/` | Layout wrappers | `Container.tsx`, `Header.tsx` |
| `src/hooks/` | React hooks | `useAuth.ts`, `useApi.ts`, `useVismaConnect.ts` |
| `src/services/auth/` | Auth logic | `visma-connect.ts`, `token-manager.ts` |
| `src/services/analytics/` | Analytics stubs | `analytics.ts`, `crash-reporting.ts` |
| `src/services/notifications/` | Push notifications | `push-notifications.ts` |
| `src/api/` | Backend communication | `client.ts`, `types.ts`, `endpoints/` |
| `src/store/` | State management | `auth.store.ts`, `app.store.ts` |
| `src/core/` | Configuration | `config.ts`, `theme.ts`, `auth.config.ts` |
| `src/utils/` | Utilities | `secure-storage.ts`, `validation.ts` |

## Store Pattern

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
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
    }),
    { name: 'example-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

## Service Pattern

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

## Security

| Concern | Solution |
|---------|----------|
| Token storage | `expo-secure-store` (Keychain/Keystore) |
| API auth | Bearer token in Authorization header |
| Sensitive data | Never logged, user-friendly errors only |
| HTTPS | Required in production |

## Technology Choices

| Choice | Reason |
|--------|--------|
| Expo | Quick setup, web preview, EAS builds, OTA updates |
| Zustand | ~1KB bundle, minimal boilerplate, excellent TS inference |
| Expo Router | File-based routing, typed routes, deep linking built-in |
| Colocated types | Types near code that uses them, less jumping between files |
