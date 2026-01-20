# Architecture

This document describes the system architecture and design decisions for the template-mobile-app.

## Overview

The application follows a layered architecture pattern, separating concerns into distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│              app/ (Screens via Expo Router)                 │
├─────────────────────────────────────────────────────────────┤
│                      UI Components                          │
│    src/components/ (Button, Input, Card, forms, layout)     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│             src/hooks/ (Custom React Hooks)                 │
│           src/services/ (Business Logic)                    │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                      │
│    src/api/ (API Client)     src/store/ (State)            │
│    src/utils/ (Utilities)    src/core/ (Config)            │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Presentation Layer (`app/`)

- **Purpose**: UI screens and navigation
- **Technology**: Expo Router (file-based routing)
- **Responsibilities**:
  - Render UI components
  - Handle user interactions
  - Navigation logic
  - Screen-level state (form inputs, loading states)

### UI Components (`src/components/`)

- **Purpose**: Reusable visual components
- **Subdirectories**:
  - `ui/` - Base primitives (Button, Text, Input, Card)
  - `forms/` - Form components (LoginForm, RegisterForm)
  - `layout/` - Layout components (Container, Header)
- **Principles**:
  - Stateless when possible
  - Accept props for customization
  - No business logic

### Application Layer

#### Hooks (`src/hooks/`)

- **Purpose**: React hooks for component logic
- **Examples**:
  - `useAuth` - Authentication operations
  - `useApi` - Generic API call handling
  - `useNetworkState` - Connectivity tracking
- **Pattern**: Combine store state with service actions

#### Services (`src/services/`)

- **Purpose**: Business logic orchestration
- **Responsibilities**:
  - Coordinate API calls with state updates
  - Handle errors and edge cases
  - Implement business rules
- **Pattern**: Services use stores internally, don't return stores

### Infrastructure Layer

#### API Client (`src/api/`)

- **Purpose**: Backend communication
- **Structure**:
  - `client.ts` - Fetch wrapper with auth
  - `types.ts` - Request/response types
  - `endpoints/` - Endpoint-specific functions
- **Features**:
  - Automatic auth header injection
  - Request timeout handling
  - Error normalization

#### State Management (`src/store/`)

- **Purpose**: Application state
- **Technology**: Zustand
- **Stores**:
  - `auth.store` - Authentication state
  - `user.store` - User preferences
  - `app.store` - UI/runtime state
- **Persistence**: AsyncStorage via Zustand middleware

#### Core (`src/core/`)

- **Purpose**: Configuration and shared types
- **Files**:
  - `config.ts` - Environment configuration
  - `theme.ts` - Design tokens
  - `constants.ts` - Static values
  - `types.ts` - Shared TypeScript types

#### Utilities (`src/utils/`)

- **Purpose**: Helper functions
- **Modules**:
  - `secure-storage.ts` - Keychain/Keystore wrapper
  - `storage.ts` - AsyncStorage helpers
  - `formatting.ts` - Data formatting
  - `validation.ts` - Input validation

## Data Flow

### Read Flow (Fetching Data)

```
Screen → Hook → Service → API Client → Backend
                   ↓
              Store Update
                   ↓
         Component Re-render (via selector)
```

### Write Flow (User Action)

```
User Action → Component → Hook → Service → API Client → Backend
                                    ↓
                               Store Update
                                    ↓
                          UI Update (optimistic or after response)
```

## Design Decisions

### Why Expo over Bare React Native?

| Advantage | Description |
|-----------|-------------|
| **Quick Setup** | Clone → install → run in minutes |
| **Web Preview** | Test in browser without simulators |
| **Managed Workflow** | No Xcode/Android Studio for most development |
| **EAS Build** | Cloud builds for production |
| **Updates** | OTA updates without app store review |

### Why Zustand over Redux?

| Criterion | Zustand | Redux |
|-----------|---------|-------|
| Bundle Size | ~1KB | ~10KB |
| Boilerplate | Minimal | Significant |
| Learning Curve | Low | Moderate |
| Persistence | Built-in middleware | Requires redux-persist |
| TypeScript | Excellent inference | Requires more setup |

### Why Expo Router?

| Feature | Benefit |
|---------|---------|
| File-based | Predictable structure |
| Typed Routes | TypeScript integration |
| Deep Linking | Built-in support |
| Similar to Next.js | Familiar pattern |

### Why Colocated Types?

Types are placed with their modules rather than in a separate `types/` directory:

- **Easier navigation** - Types near the code that uses them
- **Better locality** - Changes to a module update its types in place
- **Less cognitive overhead** - No jumping between directories
- **Shared types** - Only in `src/core/types.ts` when truly shared

## Security Considerations

### Token Storage

- Access tokens stored in `expo-secure-store` (Keychain/Keystore)
- Not in AsyncStorage (unencrypted)
- Web fallback uses localStorage (less secure, acceptable for dev)

### API Security

- Tokens sent via Authorization header
- HTTPS required in production
- Request timeout to prevent hanging

### Error Handling

- Sensitive data never logged
- User-friendly error messages
- Full errors only in development

## Testing Strategy

### Unit Tests

- Components: Render, props, user interaction
- Hooks: State changes, side effects
- Utils: Pure function inputs/outputs

### Integration Tests

- Feature flows (login, registration)
- Multiple component interaction
- Store + API integration

### What's Not Tested (Yet)

- E2E tests (add Detox/Maestro when needed)
- Visual regression (add Storybook when needed)
