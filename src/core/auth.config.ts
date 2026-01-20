/**
 * Authentication Configuration
 *
 * Environment-specific OAuth/OIDC settings for Visma Connect.
 * Configure these values for your application.
 *
 * Usage:
 *   import { authConfig, getOAuthConfig } from '@core/auth.config';
 *
 * Setup:
 *   1. Register your app at https://developer.visma.com
 *   2. Set VISMA_CONNECT_CLIENT_ID in your environment
 *   3. Configure redirect URIs in Visma Developer Portal
 */

import Constants from 'expo-constants';
import type { OAuthProviderConfig } from '@services/auth/types';

/**
 * Visma Connect OAuth endpoints by environment
 */
const VISMA_CONNECT_ENDPOINTS = {
  production: {
    authorizationEndpoint: 'https://connect.visma.com/connect/authorize',
    tokenEndpoint: 'https://connect.visma.com/connect/token',
    userInfoEndpoint: 'https://connect.visma.com/connect/userinfo',
    endSessionEndpoint: 'https://connect.visma.com/connect/endsession',
    jwksUri: 'https://connect.visma.com/.well-known/jwks.json',
    revocationEndpoint: 'https://connect.visma.com/connect/revocation',
  },
  staging: {
    authorizationEndpoint: 'https://connect.identity.stagaws.visma.com/connect/authorize',
    tokenEndpoint: 'https://connect.identity.stagaws.visma.com/connect/token',
    userInfoEndpoint: 'https://connect.identity.stagaws.visma.com/connect/userinfo',
    endSessionEndpoint: 'https://connect.identity.stagaws.visma.com/connect/endsession',
    jwksUri: 'https://connect.identity.stagaws.visma.com/.well-known/jwks.json',
    revocationEndpoint: 'https://connect.identity.stagaws.visma.com/connect/revocation',
  },
} as const;

/**
 * Default OAuth scopes for Visma Connect
 * Customize based on your application's needs
 */
const DEFAULT_SCOPES = [
  'openid', // Required for OIDC
  'profile', // User profile information
  'email', // User email address
  'offline_access', // Refresh tokens
];

type Environment = 'production' | 'staging' | 'development';

/**
 * Get environment from Expo config
 */
function getEnvironment(): Environment {
  const env = Constants.expoConfig?.extra?.APP_ENV || process.env.APP_ENV || 'development';
  return env as Environment;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  const extra = Constants.expoConfig?.extra;
  return extra?.[key] ?? process.env[key] ?? defaultValue;
}

/**
 * Authentication configuration
 * Set VISMA_CONNECT_CLIENT_ID in your environment variables
 */
export const authConfig = {
  /**
   * OAuth client ID from Visma Developer Portal
   * IMPORTANT: Replace with your actual client ID
   */
  clientId: getEnvVar('VISMA_CONNECT_CLIENT_ID', 'your-client-id-here'),

  /**
   * Deep link scheme for OAuth callback
   * Must match the scheme in app.config.ts
   */
  scheme: getEnvVar('APP_SCHEME', 'template-mobile-app'),

  /**
   * OAuth scopes to request
   * Customize based on API access needs
   */
  scopes: DEFAULT_SCOPES,

  /**
   * Current environment
   */
  environment: getEnvironment(),

  /**
   * Token refresh buffer in seconds
   * Refresh tokens this many seconds before expiry
   */
  tokenRefreshBuffer: 60,

  /**
   * Whether to use staging environment for auth
   * Set to true for development/testing
   */
  useStaging: getEnvironment() !== 'production',
} as const;

/**
 * Get OAuth provider configuration for current environment
 */
export function getOAuthConfig(): OAuthProviderConfig {
  const env = authConfig.useStaging ? 'staging' : 'production';
  return VISMA_CONNECT_ENDPOINTS[env];
}

/**
 * Validate auth configuration
 * Call during app initialization to catch configuration errors early
 */
export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!authConfig.clientId || authConfig.clientId === 'your-client-id-here') {
    errors.push('VISMA_CONNECT_CLIENT_ID is not configured');
  }

  if (!authConfig.scheme) {
    errors.push('APP_SCHEME is not configured');
  }

  if (authConfig.scopes.length === 0) {
    errors.push('No OAuth scopes configured');
  }

  if (!authConfig.scopes.includes('openid')) {
    errors.push('OpenID scope is required for OIDC');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
