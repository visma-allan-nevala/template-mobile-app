/**
 * Token Manager
 *
 * Manages OAuth tokens with automatic refresh and secure storage.
 * Handles token lifecycle: storage, retrieval, refresh, and expiration.
 *
 * Usage:
 *   import { tokenManager } from '@services/auth/token-manager';
 *
 *   // Store tokens after login
 *   await tokenManager.setTokens(tokenSet);
 *
 *   // Get valid access token (auto-refreshes if needed)
 *   const token = await tokenManager.getValidAccessToken();
 *
 *   // Clear tokens on logout
 *   await tokenManager.clearTokens();
 */

import { secureStorage } from '@utils/secure-storage';
import { authConfig } from '@core/auth.config';
import { refreshAccessToken, isTokenExpired } from './visma-connect';
import type { TokenSet } from './types';

// Storage keys for token data
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  ID_TOKEN: 'id_token',
} as const;

/**
 * Token refresh state to prevent concurrent refresh attempts
 */
let refreshPromise: Promise<TokenSet> | null = null;

/**
 * Callbacks for token events
 */
type TokenEventCallback = () => void;
let onTokenRefreshFailed: TokenEventCallback | null = null;

/**
 * Set callback for when token refresh fails
 * Typically used to trigger logout/re-authentication
 */
export function setOnTokenRefreshFailed(callback: TokenEventCallback): void {
  onTokenRefreshFailed = callback;
}

/**
 * Store token set in secure storage
 */
export async function setTokens(tokenSet: TokenSet): Promise<void> {
  await Promise.all([
    secureStorage.setToken(tokenSet.accessToken),
    secureStorage.setRefreshToken(tokenSet.refreshToken),
    secureStorage.set(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, String(tokenSet.expiresAt)),
    tokenSet.idToken
      ? secureStorage.set(TOKEN_STORAGE_KEYS.ID_TOKEN, tokenSet.idToken)
      : Promise.resolve(),
  ]);
}

/**
 * Get stored tokens
 */
export async function getTokens(): Promise<Partial<TokenSet> | null> {
  const [accessToken, refreshToken, expiryStr, idToken] = await Promise.all([
    secureStorage.getToken(),
    secureStorage.getRefreshToken(),
    secureStorage.get(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY),
    secureStorage.get(TOKEN_STORAGE_KEYS.ID_TOKEN),
  ]);

  if (!accessToken) {
    return null;
  }

  const parsedExpiry = expiryStr ? parseInt(expiryStr, 10) : NaN;

  return {
    accessToken,
    refreshToken: refreshToken || undefined,
    expiresAt: Number.isNaN(parsedExpiry) ? undefined : parsedExpiry,
    idToken: idToken || undefined,
  };
}

/**
 * Get access token, returns null if not available
 */
export async function getAccessToken(): Promise<string | null> {
  return secureStorage.getToken();
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  return secureStorage.getRefreshToken();
}

/**
 * Check if current access token is expired
 */
export async function isAccessTokenExpired(): Promise<boolean> {
  const expiryStr = await secureStorage.get(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
  if (!expiryStr) {
    return true;
  }

  const expiresAt = parseInt(expiryStr, 10);
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return isTokenExpired(expiresAt, authConfig.tokenRefreshBuffer);
}

/**
 * Refresh the access token using stored refresh token
 * Handles concurrent refresh attempts by returning the same promise
 */
export async function refreshTokens(): Promise<TokenSet> {
  // If already refreshing, return existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        throw new TokenRefreshError('No refresh token available');
      }

      const newTokens = await refreshAccessToken(refreshToken);
      await setTokens(newTokens);

      return newTokens;
    } catch (error) {
      // Notify listeners of refresh failure
      if (onTokenRefreshFailed) {
        onTokenRefreshFailed();
      }
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Get a valid access token, refreshing if necessary
 * This is the main method to use when making API calls
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getTokens();

  if (!tokens?.accessToken) {
    return null;
  }

  // Check if token needs refresh
  if (tokens.expiresAt && isTokenExpired(tokens.expiresAt, authConfig.tokenRefreshBuffer)) {
    try {
      const newTokens = await refreshTokens();
      return newTokens.accessToken;
    } catch {
      // If refresh fails, return null to trigger re-authentication
      return null;
    }
  }

  return tokens.accessToken;
}

/**
 * Clear all stored tokens
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    secureStorage.clearAll(),
    secureStorage.delete(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY),
    secureStorage.delete(TOKEN_STORAGE_KEYS.ID_TOKEN),
  ]);
}

/**
 * Check if user has valid authentication
 */
export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getTokens();

  if (!tokens?.accessToken) {
    return false;
  }

  // If we have a refresh token, consider authenticated even if access token expired
  if (tokens.refreshToken) {
    return true;
  }

  // Without refresh token, check if access token is still valid
  return !isTokenExpired(tokens.expiresAt || 0, authConfig.tokenRefreshBuffer);
}

/**
 * Token refresh error
 */
export class TokenRefreshError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenRefreshError';
  }
}

/**
 * Token manager singleton
 */
export const tokenManager = {
  setTokens,
  getTokens,
  getAccessToken,
  getRefreshToken,
  getValidAccessToken,
  refreshTokens,
  clearTokens,
  isAuthenticated,
  isAccessTokenExpired,
  setOnTokenRefreshFailed,
};
