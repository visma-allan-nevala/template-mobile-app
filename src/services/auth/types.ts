/**
 * Authentication Types
 *
 * Type definitions for OAuth/OIDC authentication flows.
 * Used by Visma Connect and other identity providers.
 *
 * Usage:
 *   import type { TokenSet, VismaConnectConfig } from '@services/auth/types';
 */

/**
 * OAuth 2.0 Token Set
 * Returned from token endpoint after successful authentication
 */
export interface TokenSet {
  /** JWT access token for API authentication */
  accessToken: string;
  /** Token used to obtain new access tokens */
  refreshToken: string;
  /** Token type (typically "Bearer") */
  tokenType: string;
  /** Access token lifetime in seconds */
  expiresIn: number;
  /** Unix timestamp when access token expires */
  expiresAt: number;
  /** OpenID Connect ID token (JWT with user claims) */
  idToken?: string;
  /** Space-separated list of granted scopes */
  scope?: string;
}

/**
 * Decoded JWT claims from Visma Connect ID token
 */
export interface VismaConnectClaims {
  /** Subject (user ID) */
  sub: string;
  /** Email address */
  email: string;
  /** Whether email is verified */
  email_verified: boolean;
  /** User's display name */
  name?: string;
  /** Given/first name */
  given_name?: string;
  /** Family/last name */
  family_name?: string;
  /** Visma tenant/organization ID */
  tenant_id?: string;
  /** Alternative: organization ID */
  organization_id?: string;
  /** Token issuer */
  iss: string;
  /** Token audience */
  aud: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
}

/**
 * OAuth 2.0 / OIDC Provider Configuration
 */
export interface OAuthProviderConfig {
  /** Authorization endpoint URL */
  authorizationEndpoint: string;
  /** Token endpoint URL */
  tokenEndpoint: string;
  /** User info endpoint URL */
  userInfoEndpoint?: string;
  /** End session (logout) endpoint URL */
  endSessionEndpoint?: string;
  /** JWKS (JSON Web Key Set) URL for token validation */
  jwksUri: string;
  /** Token revocation endpoint URL */
  revocationEndpoint?: string;
}

/**
 * Visma Connect specific configuration
 */
export interface VismaConnectConfig extends OAuthProviderConfig {
  /** OAuth client ID (obtain from Visma Developer Portal) */
  clientId: string;
  /** Redirect URI registered with Visma Connect */
  redirectUri: string;
  /** Requested OAuth scopes */
  scopes: string[];
  /** Environment identifier */
  environment: 'production' | 'staging';
}

/**
 * PKCE (Proof Key for Code Exchange) parameters
 * Required for mobile OAuth flows
 */
export interface PKCEParams {
  /** High-entropy cryptographic random string */
  codeVerifier: string;
  /** Base64url-encoded SHA256 hash of codeVerifier */
  codeChallenge: string;
  /** Always "S256" for SHA256 */
  codeChallengeMethod: 'S256';
}

/**
 * OAuth authorization request parameters
 */
export interface AuthorizationRequest {
  /** OAuth client ID */
  clientId: string;
  /** Redirect URI */
  redirectUri: string;
  /** Response type (always "code" for authorization code flow) */
  responseType: 'code';
  /** Space-separated scopes */
  scope: string;
  /** PKCE code challenge */
  codeChallenge: string;
  /** PKCE method (always "S256") */
  codeChallengeMethod: 'S256';
  /** Random state for CSRF protection */
  state: string;
  /** Random nonce for replay protection */
  nonce?: string;
  /** Force login prompt */
  prompt?: 'login' | 'consent' | 'none';
}

/**
 * Token request parameters (authorization code exchange)
 */
export interface TokenRequest {
  /** Grant type */
  grantType: 'authorization_code' | 'refresh_token';
  /** OAuth client ID */
  clientId: string;
  /** Authorization code (for authorization_code grant) */
  code?: string;
  /** Redirect URI (must match authorization request) */
  redirectUri?: string;
  /** PKCE code verifier */
  codeVerifier?: string;
  /** Refresh token (for refresh_token grant) */
  refreshToken?: string;
}

/**
 * Authentication error from OAuth provider
 */
export interface AuthError {
  /** OAuth error code */
  error: string;
  /** Human-readable error description */
  errorDescription?: string;
  /** URI with more error information */
  errorUri?: string;
}

/**
 * Authentication state for tracking login flow
 */
export interface AuthFlowState {
  /** Current flow status */
  status: 'idle' | 'loading' | 'authenticating' | 'exchanging' | 'success' | 'error';
  /** Error if status is 'error' */
  error?: AuthError;
  /** PKCE parameters for current flow */
  pkce?: PKCEParams;
  /** State parameter for CSRF protection */
  state?: string;
}
