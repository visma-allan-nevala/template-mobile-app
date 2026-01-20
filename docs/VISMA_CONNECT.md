# Visma Connect Integration Guide

This guide explains how to integrate Visma Connect OAuth authentication into your mobile app.

## Overview

Visma Connect is the single sign-on (SSO) identity provider for Visma products. This template includes stub implementations for OAuth 2.0 + PKCE authentication flows.

## Prerequisites

1. **Visma Developer Portal Account**: Register at [developer.visma.com](https://developer.visma.com)
2. **OAuth Client Registration**: Create an OAuth client for your mobile app
3. **Redirect URI Configuration**: Configure your app's deep link scheme

## Setup Steps

### 1. Register Your Application

1. Go to [Visma Developer Portal](https://developer.visma.com)
2. Create a new OAuth 2.0 client
3. Select "Mobile App" as the application type
4. Configure the following settings:
   - **Client ID**: Will be auto-generated
   - **Redirect URI**: `your-app-scheme://callback/oauth`
   - **Grant Types**: Authorization Code with PKCE
   - **Scopes**: `openid profile email offline_access`

### 2. Configure Environment Variables

Add your client ID to the environment:

```bash
# .env
VISMA_CONNECT_CLIENT_ID=your-client-id-from-developer-portal
APP_SCHEME=your-app-scheme
APP_ENV=staging  # or 'production'
```

### 3. Update App Configuration

Ensure your `app.config.ts` includes the deep link scheme:

```typescript
export default {
  expo: {
    scheme: 'your-app-scheme',
    // ... other config
  },
};
```

### 4. Implement Login Flow

```typescript
import { vismaConnect, tokenManager } from '@services/auth';
import { useAuthStore } from '@store/auth.store';

async function handleLogin() {
  try {
    // 1. Initiate OAuth flow
    const { authUrl, state, pkce, redirectUri } = await vismaConnect.initiateLogin();

    // 2. Store PKCE params for callback (use secure storage)
    await AsyncStorage.setItem('auth_state', JSON.stringify({ state, pkce, redirectUri }));

    // 3. Open browser for authentication
    // Using expo-auth-session or expo-web-browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      // 4. Handle callback
      const storedState = await AsyncStorage.getItem('auth_state');
      const { state: expectedState, pkce: storedPkce, redirectUri: storedUri } = JSON.parse(storedState);

      const tokens = await vismaConnect.handleCallback(
        result.url,
        expectedState,
        storedPkce.codeVerifier,
        storedUri
      );

      // 5. Store tokens and update auth state
      await tokenManager.setTokens(tokens);

      // 6. Get user info from ID token
      const claims = vismaConnect.decodeIdToken(tokens.idToken);

      // 7. Update app state
      useAuthStore.getState().login(
        {
          id: claims.sub,
          email: claims.email,
          username: claims.email,
          displayName: claims.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresAt
      );
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### 5. Handle Deep Links

Configure deep link handling in your app:

```typescript
// app/_layout.tsx
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Handle deep links
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url.includes('callback/oauth')) {
        // Handle OAuth callback
        handleOAuthCallback(event.url);
      }
    });

    return () => subscription.remove();
  }, []);

  // ... rest of layout
}
```

## Environment Endpoints

### Staging (Development/Testing)

```
Authorization: https://connect.identity.stagaws.visma.com/connect/authorize
Token: https://connect.identity.stagaws.visma.com/connect/token
UserInfo: https://connect.identity.stagaws.visma.com/connect/userinfo
JWKS: https://connect.identity.stagaws.visma.com/.well-known/jwks.json
```

### Production

```
Authorization: https://connect.visma.com/connect/authorize
Token: https://connect.visma.com/connect/token
UserInfo: https://connect.visma.com/connect/userinfo
JWKS: https://connect.visma.com/.well-known/jwks.json
```

## Token Management

### Automatic Token Refresh

The API client automatically handles token refresh:

```typescript
// Tokens are refreshed automatically on 401 responses
const response = await apiClient.get('/api/protected-endpoint');

// Or manually check/refresh
const validToken = await tokenManager.getValidAccessToken();
```

### Token Expiry

Tokens are refreshed 60 seconds before expiry by default. Configure in `auth.config.ts`:

```typescript
export const authConfig = {
  tokenRefreshBuffer: 60, // seconds
  // ...
};
```

## Security Considerations

### PKCE Flow

This implementation uses PKCE (Proof Key for Code Exchange) which is required for mobile apps:

1. **Code Verifier**: 32 bytes of cryptographically random data
2. **Code Challenge**: SHA256 hash of verifier, base64url encoded
3. **State Parameter**: CSRF protection, must match on callback

### Secure Token Storage

- Access and refresh tokens are stored in `expo-secure-store`
- On iOS: Keychain
- On Android: Encrypted SharedPreferences
- Web fallback: localStorage (less secure)

### ID Token Validation

The `decodeIdToken` function is for **display purposes only**. For security-critical operations:

1. Validate tokens server-side
2. Verify signature against JWKS
3. Check `iss`, `aud`, `exp` claims

## Troubleshooting

### Common Issues

**"State mismatch" error**
- Ensure state parameter is stored before redirecting
- Clear auth state on logout

**"Invalid redirect_uri" error**
- Verify redirect URI matches exactly in Developer Portal
- Check app scheme is correctly configured

**Token refresh fails**
- Ensure `offline_access` scope is requested
- Check refresh token hasn't expired (varies by client config)

### Debug Logging

Enable auth debug logging in development:

```typescript
if (__DEV__) {
  console.log('Auth URL:', authUrl);
  console.log('Redirect URI:', redirectUri);
}
```

## Migration from Other Auth Providers

### From Firebase Auth

1. Implement custom login UI (or use Visma Connect hosted pages)
2. Replace `firebase.auth()` calls with `vismaConnect` methods
3. Update token storage to use `tokenManager`

### From AWS Cognito

1. Update OAuth endpoints in `auth.config.ts`
2. Map Cognito claims to Visma Connect claims
3. Update user model if needed

## Resources

- [Visma Developer Portal](https://developer.visma.com)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)
- [expo-auth-session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
