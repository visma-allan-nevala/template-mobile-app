/**
 * Home Tab Screen
 *
 * The main home screen after authentication.
 *
 * LLM Instructions:
 * - This is the default tab when entering the app
 * - Add your main app content here
 * - Uses SafeAreaView via Container component
 */

import { View, StyleSheet } from 'react-native';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth.store';
import { spacing } from '@/core/theme';

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <Container>
      <Header title="Home" />
      <View style={styles.content}>
        <Text variant="title" style={styles.greeting}>
          Hello, {user?.displayName || user?.username || 'User'}!
        </Text>

        <Card style={styles.card}>
          <Text variant="subtitle">Welcome to Template Mobile App</Text>
          <Text variant="body" color="secondary" style={styles.cardText}>
            This is your home screen. Start building your app from here.
          </Text>
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text variant="subtitle">Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text variant="title">0</Text>
              <Text variant="caption" color="secondary">
                Items
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="title">0</Text>
              <Text variant="caption" color="secondary">
                Tasks
              </Text>
            </View>
            <View style={styles.stat}>
              <Text variant="title">0</Text>
              <Text variant="caption" color="secondary">
                Messages
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardText: {
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
});
