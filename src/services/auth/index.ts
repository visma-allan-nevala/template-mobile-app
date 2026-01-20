/**
 * Auth Services
 *
 * Centralized exports for authentication services.
 *
 * Usage:
 *   import { vismaConnect, tokenManager } from '@services/auth';
 */

export { vismaConnect, VismaConnectError } from './visma-connect';
export { tokenManager, TokenRefreshError, setOnTokenRefreshFailed } from './token-manager';

// Re-export types
export type {
  TokenSet,
  VismaConnectClaims,
  VismaConnectConfig,
  OAuthProviderConfig,
  PKCEParams,
  AuthorizationRequest,
  TokenRequest,
  AuthError,
  AuthFlowState,
} from './types';
