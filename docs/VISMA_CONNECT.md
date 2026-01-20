# Visma Connect Integration

## Quick Start

### 1. Register at [developer.visma.com](https://developer.visma.com)

| Setting | Value |
|---------|-------|
| Application type | Mobile App |
| Redirect URI | `your-app-scheme://callback/oauth` |
| Grant Types | Authorization Code with PKCE |
| Scopes | `openid profile email offline_access` |

### 2. Configure Environment

```bash
# .env
VISMA_CONNECT_CLIENT_ID=your-client-id
APP_SCHEME=your-app-scheme
APP_ENV=staging  # or 'production'
```

### 3. Use the Hook

```tsx
import { useVismaConnect } from '@hooks/useVismaConnect';

function LoginScreen() {
  const { login, isLoading, error } = useVismaConnect();
  return <Button title="Sign in with Visma" onPress={login} disabled={isLoading} />;
}
```

## Architecture

```
Mobile App
├── useVismaConnect hook
│   ├── Generates PKCE (code_verifier + code_challenge)
│   ├── Opens browser → Visma Connect
│   ├── Handles callback with auth code
│   ├── Exchanges code for Visma tokens
│   └── Exchanges Visma tokens for backend JWT
│
├── Token Manager (secure storage)
└── Auth Store (session state)

Backend API
└── POST /auth/oauth/login
    ├── Validates Visma access token
    ├── Creates/updates user
    └── Returns backend JWT
```

## Endpoints

| Environment | Authorization | Token |
|-------------|---------------|-------|
| Staging | `https://connect.identity.stagaws.visma.com/connect/authorize` | `.../connect/token` |
| Production | `https://connect.visma.com/connect/authorize` | `.../connect/token` |

## Hook API

```typescript
const {
  login,      // () => Promise<void> - Start OAuth flow
  logout,     // () => Promise<void> - Clear session
  isLoading,  // boolean
  error,      // string | null
  clearError, // () => void
} = useVismaConnect();
```

## Backend Contract

```
POST /auth/oauth/login
Content-Type: application/json

Request:
{
  "provider": "visma_connect",
  "accessToken": "eyJ...",
  "idToken": "eyJ..."
}

Response:
{
  "accessToken": "backend-jwt",
  "refreshToken": "refresh-token",
  "expiresIn": 3600,
  "user": { "id": "uuid", "email": "...", "username": "...", "displayName": "..." }
}
```

## Configuration Files

| File | Purpose |
|------|---------|
| `src/core/auth.config.ts` | OAuth settings (clientId, scopes, environment) |
| `src/services/auth/visma-connect.ts` | PKCE + token exchange logic |
| `src/services/auth/token-manager.ts` | Secure token storage + refresh |
| `src/hooks/useVismaConnect.ts` | Complete OAuth hook |

## Security

| Feature | Implementation |
|---------|----------------|
| PKCE | 32-byte random verifier, SHA256 challenge |
| State validation | Random state param verified on callback |
| Token storage | iOS Keychain, Android Encrypted SharedPreferences |
| Auto-refresh | 60 seconds before expiry |

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| State mismatch | Expired state (>5min) or app killed | Try again |
| Invalid redirect_uri | Scheme mismatch | Check app.config.ts matches .env |
| Token refresh fails | Missing `offline_access` scope | Add scope |
| Browser doesn't return | Android browser issue | Uses `WebBrowser.openAuthSessionAsync` |

## Protected Routes

```tsx
// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Tabs>...</Tabs>;
}
```

## Manual Token Access

```typescript
import { tokenManager } from '@services/auth/token-manager';

const vismaToken = await tokenManager.getValidAccessToken();
await fetch('https://connect.visma.com/api/...', {
  headers: { Authorization: `Bearer ${vismaToken}` },
});
```

## Testing

```typescript
// Mock auth for dev
if (__DEV__ && process.env.MOCK_AUTH) {
  useAuthStore.getState().login(
    { id: 'dev', email: 'dev@example.com', username: 'dev' },
    'mock-token', 'mock-refresh', Date.now() + 3600000
  );
}
```
