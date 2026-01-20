/**
 * Auth Layout
 *
 * Layout for authentication screens (login, register).
 * These screens are shown before the user is authenticated.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
