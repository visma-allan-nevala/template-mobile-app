# Push Notifications Setup Guide

This guide explains how to configure push notifications for your mobile app using `expo-notifications`.

## Overview

The template includes a complete push notification infrastructure:
- Permission handling
- Push token management
- Foreground/background notification handling
- Local notification scheduling
- Deep link navigation from notifications

## Prerequisites

1. **EAS Build**: Push notifications require a development build (not Expo Go)
2. **Firebase Project**: Required for Android FCM
3. **Apple Developer Account**: Required for iOS APNs

## Setup Steps

### 1. Firebase Configuration (Android)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add an Android app with your package name
3. Download `google-services.json`
4. Place it in your project root

```bash
# Project structure
template-mobile-app/
├── google-services.json  # Add here
├── app.config.ts
└── ...
```

### 2. Apple Push Notification Service (iOS)

1. Create an APNs key in [Apple Developer Portal](https://developer.apple.com)
2. Upload the key to Expo: `eas credentials`
3. Or configure in EAS dashboard

### 3. Configure app.config.ts

The template already includes notification plugin configuration:

```typescript
plugins: [
  [
    'expo-notifications',
    {
      icon: './assets/images/notification-icon.png',
      color: '#ffffff',
      sounds: [],
    },
  ],
],
```

### 4. Create Notification Icon (Android)

Create a notification icon for Android:
- Size: 96x96 pixels
- Format: PNG with transparency
- Color: White only (system tints it)
- Location: `assets/images/notification-icon.png`

## Usage

### Initialize Notifications

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { notificationHandler, pushNotifications } from '@services/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Register notification handlers
    notificationHandler.registerHandlers();

    // Handle notification that opened the app
    notificationHandler.handleInitialNotification();

    // Request permissions (optional - can defer to user action)
    // pushNotifications.requestPermissions();
  }, []);

  return <Slot />;
}
```

### Request Permissions

```typescript
import { pushNotifications } from '@services/notifications';

async function requestNotificationPermission() {
  const status = await pushNotifications.requestPermissions();

  if (status === 'granted') {
    const token = await pushNotifications.getExpoPushToken();
    console.log('Push token:', token);

    // Send token to your backend
    await api.registerPushToken(token);
  }
}
```

### Handle Notification Navigation

Customize `notification-handler.ts` to handle your notification types:

```typescript
// src/services/notifications/notification-handler.ts

const NOTIFICATION_ROUTES: Record<string, string> = {
  'new_message': '/(tabs)/messages',
  'order_update': '/(tabs)/orders/[id]',
  'profile_update': '/(tabs)/profile',
};

export function handleNotificationData(data: PushNotificationData): void {
  if (data.type && NOTIFICATION_ROUTES[data.type]) {
    const route = NOTIFICATION_ROUTES[data.type];
    router.push({
      pathname: route,
      params: data.entityId ? { id: data.entityId } : undefined,
    });
  }
}
```

### Schedule Local Notifications

```typescript
import { pushNotifications } from '@services/notifications';

// Schedule for specific time
await pushNotifications.scheduleNotification({
  title: 'Reminder',
  body: 'Don\'t forget to check your tasks!',
  trigger: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  data: { type: 'reminder' },
});

// Schedule after delay
await pushNotifications.scheduleNotification({
  title: 'Welcome!',
  body: 'Thanks for signing up',
  trigger: 5, // 5 seconds from now
});
```

### Send Push Notifications (Backend)

Use Expo's push notification service:

```typescript
// Backend example (Node.js)
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const messages = [{
  to: 'ExponentPushToken[xxxxx]',
  title: 'New Message',
  body: 'You have a new message from John',
  data: {
    type: 'new_message',
    entityId: 'message-123',
    url: '/(tabs)/messages/message-123',
  },
}];

const chunks = expo.chunkPushNotifications(messages);
for (const chunk of chunks) {
  await expo.sendPushNotificationsAsync(chunk);
}
```

## Notification Payload Structure

```typescript
interface PushNotificationData {
  // Route to navigate to
  type?: string;     // Maps to NOTIFICATION_ROUTES
  url?: string;      // Direct deep link

  // Entity context
  entityId?: string; // ID for dynamic routes

  // Custom data
  [key: string]: unknown;
}
```

## Testing

### Test on Physical Device

```bash
# Build development client
eas build --profile development-device --platform ios

# Or Android
eas build --profile development-device --platform android
```

### Send Test Notification

Use [Expo Push Notification Tool](https://expo.dev/notifications):
1. Enter your ExpoPushToken
2. Set title and body
3. Add custom data JSON
4. Send!

### Simulate in Development

```typescript
// Trigger local notification for testing
await pushNotifications.scheduleNotification({
  title: 'Test Notification',
  body: 'This is a test',
  trigger: null, // Immediate
  data: { type: 'test' },
});
```

## Troubleshooting

### "Push token is null"

- Ensure you're on a physical device
- Check that permissions are granted
- Verify Firebase/APNs configuration

### Notifications not showing

- Check notification channel (Android)
- Verify app is not in Do Not Disturb
- Check notification settings in device Settings

### Deep link not working

- Verify URL scheme in app.config.ts
- Check NOTIFICATION_ROUTES mapping
- Test deep link with `npx uri-scheme open`

## Best Practices

1. **Request permissions contextually**: Don't request on app launch; wait until relevant feature
2. **Handle token refresh**: Tokens can change; listen for updates
3. **Graceful degradation**: App should work without push permissions
4. **Test both platforms**: iOS and Android have different behaviors
5. **Monitor delivery**: Use Expo's notification receipts to track delivery

## Resources

- [expo-notifications docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
