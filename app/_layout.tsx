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
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppStore } from '@/store/app.store';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setAppReady } = useAppStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Add any async initialization here:
        // - Load fonts
        // - Fetch initial data
        // - Check auth state

        // Example font loading:
        // await Font.loadAsync({
        //   'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
        // });
      } catch (error) {
        console.error('App initialization error:', error);
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
