/**
 * Push Notifications Service
 *
 * Handles push notification setup, permissions, and token management
 * using expo-notifications.
 *
 * Usage:
 *   import { pushNotifications } from '@services/notifications';
 *
 *   // Initialize on app startup
 *   await pushNotifications.initialize();
 *
 *   // Get push token
 *   const token = await pushNotifications.getExpoPushToken();
 *
 *   // Request permissions
 *   const status = await pushNotifications.requestPermissions();
 *
 * Setup:
 *   1. Configure expo-notifications in app.config.ts
 *   2. Add notification icon for Android
 *   3. Configure FCM for Android (google-services.json)
 *   4. Configure APNs for iOS (push certificate)
 *
 * @see docs/PUSH_NOTIFICATIONS.md for detailed setup guide
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { isDev } from '@core/config';
import type {
  NotificationPermissionStatus,
  NotificationConfig,
  NotificationHandlers,
  ScheduleNotificationOptions,
} from './types';

/**
 * Default notification configuration
 */
const defaultConfig: NotificationConfig = {
  requestPermissionsOnLaunch: false,
  showInForeground: true,
  androidChannelId: 'default',
  androidChannelName: 'Default',
};

/**
 * Current configuration
 */
let config: NotificationConfig = { ...defaultConfig };

/**
 * Stored handlers
 */
let handlers: NotificationHandlers = {};

/**
 * Track if already initialized to prevent duplicate listeners
 */
let isInitialized = false;

/**
 * Subscription references for cleanup
 */
let notificationReceivedSubscription: ReturnType<
  typeof Notifications.addNotificationReceivedListener
> | null = null;
let notificationResponseSubscription: ReturnType<
  typeof Notifications.addNotificationResponseReceivedListener
> | null = null;

/**
 * Configure how notifications appear when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: config.showInForeground ?? true,
    shouldPlaySound: config.showInForeground ?? true,
    shouldSetBadge: false,
  }),
});

/**
 * Initialize push notifications
 * Call this during app startup
 */
export async function initialize(
  customConfig?: Partial<NotificationConfig>,
  customHandlers?: NotificationHandlers
): Promise<void> {
  // Prevent duplicate initialization
  if (isInitialized) {
    // Update handlers if re-initialized
    handlers = customHandlers ?? handlers;
    config = { ...config, ...customConfig };
    if (isDev) {
      console.log('[PushNotifications] Already initialized, updated config/handlers');
    }
    return;
  }

  config = { ...defaultConfig, ...customConfig };
  handlers = customHandlers ?? {};

  // Setup Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(config.androidChannelId ?? 'default', {
      name: config.androidChannelName ?? 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Setup notification listeners
  setupListeners();
  isInitialized = true;

  if (isDev) {
    console.log('[PushNotifications] Initialized');
  }
}

/**
 * Setup notification event listeners
 */
function setupListeners(): void {
  // Remove existing listeners if any (cleanup)
  if (notificationReceivedSubscription) {
    notificationReceivedSubscription.remove();
  }
  if (notificationResponseSubscription) {
    notificationResponseSubscription.remove();
  }

  // Listener for notifications received while app is foregrounded
  notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      if (isDev) {
        console.log('[PushNotifications] Received:', notification);
      }
      handlers.onNotificationReceived?.(notification);
    }
  );

  // Listener for user interactions with notifications
  notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      if (isDev) {
        console.log('[PushNotifications] Response:', response);
      }
      handlers.onNotificationResponse?.(response);
    }
  );
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<NotificationPermissionStatus> {
  // Check if physical device
  if (!Device.isDevice) {
    if (isDev) {
      console.log('[PushNotifications] Not a physical device - skipping permissions');
    }
    return 'denied';
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  // Only ask if not already determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (isDev) {
    console.log('[PushNotifications] Permission status:', finalStatus);
  }

  return finalStatus as NotificationPermissionStatus;
}

/**
 * Check current permission status
 */
export async function getPermissionStatus(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as NotificationPermissionStatus;
}

/**
 * Get Expo push token
 * Returns null if permissions not granted or not a physical device
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    if (isDev) {
      console.log('[PushNotifications] Not a physical device - no push token');
    }
    return null;
  }

  const permission = await getPermissionStatus();
  if (permission !== 'granted') {
    if (isDev) {
      console.log('[PushNotifications] Permissions not granted - no push token');
    }
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      // projectId is configured in app.config.ts
    });

    if (isDev) {
      console.log('[PushNotifications] Push token:', token.data);
    }

    handlers.onPushTokenUpdated?.(token.data);

    return token.data;
  } catch (error) {
    if (isDev) {
      console.error('[PushNotifications] Failed to get push token:', error);
    }
    return null;
  }
}

/**
 * Get device push token (FCM for Android, APNs for iOS)
 */
export async function getDevicePushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return token.data;
  } catch (error) {
    if (isDev) {
      console.error('[PushNotifications] Failed to get device token:', error);
    }
    return null;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(options: ScheduleNotificationOptions): Promise<string> {
  const { title, body, data, trigger, sound = true, badge } = options;

  // Validate required fields
  if (!title || title.trim() === '') {
    throw new Error('Notification title is required');
  }

  // Convert trigger to Notifications trigger type
  let notificationTrigger: Notifications.NotificationTriggerInput = null;

  if (trigger instanceof Date) {
    // Validate date is in the future
    if (trigger.getTime() <= Date.now()) {
      // Schedule immediately if date is in the past
      notificationTrigger = null;
    } else {
      notificationTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      };
    }
  } else if (typeof trigger === 'number') {
    // Validate seconds is positive
    if (trigger <= 0) {
      // Schedule immediately if delay is zero or negative
      notificationTrigger = null;
    } else {
      notificationTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: trigger,
        repeats: false,
      };
    }
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as Record<string, unknown>,
      sound: sound ? (typeof sound === 'string' ? sound : 'default') : undefined,
      badge,
    },
    trigger: notificationTrigger,
  });

  if (isDev) {
    console.log('[PushNotifications] Scheduled notification:', identifier);
  }

  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Dismiss all displayed notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Set badge count (iOS only)
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

/**
 * Get last notification response (for handling notification that opened app)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

/**
 * Push notifications service singleton
 */
export const pushNotifications = {
  initialize,
  requestPermissions,
  getPermissionStatus,
  getExpoPushToken,
  getDevicePushToken,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  dismissAllNotifications,
  setBadgeCount,
  getBadgeCount,
  getLastNotificationResponse,
};
