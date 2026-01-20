/**
 * Card Component
 *
 * Container component with shadow and rounded corners.
 *
 * Usage:
 *   <Card>
 *     <Text>Card content</Text>
 *   </Card>
 *   <Card variant="outlined" padding="lg">
 *     <Text>Outlined card</Text>
 *   </Card>
 */

import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@core/theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const cardStyles = [styles.base, styles[variant], styles[`padding_${padding}`], style];

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [cardStyles, pressed && styles.pressed]} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filled: {
    backgroundColor: colors.light.surface,
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: spacing.md,
  },
  padding_lg: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
});
