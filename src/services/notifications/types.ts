/**
 * Push Notification Types
 *
 * Type definitions for push notification handling.
 *
 * Usage:
 *   import type { PushNotificationData, NotificationPermissionStatus } from '@services/notifications/types';
 */

import type { NotificationResponse, Notification } from 'expo-notifications';

/**
 * Push notification permission status
 */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Custom notification data payload
 * Extend this based on your backend notification structure
 */
export interface PushNotificationData {
  /** Notification type for routing */
  type?: string;
  /** Deep link URL to navigate to */
  url?: string;
  /** Entity ID related to notification */
  entityId?: string;
  /** Additional custom data */
  [key: string]: unknown;
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  /** Request permissions on app launch */
  requestPermissionsOnLaunch?: boolean;
  /** Show notification when app is in foreground */
  showInForeground?: boolean;
  /** Android notification channel ID */
  androidChannelId?: string;
  /** Android notification channel name */
  androidChannelName?: string;
}

/**
 * Notification event handlers
 */
export interface NotificationHandlers {
  /** Called when notification is received while app is in foreground */
  onNotificationReceived?: (notification: Notification) => void;
  /** Called when user interacts with a notification */
  onNotificationResponse?: (response: NotificationResponse) => void;
  /** Called when push token is updated */
  onPushTokenUpdated?: (token: string) => void;
}

/**
 * Scheduled notification options
 */
export interface ScheduleNotificationOptions {
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** Custom data payload */
  data?: PushNotificationData;
  /** Trigger time (Date or seconds from now) */
  trigger: Date | number | null;
  /** iOS sound (true for default, string for custom) */
  sound?: boolean | string;
  /** iOS badge count */
  badge?: number;
}

/**
 * Push token registration request
 */
export interface PushTokenRegistration {
  /** Expo push token */
  pushToken: string;
  /** Device platform */
  platform: 'ios' | 'android' | 'web';
  /** Device identifier */
  deviceId?: string;
  /** App version */
  appVersion?: string;
}
