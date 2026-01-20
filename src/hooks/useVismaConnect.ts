/**
 * useVismaConnect Hook
 *
 * Complete Visma Connect OAuth 2.0 + PKCE authentication hook.
 * Handles the entire auth flow from login to token storage.
 *
 * Usage:
 *   import { useVismaConnect } from '@hooks/useVismaConnect';
 *
 *   function LoginScreen() {
 *     const { login, logout, isLoading, error } = useVismaConnect();
 *
 *     return (
 *       <Button onPress={login} disabled={isLoading}>
 *         Sign in with Visma
 *       </Button>
 *     );
 *   }
 *
 * Setup:
 *   1. Configure client ID in src/core/auth.config.ts
 *   2. Add deep link scheme in app.config.ts
 *   3. Register redirect URI at developer.visma.com
 *
 * @see docs/VISMA_CONNECT.md for complete setup guide
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@store/auth.store';
import { authApi } from '@api/endpoints/auth';
import { tokenManager } from '@services/auth/token-manager';
import { vismaConnect, VismaConnectError, decodeIdToken } from '@services/auth/visma-connect';
import { onUserLogin, onUserLogout } from '@services/app-initialization';
import { authConfig } from '@core/auth.config';
import { secureStorage } from '@utils/secure-storage';
import { STORAGE_KEYS } from '@core/constants';
import { isDev } from '@core/config';
import type { PKCEParams } from '@services/auth/types';
import type { User } from '@core/types';

// Ensure browser session is warmed up for faster auth
WebBrowser.maybeCompleteAuthSession();

/**
 * Auth flow state persisted during OAuth redirect
 */
interface PendingAuthState {
  state: string;
  pkce: PKCEParams;
  redirectUri: string;
  timestamp: number;
}

/**
 * Hook return type
 */
interface UseVismaConnectReturn {
  /** Start Visma Connect login flow */
  login: () => Promise<void>;
  /** Logout and clear all auth data */
  logout: () => Promise<void>;
  /** Whether auth operation is in progress */
  isLoading: boolean;
  /** Error message if auth failed */
  error: string | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Max age for pending auth state (5 minutes)
 */
const AUTH_STATE_MAX_AGE = 5 * 60 * 1000;

/**
 * Visma Connect OAuth provider name for backend
 */
const OAUTH_PROVIDER = 'visma_connect';

export function useVismaConnect(): UseVismaConnectReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authStore = useAuthStore();

  // Track if we're handling a callback to prevent duplicate processing
  const isHandlingCallback = useRef(false);

  /**
   * Save auth state before redirecting to Visma Connect
   * This is needed because the app may be killed during browser redirect
   */
  const savePendingAuthState = useCallback(async (pendingState: PendingAuthState) => {
    await secureStorage.set(STORAGE_KEYS.AUTH_STATE, JSON.stringify(pendingState));
  }, []);

  /**
   * Load and validate pending auth state
   */
  const loadPendingAuthState = useCallback(async (): Promise<PendingAuthState | null> => {
    const stored = await secureStorage.get(STORAGE_KEYS.AUTH_STATE);
    if (!stored) return null;

    try {
      const state = JSON.parse(stored) as PendingAuthState;

      // Check if state is expired
      if (Date.now() - state.timestamp > AUTH_STATE_MAX_AGE) {
        await secureStorage.delete(STORAGE_KEYS.AUTH_STATE);
        return null;
      }

      return state;
    } catch {
      await secureStorage.delete(STORAGE_KEYS.AUTH_STATE);
      return null;
    }
  }, []);

  /**
   * Clear pending auth state
   */
  const clearPendingAuthState = useCallback(async () => {
    await secureStorage.delete(STORAGE_KEYS.AUTH_STATE);
  }, []);

