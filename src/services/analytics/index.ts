/**
 * Analytics & Crash Reporting Services
 *
 * Centralized exports for analytics and error tracking.
 *
 * Usage:
 *   import { analytics, crashReporting } from '@services/analytics';
 *
 *   // Initialize on app startup
 *   await analytics.initialize();
 *   await crashReporting.initialize();
 *
 *   // Track events
 *   analytics.trackEvent({ name: 'purchase', params: { amount: 99 } });
 *
 *   // Report errors
 *   crashReporting.captureException(error);
 */

import { analytics as analyticsService } from './analytics';
import { crashReporting as crashReportingService } from './crash-reporting';

export { analytics } from './analytics';
export { crashReporting } from './crash-reporting';

// Re-export types
export type {
  AnalyticsEvent,
  ScreenViewEvent,
  UserProperties,
  AnalyticsConfig,
  CrashReportingConfig,
  ErrorEvent,
  AnalyticsProvider,
  CrashReportingProvider,
} from './types';

/**
 * Initialize all analytics services
 * Call this during app startup
 */
export async function initializeAnalytics(): Promise<void> {
  await Promise.all([analyticsService.initialize(), crashReportingService.initialize()]);
}
