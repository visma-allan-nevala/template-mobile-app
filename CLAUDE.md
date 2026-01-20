# CLAUDE.md - Template Mobile App

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

# Formatting
make lint-fix       # Auto-fix lint issues
make format         # Format with Prettier
```

## Project Overview

React Native + Expo template with production-ready architecture. Uses file-based routing (Expo Router), Zustand for state management, and TypeScript in strict mode.

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
├─────────────────────────────────────────────────────────────┤
│    src/api/ (API Client)    │    src/store/ (State)        │
│    Fetch wrapper + endpoints │    Zustand stores            │
├─────────────────────────────────────────────────────────────┤
│                   src/core/ (Configuration)                 │
│         config.ts, theme.ts, constants.ts, types.ts         │
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
| `src/core/config.ts` | Environment configuration |
| `src/core/theme.ts` | Design tokens (colors, spacing) |
| `src/store/auth.store.ts` | Auth state with persistence |
| `src/api/client.ts` | API client with auth headers |

## Path Aliases

```typescript
import { Button } from '@components/ui/Button';  // src/components/ui/Button
import { useAuth } from '@hooks/useAuth';        // src/hooks/useAuth
import { config } from '@core/config';           // src/core/config
import { authApi } from '@api/endpoints/auth';   // src/api/endpoints/auth
import { useAuthStore } from '@store/auth.store'; // src/store/auth.store
import { formatDate } from '@utils/formatting';  // src/utils/formatting
```

## Adding New Features

### New Screen
1. Create file in `app/` following Expo Router conventions
2. Add to navigation in parent `_layout.tsx` if needed

### New Component
1. Create in `src/components/ui/` or `src/components/forms/`
2. Export from barrel `index.ts`

### New API Endpoint
1. Add types to `src/api/types.ts`
2. Add endpoint function to `src/api/endpoints/`
3. Create service in `src/services/` if needed

### New Store
1. Create Zustand store in `src/store/`
2. Add persistence middleware if data should persist
3. Export from barrel `index.ts`

## Data Flow

```
User Action → Screen → Hook → Service → API → Backend
                              ↓
                           Store ← Response
                              ↓
                    Re-render via Zustand selector
```

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
    try {
      const items = await exampleApi.getItems();
      store.setItems(items);
    } catch (error) {
      // Handle error
    }
  },
};
```

## Testing

```bash
make test                    # Run all tests
make test-cov               # With coverage
npm test -- --watch         # Watch mode
npm test -- path/to/test    # Specific file
```

Test files go in `tests/unit/` or `tests/integration/`.

## Common Commands

```bash
# Start development
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Clear cache
npx expo start --clear

# Install new package
npx expo install <package-name>
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `API_BASE_URL`: Backend API URL
- `API_TIMEOUT`: Request timeout in ms

## Pre-commit Hooks

Configured in `.pre-commit-config.yaml`:
- ESLint
- Prettier
- detect-secrets
- Trailing whitespace removal

## Important Notes

- **Strict TypeScript**: Enabled - fix all type errors
- **No console.log in production**: Use `console.warn/error` only
- **Secure storage**: Use `secureStorage` for tokens/secrets
- **Test your changes**: Run `make check && make test` before committing
