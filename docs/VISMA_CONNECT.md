# Visma Connect Integration Guide

This guide explains how to integrate Visma Connect OAuth authentication into your mobile app.

## Overview

Visma Connect is the single sign-on (SSO) identity provider for Visma products. This template provides a complete, production-ready implementation of OAuth 2.0 + PKCE authentication.

## Quick Start (5 Minutes)

### 1. Register Your Application

1. Go to [Visma Developer Portal](https://developer.visma.com)
2. Create a new OAuth 2.0 client
3. Select "Mobile App" as the application type
4. Configure:
   - **Redirect URI**: `your-app-scheme://callback/oauth`
   - **Grant Types**: Authorization Code with PKCE
   - **Scopes**: `openid profile email offline_access`

### 2. Configure Environment

```bash
# .env
VISMA_CONNECT_CLIENT_ID=your-client-id-from-developer-portal
APP_SCHEME=your-app-scheme
APP_ENV=staging  # or 'production'
```

### 3. Add Login Button

```tsx
import { useVismaConnect } from '@hooks/useVismaConnect';

function LoginScreen() {
  const { login, isLoading, error } = useVismaConnect();

  return (
    <View>
      <Button
        title="Sign in with Visma"
        onPress={login}
        disabled={isLoading}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

That's it! The hook handles the entire OAuth flow, token exchange with your backend, and session management.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              useVismaConnect Hook                        │   │
│  │  - Initiates PKCE flow                                   │   │
│  │  - Opens browser for auth                                │   │
│  │  - Handles callback                                      │   │
│  │  - Exchanges tokens with backend                         │   │
│  │  - Stores session                                        │   │
│  └──────────────┬──────────────────────┬───────────────────┘   │
│                 │                      │                        │
│  ┌──────────────▼────────┐  ┌─────────▼──────────────────┐     │
│  │   Token Manager       │  │      Auth Store            │     │
│  │   (Secure Storage)    │  │   (Session State)          │     │
│  └───────────────────────┘  └────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                 │                      │
    ┌────────────▼──────────┐  ┌───────▼───────────────────┐
    │   Visma Connect       │  │    Your Backend API       │
    │   (OAuth Provider)    │  │  POST /auth/oauth/login   │
    │                       │  │  - Validates Visma token  │
    │   1. User auth        │  │  - Issues backend JWT     │
    │   2. Returns tokens   │  │  - Returns user profile   │
    └───────────────────────┘  └───────────────────────────┘
```

## Complete Example

### Login Screen

```tsx
// app/(auth)/login.tsx
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useVismaConnect } from '@hooks/useVismaConnect';
import { useAuthStore } from '@store/auth.store';
import { Button } from '@components/ui/Button';
import { Redirect } from 'expo-router';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useVismaConnect();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Dismiss" onPress={clearError} variant="text" />
        </View>
      )}

      <Button
        title={isLoading ? 'Signing in...' : 'Sign in with Visma'}
        onPress={login}
        disabled={isLoading}
        icon={isLoading ? <ActivityIndicator /> : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  errorContainer: { backgroundColor: '#fee', padding: 16, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#c00' },
});
```

### Profile Screen with Logout

```tsx
// app/(tabs)/profile.tsx
import { View, Text, Image, StyleSheet } from 'react-native';
import { useVismaConnect } from '@hooks/useVismaConnect';
import { useAuthStore } from '@store/auth.store';
import { Button } from '@components/ui/Button';

export default function ProfileScreen() {
  const { logout, isLoading } = useVismaConnect();
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      {user?.avatarUrl && (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      )}
      <Text style={styles.name}>{user?.displayName || user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Button
        title={isLoading ? 'Signing out...' : 'Sign Out'}
        onPress={logout}
        disabled={isLoading}
        variant="outline"
      />
    </View>
  );
}
```

### Protected Routes

```tsx
// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

## Configuration Reference

### auth.config.ts

```typescript
// src/core/auth.config.ts
export const authConfig = {
  // Your OAuth client ID from Visma Developer Portal
  clientId: process.env.VISMA_CONNECT_CLIENT_ID || 'YOUR_VISMA_CLIENT_ID',

  // Deep link scheme (must match app.config.ts)
  scheme: process.env.APP_SCHEME || 'your-app-scheme',

  // OAuth scopes to request
  scopes: ['openid', 'profile', 'email', 'offline_access'],

  // Environment ('staging' or 'production')
  environment: process.env.APP_ENV || 'staging',

  // Refresh tokens this many seconds before expiry
  tokenRefreshBuffer: 60,
};
```

### Environment Endpoints

| Environment | Authorization | Token | JWKS |
|-------------|---------------|-------|------|
| **Staging** | `https://connect.identity.stagaws.visma.com/connect/authorize` | `.../connect/token` | `.../.well-known/jwks.json` |
| **Production** | `https://connect.visma.com/connect/authorize` | `.../connect/token` | `.../.well-known/jwks.json` |

## Backend Integration

The mobile app exchanges Visma tokens for your backend's JWT tokens. Your backend should implement:

```
POST /auth/oauth/login
Content-Type: application/json

{
  "provider": "visma_connect",
  "accessToken": "eyJ...",
  "idToken": "eyJ..."  // optional
}

Response:
{
  "accessToken": "your-backend-jwt",
  "refreshToken": "your-refresh-token",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "displayName": "Display Name"
  }
}
```

The backend should:
1. Validate the Visma access token by calling Visma's userinfo endpoint
2. Create or update the user in your database
3. Issue your own JWT tokens for API access

See the `template-python-api` for a reference backend implementation.

## Hook API Reference

### useVismaConnect

```typescript
const {
  login,      // () => Promise<void> - Start OAuth flow
  logout,     // () => Promise<void> - Sign out and clear session
  isLoading,  // boolean - Whether operation is in progress
  error,      // string | null - Error message if auth failed
  clearError, // () => void - Clear error state
} = useVismaConnect();
```

### Related Functions

```typescript
import { parseVismaUser } from '@hooks/useVismaConnect';

// Parse user info from Visma ID token (before backend exchange)
const user = parseVismaUser(idToken);
// Returns: { id, email, displayName } | null
```

## Security Features

### PKCE (Proof Key for Code Exchange)

Required for mobile apps. The hook automatically:
- Generates cryptographically random code verifier (32 bytes)
- Creates SHA256 code challenge
- Validates state parameter on callback

### Secure Token Storage

- **iOS**: Keychain (encrypted, backed up to iCloud)
- **Android**: Encrypted SharedPreferences
- **Web**: localStorage (less secure, use HTTPS)

### Token Lifecycle

1. Access token expires in ~1 hour
2. Hook auto-refreshes 60 seconds before expiry
3. Refresh token rotation supported
4. Logout revokes all tokens

## Troubleshooting

### "State mismatch" Error

The OAuth state parameter didn't match. This can happen if:
- User took too long (>5 minutes) to authenticate
- App was killed during auth flow
- Multiple auth attempts running

**Solution**: Try logging in again.

### "Invalid redirect_uri" Error

The redirect URI doesn't match Developer Portal config.

**Check**:
1. App scheme in `app.config.ts` matches `.env`
2. Redirect URI format: `your-scheme://callback/oauth`
3. No trailing slashes

### Token Refresh Fails

**Check**:
1. `offline_access` scope is included
2. Refresh token hasn't expired (varies by client config)
3. Network connectivity

### Browser Doesn't Return to App

**On Android**: Some browsers don't support custom schemes.
**Solution**: Use `WebBrowser.openAuthSessionAsync` (included in hook).

## Advanced: Manual Token Access

For direct Visma API calls (rare):

```typescript
import { tokenManager } from '@services/auth/token-manager';

// Get Visma access token (auto-refreshes if needed)
const vismaToken = await tokenManager.getValidAccessToken();

// Make Visma API call
const response = await fetch('https://connect.visma.com/api/...', {
  headers: { Authorization: `Bearer ${vismaToken}` },
});
```

## Migration Guides

### From Firebase Auth

```typescript
// Before (Firebase)
const { user } = await firebase.auth().signInWithPopup(provider);

// After (Visma Connect)
const { login } = useVismaConnect();
await login(); // Hook handles everything
```

### From Manual OAuth Implementation

Remove all manual OAuth code and use the hook:

```typescript
// Before (manual)
const pkce = await generatePKCE();
const authUrl = buildAuthUrl(pkce);
await WebBrowser.openAuthSession(authUrl);
// ... handle callback, exchange tokens, store, etc.

// After (hook)
const { login } = useVismaConnect();
await login(); // One line!
```

## Testing

### Mock Authentication (Dev Mode)

For development without Visma Connect:

```typescript
// In your test/dev setup
if (__DEV__ && process.env.MOCK_AUTH) {
  const mockLogin = () => {
    useAuthStore.getState().login(
      { id: 'dev-user', email: 'dev@example.com', username: 'dev' },
      'mock-access-token',
      'mock-refresh-token',
      Date.now() + 3600000
    );
  };
}
```

### Integration Tests

```typescript
describe('useVismaConnect', () => {
  it('handles successful login', async () => {
    // Mock WebBrowser.openAuthSessionAsync to return callback URL
    // Mock authApi.oauthLogin to return tokens
    // Assert auth store is updated
  });
});
```

## Resources

- [Visma Developer Portal](https://developer.visma.com)
- [OAuth 2.0 for Mobile Apps (RFC 8252)](https://tools.ietf.org/html/rfc8252)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)
- [expo-web-browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
