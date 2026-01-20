/**
 * Root Layout
 *
 * The root layout for the entire app.
 * Sets up providers, fonts, and global error handling.
 *
 * LLM Instructions:
 * - Add global providers here (theme, auth context, etc.)
 * - ErrorBoundary catches crashes and displays fallback UI
 * - SplashScreen is hidden after fonts/data are loaded
 * - App initialization runs on startup (auth, analytics, notifications)
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppStore } from '@/store/app.store';
import { initializeApp } from '@/services/app-initialization';
import { isDev } from '@/core/config';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setAppReady } = useAppStore();
  const [_initErrors, setInitErrors] = useState<string[]>([]);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize all app services
        const result = await initializeApp();

        if (!result.success) {
          setInitErrors(result.errors);
          if (isDev) {
            console.error('[RootLayout] Initialization errors:', result.errors);
          }
        }

        if (result.warnings.length > 0 && isDev) {
          console.warn('[RootLayout] Initialization warnings:', result.warnings);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setInitErrors([message]);
        if (isDev) {
          console.error('[RootLayout] App initialization error:', error);
        }
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [setAppReady]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
