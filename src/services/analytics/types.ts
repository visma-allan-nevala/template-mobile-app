/**
 * Analytics Types
 *
 * Type definitions for analytics and crash reporting services.
 *
 * Usage:
 *   import type { AnalyticsEvent, UserProperties } from '@services/analytics/types';
 */

/**
 * Standard analytics event
 */
export interface AnalyticsEvent {
  /** Event name (e.g., 'button_click', 'screen_view') */
  name: string;
  /** Event parameters */
  params?: Record<string, string | number | boolean>;
  /** Timestamp (auto-set if not provided) */
  timestamp?: number;
}

/**
 * User properties for analytics
 */
export interface UserProperties {
  /** Unique user identifier */
  userId?: string;
  /** User email (hashed for privacy) */
  email?: string;
  /** Account type */
  accountType?: string;
  /** App version */
  appVersion?: string;
  /** Custom properties */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Screen view event
 */
export interface ScreenViewEvent {
  /** Screen name */
  screenName: string;
  /** Screen class (component name) */
  screenClass?: string;
  /** Previous screen */
  previousScreen?: string;
}

/**
 * Error event for crash reporting
 */
export interface ErrorEvent {
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Error name/type */
  name?: string;
  /** Whether this was fatal */
  fatal?: boolean;
  /** Additional context */
  context?: Record<string, unknown>;
  /** Component stack (for React errors) */
  componentStack?: string;
}

/**
 * Analytics provider configuration
 */
export interface AnalyticsConfig {
  /** Whether analytics is enabled */
  enabled: boolean;
  /** Debug mode (logs events to console) */
  debug?: boolean;
  /** User opt-out (GDPR compliance) */
  optOut?: boolean;
  /** Session timeout in milliseconds */
  sessionTimeout?: number;
}

/**
 * Crash reporting configuration
 */
export interface CrashReportingConfig {
  /** Whether crash reporting is enabled */
  enabled: boolean;
  /** Debug mode */
  debug?: boolean;
  /** Environment tag */
  environment?: 'development' | 'staging' | 'production';
  /** Release version */
  release?: string;
  /** DSN for error reporting service */
  dsn?: string;
}

/**
 * Analytics provider interface
 * Implement this for different analytics backends (Firebase, Amplitude, etc.)
 */
export interface AnalyticsProvider {
  /** Initialize the provider */
  initialize: (config: AnalyticsConfig) => Promise<void>;
  /** Track a custom event */
  trackEvent: (event: AnalyticsEvent) => void;
  /** Track a screen view */
  trackScreenView: (event: ScreenViewEvent) => void;
  /** Set user properties */
  setUserProperties: (properties: UserProperties) => void;
  /** Set user ID */
  setUserId: (userId: string | null) => void;
  /** Reset analytics (on logout) */
  reset: () => void;
}

/**
 * Crash reporting provider interface
 */
export interface CrashReportingProvider {
  /** Initialize the provider */
  initialize: (config: CrashReportingConfig) => Promise<void>;
  /** Capture an exception */
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  /** Capture a message */
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  /** Set user context */
  setUser: (user: { id?: string; email?: string; username?: string } | null) => void;
  /** Add breadcrumb */
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }) => void;
}
