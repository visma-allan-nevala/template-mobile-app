/**
 * Notification Handler
 *
 * Handles notification navigation and actions based on notification data.
 * Customize this based on your app's notification types and navigation structure.
 *
 * Usage:
 *   import { notificationHandler } from '@services/notifications';
 *
 *   // Handle notification that opened the app
 *   notificationHandler.handleInitialNotification();
 *
 *   // Process notification data
 *   notificationHandler.handleNotificationData(notification.request.content.data);
 */

import { router } from 'expo-router';
import type { NotificationResponse, Notification } from 'expo-notifications';
import { isDev } from '@core/config';
import type { PushNotificationData } from './types';
import { pushNotifications } from './push-notifications';

/**
 * Notification type to route mapping
 * Add your notification types and corresponding routes here
 */
const NOTIFICATION_ROUTES: Record<string, string> = {
  // Example mappings - customize based on your app:
  // 'new_message': '/(tabs)/messages',
  // 'order_update': '/(tabs)/orders',
  // 'profile_update': '/(tabs)/profile',
};

/**
 * Handle notification received while app is in foreground
 */
export function handleForegroundNotification(notification: Notification): void {
  const data = notification.request.content.data as PushNotificationData;

  if (isDev) {
    console.log('[NotificationHandler] Foreground notification:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data,
    });
  }

  // You can show an in-app alert, update state, etc.
  // The notification will also show in the notification tray
  // based on setNotificationHandler configuration
}

/**
 * Handle notification response (user tapped notification)
 */
export function handleNotificationResponse(response: NotificationResponse): void {
  const data = response.notification.request.content.data as PushNotificationData;

  if (isDev) {
    console.log('[NotificationHandler] Notification response:', {
      actionIdentifier: response.actionIdentifier,
      data,
    });
  }

  // Handle the notification action
  handleNotificationData(data);
}

/**
 * Handle notification data and navigate accordingly
 */
export function handleNotificationData(data: PushNotificationData): void {
  if (!data) {
    return;
  }

  // Priority 1: Direct URL/deep link
  if (data.url) {
    if (isDev) {
      console.log('[NotificationHandler] Navigating to URL:', data.url);
    }
    router.push(data.url as never);
    return;
  }

  // Priority 2: Notification type routing
  if (data.type && NOTIFICATION_ROUTES[data.type]) {
    const route = NOTIFICATION_ROUTES[data.type];
    const params = data.entityId ? { id: data.entityId } : undefined;

    if (isDev) {
      console.log('[NotificationHandler] Navigating to route:', route, params);
    }

    if (params) {
      router.push({ pathname: route as never, params });
    } else {
      router.push(route as never);
    }
    return;
  }

  if (isDev) {
    console.log('[NotificationHandler] No navigation action for notification data:', data);
  }
}

/**
 * Check and handle notification that opened the app
 * Call this during app initialization
 */
export async function handleInitialNotification(): Promise<void> {
  const response = await pushNotifications.getLastNotificationResponse();

  if (response) {
    if (isDev) {
      console.log('[NotificationHandler] App opened from notification');
    }
    handleNotificationResponse(response);
  }
}

/**
 * Register notification handlers with push notifications service
 */
export function registerHandlers(): void {
  pushNotifications.initialize(
    {
      showInForeground: true,
    },
    {
      onNotificationReceived: handleForegroundNotification,
      onNotificationResponse: handleNotificationResponse,
      onPushTokenUpdated: (token) => {
        if (isDev) {
          console.log('[NotificationHandler] Push token updated:', token);
        }
        // TODO: Send token to your backend
        // await api.registerPushToken(token);
      },
    }
  );
}

/**
 * Notification handler singleton
 */
export const notificationHandler = {
  handleForegroundNotification,
  handleNotificationResponse,
  handleNotificationData,
  handleInitialNotification,
  registerHandlers,
};
