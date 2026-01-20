/**
 * Home Screen (Entry Point)
 *
 * The initial landing screen. Redirects based on auth state.
 *
 * LLM Instructions:
 * - This screen checks auth state and redirects accordingly
 * - Authenticated users go to (tabs)
 * - Unauthenticated users go to (auth)/login
 */

import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/core/theme';
import { useAuthStore } from '@/store/auth.store';
import { Text } from '@/components/ui/Text';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Short delay to prevent flash
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="body" color="secondary" style={styles.text}>
        Loading...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  text: {
    marginTop: 16,
  },
});
