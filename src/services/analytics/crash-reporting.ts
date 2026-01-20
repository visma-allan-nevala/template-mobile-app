/**
 * Crash Reporting Service
 *
 * Centralized error and crash reporting with support for multiple providers.
 * This is a stub implementation - integrate with your preferred crash reporting
 * provider (Sentry, Firebase Crashlytics, Bugsnag, etc.).
 *
 * Usage:
 *   import { crashReporting } from '@services/analytics';
 *
 *   // Capture exceptions
 *   try {
 *     await riskyOperation();
 *   } catch (error) {
 *     crashReporting.captureException(error, { operation: 'riskyOperation' });
 *   }
 *
 *   // Capture messages
 *   crashReporting.captureMessage('Something unexpected happened', 'warning');
 *
 *   // Add breadcrumbs for debugging
 *   crashReporting.addBreadcrumb({
 *     message: 'User clicked button',
 *     category: 'ui',
 *   });
 *
 * Integration Examples:
 *   - Sentry: npm install @sentry/react-native
 *   - Firebase Crashlytics: npm install @react-native-firebase/crashlytics
 */

import { config, isDev } from '@core/config';
import type { CrashReportingConfig, ErrorEvent } from './types';

/**
 * Crash reporting configuration from app config
 */
const crashConfig: CrashReportingConfig = {
  enabled: config.features.enableCrashReporting,
  debug: isDev,
  environment: config.app.env,
  release: config.app.version,
};

/**
 * User context for error reports
 * Stored for future use when integrating with actual crash reporting provider
 * eslint-disable-next-line @typescript-eslint/no-unused-vars
 */
// @ts-expect-error - Stored for future use when integrating crash reporting provider
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let storedUserContext: { id?: string; email?: string; username?: string } | null = null;

/**
 * Initialize crash reporting
 * Call this during app startup
 */
export async function initialize(): Promise<void> {
  if (!crashConfig.enabled) {
    if (crashConfig.debug) {
      console.log('[CrashReporting] Disabled - skipping initialization');
    }
    return;
  }

  // TODO: Initialize your crash reporting provider here
  // Example for Sentry:
  // Sentry.init({
  //   dsn: crashConfig.dsn,
  //   environment: crashConfig.environment,
  //   release: crashConfig.release,
  //   debug: crashConfig.debug,
  // });

  if (crashConfig.debug) {
    console.log('[CrashReporting] Initialized');
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!crashConfig.enabled) {
    // Always log errors in debug mode
    if (crashConfig.debug) {
      console.error('[CrashReporting] Exception:', error);
      if (context) {
        console.error('[CrashReporting] Context:', context);
      }
    }
    return;
  }

  // TODO: Send to your crash reporting provider
  // Example for Sentry:
  // Sentry.captureException(error, {
  //   extra: context,
  // });

  if (crashConfig.debug) {
    console.error('[CrashReporting] Captured Exception:', error.message);
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!crashConfig.enabled) {
    if (crashConfig.debug) {
      console.log(`[CrashReporting] Message (${level}):`, message);
    }
    return;
  }

  // TODO: Send to your crash reporting provider
  // Example for Sentry:
  // Sentry.captureMessage(message, level);

  if (crashConfig.debug) {
    console.log(`[CrashReporting] Captured Message (${level}):`, message);
  }
}

/**
 * Set user context for error reports
 */
export function setUser(user: { id?: string; email?: string; username?: string } | null): void {
  storedUserContext = user;

  if (!crashConfig.enabled) {
    return;
  }

  // TODO: Set user in your crash reporting provider
  // Example for Sentry:
  // Sentry.setUser(user);

  if (crashConfig.debug) {
    // Log user ID only, not email/username to avoid PII in logs
    console.log('[CrashReporting] Set User:', user?.id ? `id=${user.id}` : 'null');
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void {
  if (!crashConfig.enabled) {
    if (crashConfig.debug) {
      console.log('[CrashReporting] Breadcrumb:', breadcrumb);
    }
    return;
  }

  // TODO: Add breadcrumb to your crash reporting provider
  // Example for Sentry:
  // Sentry.addBreadcrumb({
  //   message: breadcrumb.message,
  //   category: breadcrumb.category,
  //   level: breadcrumb.level,
  //   data: breadcrumb.data,
  // });
}

/**
 * Set extra context for all future error reports
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (!crashConfig.enabled) {
    return;
  }

  // TODO: Set context in your crash reporting provider
  // Example for Sentry:
  // Sentry.setContext(name, context);

  if (crashConfig.debug) {
    console.log(`[CrashReporting] Set Context (${name}):`, context);
  }
}

/**
 * Set tag for filtering errors
 */
export function setTag(key: string, value: string): void {
  if (!crashConfig.enabled) {
    return;
  }

  // TODO: Set tag in your crash reporting provider
  // Example for Sentry:
  // Sentry.setTag(key, value);

  if (crashConfig.debug) {
    console.log(`[CrashReporting] Set Tag: ${key}=${value}`);
  }
}

/**
 * Capture React component error (from ErrorBoundary)
 */
export function captureComponentError(error: Error, componentStack: string): void {
  const errorEvent: ErrorEvent = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    fatal: false,
    componentStack,
  };

  if (!crashConfig.enabled) {
    if (crashConfig.debug) {
      console.error('[CrashReporting] Component Error:', errorEvent);
    }
    return;
  }

  // TODO: Send to your crash reporting provider
  // Example for Sentry:
  // Sentry.captureException(error, {
  //   extra: { componentStack },
  // });

  if (crashConfig.debug) {
    console.error('[CrashReporting] Captured Component Error:', error.message);
  }
}

/**
 * Check if crash reporting is enabled
 */
export function isEnabled(): boolean {
  return crashConfig.enabled;
}

/**
 * Crash reporting singleton
 */
export const crashReporting = {
  initialize,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setContext,
  setTag,
  captureComponentError,
  isEnabled,
};
