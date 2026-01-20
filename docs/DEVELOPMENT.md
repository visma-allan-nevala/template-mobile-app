# Development Guide

## Prerequisites

| Requirement | Purpose |
|-------------|---------|
| Node.js 20+ | Runtime |
| npm | Package manager |
| Expo Go app | Testing on device |
| VS Code | Recommended editor |

Optional: Xcode (iOS), Android Studio (Android), Watchman (file watching)

## Setup

```bash
git clone https://github.com/visma-allan-nevala/template-mobile-app.git
cd template-mobile-app
make setup              # Install deps + pre-commit hooks
cp .env.example .env    # Configure environment
make dev                # Start dev server
```

## Commands

| Command | Purpose |
|---------|---------|
| `make dev` | Start Expo dev server |
| `make dev-web` | Web browser only |
| `make check` | Lint + typecheck |
| `make test` | Run tests |
| `make test-cov` | Tests with coverage |
| `make lint-fix` | Auto-fix lint issues |
| `make format` | Format with Prettier |
| `npx expo start --ios` | iOS only |
| `npx expo start --android` | Android only |
| `npx expo start --clear` | Clear cache |

## Project Structure

```
app/                    # Screens (Expo Router)
├── _layout.tsx         # Root layout
├── index.tsx           # Entry redirect
├── (auth)/             # Auth screens (login, register)
└── (tabs)/             # Tab navigation (home, profile, settings)

src/
├── components/         # UI (ui/, forms/, layout/)
├── core/               # Config, theme, constants
├── services/           # Business logic
├── api/                # API client + endpoints
├── store/              # Zustand stores
├── hooks/              # React hooks
└── utils/              # Utilities

tests/                  # Test files (unit/, integration/)
docs/                   # Documentation
```

## Add New Screen

```typescript
// app/(tabs)/new-screen.tsx
import { Container } from '@/components/layout/Container';
import { Text } from '@/components/ui/Text';

export default function NewScreen() {
  return <Container><Text>New Screen</Text></Container>;
}
```

Add to tab layout if needed:
```typescript
// app/(tabs)/_layout.tsx
<Tabs.Screen name="new-screen" options={{ title: 'New' }} />
```

## Add New Component

```typescript
// src/components/ui/Badge.tsx
interface BadgeProps { label: string; variant?: 'success' | 'error'; }

export function Badge({ label, variant = 'success' }: BadgeProps) {
  return <View style={[styles.badge, styles[variant]]}><Text>{label}</Text></View>;
}
```

Export from barrel: `export { Badge } from './Badge';` in `src/components/ui/index.ts`

## Add New API Endpoint

```typescript
// 1. src/api/types.ts
export interface CreatePostRequest { title: string; content: string; }
export interface PostResponse { id: string; title: string; createdAt: string; }

// 2. src/api/endpoints/posts.ts
import { apiClient } from '../client';
import type { CreatePostRequest, PostResponse } from '../types';

export const postsApi = {
  create: (data: CreatePostRequest): Promise<PostResponse> =>
    apiClient.post('/posts', data),
  getById: (id: string): Promise<PostResponse> =>
    apiClient.get(`/posts/${id}`),
};

// 3. Export from src/api/endpoints/index.ts
export { postsApi } from './posts';
```

## Add New Store

```typescript
// src/store/posts.store.ts
import { create } from 'zustand';

interface PostsState {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));
```

## Testing

```bash
make test                           # All tests
npm run test:watch                  # Watch mode
npm test -- tests/unit/file.test.ts # Specific file
```

## Pre-commit Hooks

Runs automatically: ESLint, Prettier, detect-secrets

Skip (not recommended): `git commit --no-verify -m "message"`

## Debugging

| Issue | Solution |
|-------|----------|
| Metro cache | `npx expo start --clear` |
| Node modules | `rm -rf node_modules && npm install` |
| Expo issues | `npx expo-doctor` |

## Installing Packages

Always use `npx expo install <package>` for React Native packages (ensures compatible versions).

## Production Builds

```bash
# EAS Build (recommended)
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android

# Local builds
npx expo run:ios
npx expo run:android
```
