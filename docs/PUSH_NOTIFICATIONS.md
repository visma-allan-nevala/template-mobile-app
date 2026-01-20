# Push Notifications

## Prerequisites

| Requirement | Purpose |
|-------------|---------|
| EAS Build (dev client) | Expo Go doesn't support push |
| Firebase project | Android FCM |
| Apple Developer account | iOS APNs |

## Setup

### Android (Firebase)

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Add Android app with your package name
3. Download `google-services.json` → project root

### iOS (APNs)

1. Create APNs key at [Apple Developer Portal](https://developer.apple.com)
2. Upload to Expo: `eas credentials`

### app.config.ts (already configured)

```typescript
plugins: [
  ['expo-notifications', {
    icon: './assets/images/notification-icon.png',
    color: '#ffffff',
  }],
],
```

## Usage

### Initialize (app/_layout.tsx)

```typescript
import { initializeApp } from '@services/app-initialization';

useEffect(() => {
  initializeApp(); // Handles notification setup
}, []);
```

### Request Permissions

```typescript
import { pushNotifications } from '@services/notifications';

const status = await pushNotifications.requestPermissions();
if (status === 'granted') {
  const token = await pushNotifications.getExpoPushToken();
  // Token sent to backend automatically by app-initialization
}
```

### Handle Navigation

```typescript
// src/services/notifications/notification-handler.ts
const NOTIFICATION_ROUTES: Record<string, string> = {
  'new_message': '/(tabs)/messages',
  'order_update': '/(tabs)/orders/[id]',
};

export function handleNotificationData(data: PushNotificationData) {
  const route = NOTIFICATION_ROUTES[data.type];
  if (route) router.push({ pathname: route, params: { id: data.entityId } });
}
```

### Schedule Local Notification

```typescript
await pushNotifications.scheduleNotification({
  title: 'Reminder',
  body: 'Check your tasks',
  trigger: new Date(Date.now() + 3600000), // 1 hour
  data: { type: 'reminder' },
});
```

## Backend (Send Push)

```typescript
// Node.js with expo-server-sdk
import { Expo } from 'expo-server-sdk';

const expo = new Expo();
await expo.sendPushNotificationsAsync([{
  to: 'ExponentPushToken[xxxxx]',
  title: 'New Message',
  body: 'From John',
  data: { type: 'new_message', entityId: 'msg-123' },
}]);
```

## Payload Structure

```typescript
interface PushNotificationData {
  type?: string;      // Maps to NOTIFICATION_ROUTES
  url?: string;       // Direct deep link
  entityId?: string;  // For dynamic routes
}
```

## Testing

```bash
# Build dev client
eas build --profile development-device --platform ios

# Send test via Expo tool: https://expo.dev/notifications
```

Local test:
```typescript
await pushNotifications.scheduleNotification({
  title: 'Test',
  body: 'Test notification',
  trigger: null, // Immediate
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Token is null | Use physical device, check permissions |
| Not showing | Check notification channel (Android), DND mode |
| Deep link fails | Verify URL scheme in app.config.ts |

## Key Files

| File | Purpose |
|------|---------|
| `src/services/notifications/push-notifications.ts` | Permission + token handling |
| `src/services/notifications/notification-handler.ts` | Foreground/background handlers |
| `src/services/app-initialization.ts` | Auto-registers token with backend |
