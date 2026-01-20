/**
 * Visma Connect Authentication Service
 *
 * OAuth 2.0 + PKCE authentication flow for Visma Connect identity provider.
 * This is a stub implementation - complete by adding your client ID and
 * configuring redirect URIs in the Visma Developer Portal.
 *
 * Usage:
 *   import { vismaConnect, initiateLogin, handleCallback } from '@services/auth/visma-connect';
 *
 * Setup:
 *   1. Register your app at https://developer.visma.com
 *   2. Configure redirect URI: your-app-scheme://callback/oauth
 *   3. Add client ID to environment variables
 *   4. Configure app.config.ts with the deep link scheme
 *
 * @see docs/VISMA_CONNECT.md for detailed integration guide
 */

import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { authConfig, getOAuthConfig } from '@core/auth.config';
import type {
  TokenSet,
  PKCEParams,
  AuthorizationRequest,
  AuthError,
  VismaConnectClaims,
} from './types';

/**
 * Generate PKCE parameters for OAuth flow
 * Creates a cryptographically secure code verifier and its SHA256 challenge
 */
export async function generatePKCE(): Promise<PKCEParams> {
  // Generate 32 bytes of random data for code verifier
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const codeVerifier = base64UrlEncode(randomBytes);

  // Create SHA256 hash of verifier for challenge
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, codeVerifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  const codeChallenge = base64ToBase64Url(digest);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Generate a random state parameter for CSRF protection
 */
export async function generateState(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return base64UrlEncode(randomBytes);
}

/**
 * Build the authorization URL for Visma Connect
 */
export function buildAuthorizationUrl(params: AuthorizationRequest): string {
  const config = getOAuthConfig();
  const url = new URL(config.authorizationEndpoint);

  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', params.responseType);
  url.searchParams.set('scope', params.scope);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', params.codeChallengeMethod);
  url.searchParams.set('state', params.state);

  if (params.nonce) {
    url.searchParams.set('nonce', params.nonce);
  }
  if (params.prompt) {
    url.searchParams.set('prompt', params.prompt);
  }

  return url.toString();
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenSet> {
  const config = getOAuthConfig();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: authConfig.clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'token_error',
      error_description: `HTTP ${response.status}`,
    }));
    throw new VismaConnectError(error.error, error.error_description);
  }

  const data = await response.json();

  // Validate required token response fields
  if (!data.access_token) {
    throw new VismaConnectError('invalid_response', 'Token response missing access_token');
  }

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600; // Default 1 hour

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? '',
    tokenType: data.token_type ?? 'Bearer',
    expiresIn,
    expiresAt: Date.now() + expiresIn * 1000,
    idToken: data.id_token,
    scope: data.scope,
  };
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  const config = getOAuthConfig();

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: authConfig.clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'refresh_error',
      error_description: `HTTP ${response.status}`,
    }));
    throw new VismaConnectError(error.error, error.error_description);
  }

  const data = await response.json();

  // Validate required token response fields
  if (!data.access_token) {
    throw new VismaConnectError('invalid_response', 'Token response missing access_token');
  }

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600; // Default 1 hour

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Some providers don't rotate refresh tokens
    tokenType: data.token_type ?? 'Bearer',
    expiresIn,
    expiresAt: Date.now() + expiresIn * 1000,
    idToken: data.id_token,
    scope: data.scope,
  };
}

/**
 * Decode JWT claims from ID token (without verification)
 * For display purposes only - always verify tokens server-side
 */
export function decodeIdToken(idToken: string): VismaConnectClaims | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if an access token is expired or about to expire
 * @param expiresAt Token expiration timestamp
 * @param bufferSeconds Consider expired this many seconds before actual expiry
 */
export function isTokenExpired(expiresAt: number, bufferSeconds: number = 60): boolean {
  return Date.now() >= expiresAt - bufferSeconds * 1000;
}

/**
 * Get the redirect URI for the current platform
 * Uses expo-auth-session to generate platform-appropriate URI
 */
export function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: authConfig.scheme,
    path: 'callback/oauth',
  });
}

/**
 * Initiate Visma Connect login flow
 * This is the main entry point for authentication
 *
 * @returns Object with authUrl to open and params to store for callback
 */
export async function initiateLogin(): Promise<{
  authUrl: string;
  state: string;
  pkce: PKCEParams;
  redirectUri: string;
}> {
  const pkce = await generatePKCE();
  const state = await generateState();
  const redirectUri = getRedirectUri();

  const authUrl = buildAuthorizationUrl({
    clientId: authConfig.clientId,
    redirectUri,
    responseType: 'code',
    scope: authConfig.scopes.join(' '),
    codeChallenge: pkce.codeChallenge,
    codeChallengeMethod: 'S256',
    state,
  });

  return { authUrl, state, pkce, redirectUri };
}

/**
 * Handle OAuth callback after user authenticates
 *
 * @param callbackUrl The full callback URL with query parameters
 * @param expectedState The state parameter from initiateLogin
 * @param codeVerifier The code verifier from initiateLogin
 * @param redirectUri The redirect URI from initiateLogin
 */
export async function handleCallback(
  callbackUrl: string,
  expectedState: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenSet> {
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    throw new VismaConnectError(error, errorDescription || undefined);
  }

  if (!code) {
    throw new VismaConnectError('missing_code', 'Authorization code not found in callback');
  }

  if (state !== expectedState) {
    throw new VismaConnectError('state_mismatch', 'State parameter does not match');
  }

  return exchangeCodeForTokens(code, codeVerifier, redirectUri);
}

/**
 * Visma Connect specific error class
 */
export class VismaConnectError extends Error implements AuthError {
  error: string;
  errorDescription?: string;

  constructor(error: string, errorDescription?: string) {
    super(errorDescription || error);
    this.name = 'VismaConnectError';
    this.error = error;
    this.errorDescription = errorDescription;
  }
}

// Helper functions for base64url encoding
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64ToBase64Url(base64);
}

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Visma Connect service singleton
 * Provides convenience methods for common auth operations
 */
export const vismaConnect = {
  initiateLogin,
  handleCallback,
  refreshAccessToken,
  decodeIdToken,
  isTokenExpired,
  getRedirectUri,
  generatePKCE,
  generateState,
};
