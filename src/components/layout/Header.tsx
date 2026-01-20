/**
 * Header Component
 *
 * Screen header with title and optional back button.
 *
 * Usage:
 *   <Header title="Profile" />
 *   <Header title="Settings" showBack onBack={() => router.back()} />
 */

import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@core/theme';
import { Text } from '../ui/Text';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, onBack, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.light.text} />
          </Pressable>
        )}
      </View>
      <View style={styles.center}>
        <Text variant="subtitle" style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    minHeight: 56,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
});
