/**
 * App Initialization Service
 *
 * Handles all app startup tasks in the correct order:
 * 1. Validate configuration
 * 2. Restore auth state
 * 3. Initialize services (analytics, crash reporting, notifications)
 * 4. Set up service callbacks
 *
 * Usage:
 *   import { initializeApp } from '@services/app-initialization';
 *
 *   // In app/_layout.tsx
 *   useEffect(() => {
 *     initializeApp().then(() => SplashScreen.hideAsync());
 *   }, []);
 */

import { Platform } from 'react-native';
import { validateAuthConfig } from '@core/auth.config';
import { isDev } from '@core/config';
import { tokenManager, setOnTokenRefreshFailed } from './auth';
import { initializeAnalytics, crashReporting, analytics } from './analytics';
import { pushNotifications, notificationHandler } from './notifications';
import { useAuthStore } from '@store/auth.store';
import { apiClient } from '@api/client';

/**
 * Initialization result
 */
export interface InitializationResult {
  success: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Initialize the app
 * Call this during app startup before hiding splash screen
 */
export async function initializeApp(): Promise<InitializationResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Validate auth configuration
    const authValidation = validateAuthConfig();
    if (!authValidation.valid) {
      // In dev mode, warn but continue (for testing without OAuth)
      // In production, this would be a critical error
      if (isDev) {
        warnings.push(...authValidation.errors.map((e) => `Auth config: ${e}`));
      } else {
        errors.push(...authValidation.errors);
      }
    }

    // 2. Set up token refresh failure handler
    // When token refresh fails, log the user out
    setOnTokenRefreshFailed(() => {
      if (isDev) {
        console.log('[AppInit] Token refresh failed, logging out');
      }
      useAuthStore.getState().logout();
    });

    // 3. Restore auth state
    // Check if user has valid tokens stored
    const isAuthenticated = await tokenManager.isAuthenticated();
    if (isAuthenticated) {
      // Token exists - auth store will be hydrated from persisted state
      if (isDev) {
        console.log('[AppInit] User has valid authentication');
      }
    }

    // 4. Initialize analytics and crash reporting
    await initializeAnalytics();

    // 5. Initialize push notifications (if on physical device)
    try {
      await pushNotifications.initialize(
        {
          requestPermissionsOnLaunch: false, // Let the app decide when to request
          showInForeground: true,
        },
        {
          onNotificationReceived: (notification) => {
            notificationHandler.handleForegroundNotification(notification);
          },
          onNotificationResponse: (response) => {
            notificationHandler.handleNotificationResponse(response);
          },
          onPushTokenUpdated: async (token) => {
            // Register token with backend when user is authenticated
            if (useAuthStore.getState().isAuthenticated) {
              await registerPushTokenWithBackend(token);
            }
          },
        }
      );
    } catch (notificationError) {
      // Notifications may fail on simulator - don't block app startup
      warnings.push('Push notifications initialization failed (may be running in simulator)');
      if (isDev) {
        console.log('[AppInit] Push notifications init failed:', notificationError);
      }
    }

    // 6. Set user context for crash reporting if authenticated
    const authState = useAuthStore.getState();
    if (authState.isAuthenticated && authState.user) {
      crashReporting.setUser({
        id: authState.user.id,
        email: authState.user.email,
      });
    }

    if (isDev) {
      console.log('[AppInit] App initialization complete');
      if (warnings.length > 0) {
        console.log('[AppInit] Warnings:', warnings);
      }
    }

    return {
      success: errors.length === 0,
      warnings,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown initialization error';
    errors.push(message);

    crashReporting.captureException(error instanceof Error ? error : new Error(message), {
      phase: 'app_initialization',
    });

    return {
      success: false,
      warnings,
      errors,
    };
  }
}

/**
 * Register push token with backend for targeted notifications
 */
async function registerPushTokenWithBackend(token: string): Promise<void> {
  try {
    await apiClient.post('/user/push-token', {
      token,
      platform: getPlatform(),
    });

    if (isDev) {
      console.log('[AppInit] Push token registered with backend');
    }
  } catch (error) {
    // Don't fail silently - log for debugging
    if (isDev) {
      console.log('[AppInit] Failed to register push token:', error);
    }
    // Report to crash reporting but don't throw
    crashReporting.captureMessage('Failed to register push token', 'warning');
  }
}

/**
 * Get current platform identifier
 */
function getPlatform(): 'ios' | 'android' | 'web' {
  return Platform.OS as 'ios' | 'android' | 'web';
}

/**
 * Called after successful login to set up user-specific services
 */
export async function onUserLogin(userId: string, email?: string): Promise<void> {
  // Set user context for crash reporting
  crashReporting.setUser({ id: userId, email });

  // Set user ID for analytics
  analytics.setUserId(userId);

  // Register push token if we have one
  try {
    const token = await pushNotifications.getExpoPushToken();
    if (token) {
      await registerPushTokenWithBackend(token);
    }
  } catch {
    // Push token registration is best-effort
  }

  if (isDev) {
    console.log('[AppInit] User login setup complete');
  }
}

/**
 * Called after logout to clean up user-specific services
 */
export async function onUserLogout(): Promise<void> {
  // Clear user from crash reporting
  crashReporting.setUser(null);

  // Clear user from analytics
  analytics.reset();

  if (isDev) {
    console.log('[AppInit] User logout cleanup complete');
  }
}
