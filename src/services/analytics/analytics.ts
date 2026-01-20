/**
 * Analytics Service
 *
 * Centralized analytics tracking with support for multiple providers.
 * This is a stub implementation - integrate with your preferred analytics
 * provider (Firebase Analytics, Amplitude, Mixpanel, etc.).
 *
 * Usage:
 *   import { analytics } from '@services/analytics';
 *
 *   // Track events
 *   analytics.trackEvent({ name: 'button_click', params: { button_id: 'submit' } });
 *
 *   // Track screen views
 *   analytics.trackScreenView({ screenName: 'HomeScreen' });
 *
 *   // Set user properties
 *   analytics.setUserId('user-123');
 *   analytics.setUserProperties({ accountType: 'premium' });
 *
 * Integration Examples:
 *   - Firebase: See docs/ANALYTICS.md
 *   - Amplitude: Replace stub methods with Amplitude SDK calls
 *   - Mixpanel: Replace stub methods with Mixpanel SDK calls
 */

import { config, isDev } from '@core/config';
import type { AnalyticsEvent, ScreenViewEvent, UserProperties, AnalyticsConfig } from './types';

/**
 * Analytics configuration from app config
 */
const analyticsConfig: AnalyticsConfig = {
  enabled: config.features.enableAnalytics,
  debug: isDev,
  optOut: false,
};

/**
 * Current user ID
 */
let currentUserId: string | null = null;

/**
 * User properties
 */
let userProperties: UserProperties = {};

/**
 * Initialize analytics
 * Call this during app startup
 */
export async function initialize(): Promise<void> {
  if (!analyticsConfig.enabled) {
    if (analyticsConfig.debug) {
      console.log('[Analytics] Disabled - skipping initialization');
    }
    return;
  }

  // TODO: Initialize your analytics provider here
  // Example for Firebase:
  // await Analytics.setAnalyticsCollectionEnabled(true);

  if (analyticsConfig.debug) {
    console.log('[Analytics] Initialized');
  }
}

/**
 * Track a custom event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!analyticsConfig.enabled || analyticsConfig.optOut) {
    return;
  }

  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  };

  if (analyticsConfig.debug) {
    console.log('[Analytics] Event:', eventWithTimestamp);
  }

  // TODO: Send to your analytics provider
  // Example for Firebase:
  // Analytics.logEvent(event.name, event.params);

  // Example for Amplitude:
  // Amplitude.logEvent(event.name, event.params);
}

/**
 * Track screen view
 */
export function trackScreenView(event: ScreenViewEvent): void {
  if (!analyticsConfig.enabled || analyticsConfig.optOut) {
    return;
  }

  if (analyticsConfig.debug) {
    console.log('[Analytics] Screen View:', event);
  }

  // TODO: Send to your analytics provider
  // Example for Firebase:
  // Analytics.logScreenView({
  //   screen_name: event.screenName,
  //   screen_class: event.screenClass,
  // });
}

/**
 * Set user ID for analytics
 */
export function setUserId(userId: string | null): void {
  currentUserId = userId;

  if (!analyticsConfig.enabled) {
    return;
  }

  if (analyticsConfig.debug) {
    console.log('[Analytics] Set User ID:', userId);
  }

  // TODO: Set user ID in your analytics provider
  // Example for Firebase:
  // Analytics.setUserId(userId);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: UserProperties): void {
  userProperties = { ...userProperties, ...properties };

  if (!analyticsConfig.enabled || analyticsConfig.optOut) {
    return;
  }

  if (analyticsConfig.debug) {
    console.log('[Analytics] User Properties:', properties);
  }

  // TODO: Set user properties in your analytics provider
  // Example for Firebase:
  // Analytics.setUserProperties(properties);
}

/**
 * Reset analytics (call on logout)
 */
export function reset(): void {
  currentUserId = null;
  userProperties = {};

  if (!analyticsConfig.enabled) {
    return;
  }

  if (analyticsConfig.debug) {
    console.log('[Analytics] Reset');
  }

  // TODO: Reset analytics provider
  // Example for Firebase:
  // Analytics.setUserId(null);
  // Analytics.resetAnalyticsData();
}

/**
 * Set user opt-out preference (GDPR compliance)
 */
export function setOptOut(optOut: boolean): void {
  analyticsConfig.optOut = optOut;

  if (analyticsConfig.debug) {
    console.log('[Analytics] Opt Out:', optOut);
  }

  // TODO: Update analytics provider opt-out setting
  // Example for Firebase:
  // Analytics.setAnalyticsCollectionEnabled(!optOut);
}

/**
 * Check if analytics is enabled
 */
export function isEnabled(): boolean {
  return analyticsConfig.enabled && !analyticsConfig.optOut;
}

/**
 * Get current user ID
 */
export function getUserId(): string | null {
  return currentUserId;
}

// Common event helpers

/**
 * Track login event
 */
export function trackLogin(method: string): void {
  trackEvent({
    name: 'login',
    params: { method },
  });
}

/**
 * Track logout event
 */
export function trackLogout(): void {
  trackEvent({
    name: 'logout',
  });
}

/**
 * Track sign up event
 */
export function trackSignUp(method: string): void {
  trackEvent({
    name: 'sign_up',
    params: { method },
  });
}

/**
 * Track button click
 */
export function trackButtonClick(buttonId: string, screenName?: string): void {
  trackEvent({
    name: 'button_click',
    params: {
      button_id: buttonId,
      ...(screenName && { screen_name: screenName }),
    },
  });
}

/**
 * Track error event
 */
export function trackError(errorName: string, errorMessage: string): void {
  trackEvent({
    name: 'error',
    params: {
      error_name: errorName,
      error_message: errorMessage.substring(0, 100), // Truncate for analytics
    },
  });
}

/**
 * Analytics singleton
 */
export const analytics = {
  initialize,
  trackEvent,
  trackScreenView,
  setUserId,
  setUserProperties,
  reset,
  setOptOut,
  isEnabled,
  getUserId,
  // Event helpers
  trackLogin,
  trackLogout,
  trackSignUp,
  trackButtonClick,
  trackError,
};
