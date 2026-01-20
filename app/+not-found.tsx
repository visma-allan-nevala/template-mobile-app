/**
 * 404 Not Found Screen
 *
 * Displayed when a route doesn't exist.
 */

import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, spacing } from '@/core/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text variant="title" center>
        404
      </Text>
      <Text variant="body" color="secondary" center style={styles.message}>
        This page doesn&apos;t exist.
      </Text>
      <Link href="/" asChild>
        <Button style={styles.button}>Go Home</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    padding: spacing.lg,
  },
  message: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 150,
  },
});
