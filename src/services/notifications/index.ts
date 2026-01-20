/**
 * Notification Services
 *
 * Centralized exports for push notification handling.
 *
 * Usage:
 *   import { pushNotifications, notificationHandler } from '@services/notifications';
 *
 *   // Initialize on app startup
 *   notificationHandler.registerHandlers();
 *   await notificationHandler.handleInitialNotification();
 *
 *   // Request permissions and get token
 *   const status = await pushNotifications.requestPermissions();
 *   if (status === 'granted') {
 *     const token = await pushNotifications.getExpoPushToken();
 *   }
 */

export { pushNotifications } from './push-notifications';
export { notificationHandler } from './notification-handler';

// Re-export types
export type {
  NotificationPermissionStatus,
  PushNotificationData,
  NotificationConfig,
  NotificationHandlers,
  ScheduleNotificationOptions,
  PushTokenRegistration,
} from './types';
