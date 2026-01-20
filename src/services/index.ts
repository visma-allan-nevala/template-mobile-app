/**
 * Services
 *
 * Centralized exports for all application services.
 *
 * Usage:
 *   import { authService, userService } from '@services';
 *   import { vismaConnect, tokenManager } from '@services/auth';
 *   import { analytics, crashReporting } from '@services/analytics';
 *   import { pushNotifications, notificationHandler } from '@services/notifications';
 *   import { initializeApp, onUserLogin, onUserLogout } from '@services/app-initialization';
 */

// Existing services
export { authService } from './auth.service';
export { userService } from './user.service';

// App initialization
export { initializeApp, onUserLogin, onUserLogout } from './app-initialization';
export type { InitializationResult } from './app-initialization';

// Auth services (Visma Connect)
export {
  vismaConnect,
  tokenManager,
  VismaConnectError,
  TokenRefreshError,
  setOnTokenRefreshFailed,
} from './auth';

export type {
  TokenSet,
  VismaConnectClaims,
  VismaConnectConfig,
  OAuthProviderConfig,
  PKCEParams,
  AuthError,
  AuthFlowState,
} from './auth';

// Analytics services
export { analytics, crashReporting, initializeAnalytics } from './analytics';

export type { AnalyticsEvent, ScreenViewEvent, UserProperties, ErrorEvent } from './analytics';

// Notification services
export { pushNotifications, notificationHandler } from './notifications';

export type {
  NotificationPermissionStatus,
  PushNotificationData,
  NotificationConfig,
  ScheduleNotificationOptions,
} from './notifications';