  /**
   * Complete the auth flow after receiving tokens from Visma Connect
   */
  const completeAuth = useCallback(
    async (vismaAccessToken: string, vismaIdToken?: string) => {
      // Exchange Visma tokens for backend JWT
      const response = await authApi.oauthLogin({
        provider: OAUTH_PROVIDER,
        accessToken: vismaAccessToken,
        idToken: vismaIdToken,
      });

      // Calculate token expiry timestamp
      const expiresAt = Date.now() + response.expiresIn * 1000;

      // Create user object from response
      const now = new Date().toISOString();
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        displayName: response.user.displayName,
        avatarUrl: response.user.avatarUrl,
        createdAt: now,
        updatedAt: now,
      };

      // Store tokens and update auth state
      await authStore.login(user, response.accessToken, response.refreshToken, expiresAt);

      // Set up user-specific services (analytics, crash reporting, push token)
      await onUserLogin(user.id, user.email);

      if (isDev) {
        console.log('[useVismaConnect] Auth completed successfully');
      }
    },
    [authStore]
  );

  /**
   * Handle OAuth callback URL
   */
  const handleCallback = useCallback(
    async (url: string) => {
      if (isHandlingCallback.current) return;
      isHandlingCallback.current = true;

      try {
        // Load pending auth state
        const pendingState = await loadPendingAuthState();
        if (!pendingState) {
          throw new VismaConnectError(
            'invalid_state',
            'No pending authentication found. Please try logging in again.'
          );
        }

        setIsLoading(true);
        setError(null);

        // Exchange code for tokens
        const tokenSet = await vismaConnect.handleCallback(
          url,
          pendingState.state,
          pendingState.pkce.codeVerifier,
          pendingState.redirectUri
        );

        // Clear pending state
        await clearPendingAuthState();

        // Store Visma tokens temporarily for potential direct API calls
        await tokenManager.setTokens(tokenSet);

        // Complete auth by exchanging with backend
        await completeAuth(tokenSet.accessToken, tokenSet.idToken);
      } catch (err) {
        const message =
          err instanceof VismaConnectError
            ? err.errorDescription || err.error
            : err instanceof Error
              ? err.message
              : 'Authentication failed';
        setError(message);

        if (isDev) {
          console.error('[useVismaConnect] Callback error:', err);
        }
      } finally {
        setIsLoading(false);
        isHandlingCallback.current = false;
      }
    },
    [loadPendingAuthState, clearPendingAuthState, completeAuth]
  );

  /**
   * Listen for deep link callbacks
   */
  useEffect(() => {
    // Check if app was opened with a callback URL
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && initialUrl.includes('callback/oauth')) {
        handleCallback(initialUrl);
      }
    };

    checkInitialUrl();

    // Listen for URL changes while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url.includes('callback/oauth')) {
        handleCallback(event.url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleCallback]);

  /**
   * Start Visma Connect login flow
   */
  const login = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if client ID is configured
      if (!authConfig.clientId || authConfig.clientId === 'YOUR_VISMA_CLIENT_ID') {
        throw new VismaConnectError(
          'configuration_error',
          'Visma Connect client ID not configured. See docs/VISMA_CONNECT.md'
        );
      }

      // Generate auth URL and PKCE params
      const { authUrl, state, pkce, redirectUri } = await vismaConnect.initiateLogin();

      // Save auth state before redirecting
      await savePendingAuthState({
        state,
        pkce,
        redirectUri,
        timestamp: Date.now(),
      });

      if (isDev) {
        console.log('[useVismaConnect] Opening auth URL:', authUrl);
      }

      // Open browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: true,
        preferEphemeralSession: false,
      });

      if (isDev) {
        console.log('[useVismaConnect] Browser result:', result.type);
      }

      // Handle different browser result types
      if (result.type === 'success' && result.url) {
        // Browser returned with callback URL
        await handleCallback(result.url);
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User cancelled
        await clearPendingAuthState();
        setIsLoading(false);
      }
      // For 'opened' type on Android, we wait for deep link callback
    } catch (err) {
      const message =
        err instanceof VismaConnectError
          ? err.errorDescription || err.error
          : err instanceof Error
            ? err.message
            : 'Failed to start authentication';
      setError(message);
      await clearPendingAuthState();

      if (isDev) {
        console.error('[useVismaConnect] Login error:', err);
      }

      setIsLoading(false);
    }
  }, [isLoading, savePendingAuthState, handleCallback, clearPendingAuthState]);

  /**
   * Logout and clear all auth data
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to revoke tokens on backend (best effort)
      try {
        await authApi.logout();
      } catch {
        // Ignore logout API errors - we still want to clear local state
        if (isDev) {
          console.log('[useVismaConnect] Backend logout failed, clearing local state anyway');
        }
      }

      // Clear all stored tokens
      await tokenManager.clearTokens();

      // Clear auth store
      await authStore.logout();

      // Clean up user-specific services (analytics, crash reporting)
      await onUserLogout();

      if (isDev) {
        console.log('[useVismaConnect] Logout completed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);

      if (isDev) {
        console.error('[useVismaConnect] Logout error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authStore]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    logout,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Parse user info from Visma Connect ID token
 * Useful for displaying user info before backend exchange
 */
export function parseVismaUser(idToken: string): Partial<User> | null {
  const claims = decodeIdToken(idToken);
  if (!claims) return null;

  return {
    id: claims.sub,
    email: claims.email,
    displayName: claims.name,
  };
}
