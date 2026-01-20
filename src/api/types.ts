/**
 * API Types
 *
 * Request and response types for API endpoints.
 * These types define the contract with the backend API.
 */

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User API types
export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// OAuth API types (for Visma Connect and other OAuth providers)
export interface OAuthTokenLoginRequest {
  /** OAuth provider name (e.g., 'visma_connect') */
  provider: string;
  /** Access token from the OAuth provider */
  accessToken: string;
  /** Optional ID token for providers that issue them */
  idToken?: string;
}

export interface OAuthCodeExchangeRequest {
  /** OAuth provider name (e.g., 'visma_connect') */
  provider: string;
  /** Authorization code from OAuth callback */
  code: string;
  /** PKCE code verifier used during authorization */
  codeVerifier: string;
  /** Redirect URI used during authorization */
  redirectUri: string;
}

/** Response from OAuth login - same structure as regular login */
export type OAuthLoginResponse = LoginResponse;

// Generic error response
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
