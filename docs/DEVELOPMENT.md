# Development Guide

This guide covers setting up your development environment and common development tasks.

## Prerequisites

- **Node.js 20+** - JavaScript runtime
- **npm** - Package manager (comes with Node.js)
- **Expo Go** - Mobile app for testing (iOS/Android)
- **VS Code** (recommended) - Code editor

### Optional

- **Xcode** - iOS Simulator (macOS only)
- **Android Studio** - Android Emulator
- **Watchman** - File watcher (improves performance)

## Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/visma-allan-nevala/template-mobile-app.git
   cd template-mobile-app
   ```

2. **Run setup**:
   ```bash
   make setup
   ```
   This installs dependencies and configures pre-commit hooks.

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start development**:
   ```bash
   make dev
   ```

## Development Server

```bash
# Start Expo dev server (all platforms)
make dev
# or
npx expo start

# Web only
make dev-web
# or
npx expo start --web

# iOS only (requires Xcode)
npx expo start --ios

# Android only (requires Android Studio)
npx expo start --android

# Clear cache if issues
npx expo start --clear
```

## Project Structure

```
template-mobile-app/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Entry redirect
│   ├── +not-found.tsx      # 404 screen
│   ├── (auth)/             # Auth group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── profile.tsx
│       └── settings.tsx
├── src/
│   ├── components/         # UI components
│   │   ├── ui/             # Primitives
│   │   ├── forms/          # Form components
│   │   └── layout/         # Layout components
│   ├── core/               # Configuration
│   ├── services/           # Business logic
│   ├── api/                # API client
│   ├── store/              # State management
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilities
├── tests/                  # Test files
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── assets/                 # Static assets
```

## Common Tasks

### Adding a New Screen

1. Create file in `app/`:
   ```typescript
   // app/(tabs)/new-screen.tsx
   import { View } from 'react-native';
   import { Container } from '@/components/layout/Container';
   import { Text } from '@/components/ui/Text';

   export default function NewScreen() {
     return (
       <Container>
         <Text>New Screen</Text>
       </Container>
     );
   }
   ```

2. Add to tab navigation if needed (`app/(tabs)/_layout.tsx`):
   ```typescript
   <Tabs.Screen
     name="new-screen"
     options={{
       title: 'New',
       tabBarIcon: ({ color, size }) => (
         <Ionicons name="add" size={size} color={color} />
       ),
     }}
   />
   ```

### Adding a New Component

1. Create component file:
   ```typescript
   // src/components/ui/Badge.tsx
   import { View, StyleSheet } from 'react-native';
   import { Text } from './Text';

   interface BadgeProps {
     label: string;
     variant?: 'success' | 'error' | 'warning';
   }

   export function Badge({ label, variant = 'success' }: BadgeProps) {
     return (
       <View style={[styles.badge, styles[variant]]}>
         <Text variant="caption" color="white">{label}</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     badge: { ... },
     success: { ... },
     error: { ... },
     warning: { ... },
   });
   ```

2. Export from barrel:
   ```typescript
   // src/components/ui/index.ts
   export { Badge } from './Badge';
   ```

### Adding a New API Endpoint

1. Add types:
   ```typescript
   // src/api/types.ts
   export interface CreatePostRequest {
     title: string;
     content: string;
   }

   export interface PostResponse {
     id: string;
     title: string;
     content: string;
     createdAt: string;
   }
   ```

2. Add endpoint:
   ```typescript
   // src/api/endpoints/posts.ts
   import { apiClient } from '../client';
   import type { CreatePostRequest, PostResponse } from '../types';

   export const postsApi = {
     create: (data: CreatePostRequest): Promise<PostResponse> =>
       apiClient.post<PostResponse>('/posts', data),

     getById: (id: string): Promise<PostResponse> =>
       apiClient.get<PostResponse>(`/posts/${id}`),
   };
   ```

3. Export:
   ```typescript
   // src/api/endpoints/index.ts
   export { postsApi } from './posts';
   ```

### Adding a New Store

```typescript
// src/store/posts.store.ts
import { create } from 'zustand';

interface Post {
  id: string;
  title: string;
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  setLoading: (loading: boolean) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  isLoading: false,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### Adding a New Service

```typescript
// src/services/posts.service.ts
import { postsApi } from '@api/endpoints/posts';
import { usePostsStore } from '@store/posts.store';
import type { CreatePostRequest } from '@api/types';

export const postsService = {
  fetchPosts: async () => {
    const store = usePostsStore.getState();
    store.setLoading(true);
    try {
      const posts = await postsApi.getAll();
      store.setPosts(posts);
    } finally {
      store.setLoading(false);
    }
  },

  createPost: async (data: CreatePostRequest) => {
    const store = usePostsStore.getState();
    const post = await postsApi.create(data);
    store.addPost(post);
    return post;
  },
};
```

## Code Quality

### Running Checks

```bash
# All checks
make check

# Individual checks
npm run lint
npm run typecheck

# Auto-fix
make lint-fix
make format
```

### Pre-commit Hooks

Pre-commit hooks run automatically on commit:
- ESLint - Code linting
- Prettier - Formatting
- detect-secrets - Block secrets

To skip hooks (not recommended):
```bash
git commit --no-verify -m "message"
```

## Testing

```bash
# Run all tests
make test

# Watch mode
npm run test:watch

# Coverage report
make test-cov

# Specific file
npm test -- tests/unit/utils/formatting.test.ts
```

## Debugging

### React Native Debugger

1. Press `j` in terminal to open Chrome DevTools
2. Or shake device and select "Debug JS Remotely"

### Common Issues

**Metro bundler cache**:
```bash
npx expo start --clear
```

**Node modules issues**:
```bash
rm -rf node_modules
npm install
```

**Expo issues**:
```bash
npx expo-doctor
```

## Installing Packages

Always use `expo install` for React Native packages:
```bash
npx expo install <package-name>
```

This ensures compatible versions with your Expo SDK.

## Building for Production

### Development Build

```bash
npx expo run:ios
npx expo run:android
```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build
eas build --platform ios
eas build --platform android
```

See [EAS Build documentation](https://docs.expo.dev/build/introduction/) for more details.
