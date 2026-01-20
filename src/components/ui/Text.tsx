/**
 * Text Component
 *
 * Themed text component with predefined variants.
 *
 * Usage:
 *   <Text>Regular text</Text>
 *   <Text variant="title">Page Title</Text>
 *   <Text variant="body" color="secondary">Muted text</Text>
 */

import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { colors, typography } from '@core/theme';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';
type TextColor = 'primary' | 'secondary' | 'error' | 'success' | 'white';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  bold?: boolean;
  center?: boolean;
  style?: TextStyle;
}

export function Text({
  children,
  variant = 'body',
  color = 'primary',
  bold = false,
  center = false,
  style,
  ...props
}: TextProps) {
  const textStyles = [
    styles.base,
    styles[variant],
    styles[`color_${color}`],
    bold && styles.bold,
    center && styles.center,
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.light.text,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
  },
  body: {
    fontSize: typography.fontSize.md,
    fontWeight: '400',
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
  },
  color_primary: {
    color: colors.light.text,
  },
  color_secondary: {
    color: colors.light.textSecondary,
  },
  color_error: {
    color: colors.error,
  },
  color_success: {
    color: colors.success,
  },
  color_white: {
    color: colors.white,
  },
  bold: {
    fontWeight: '700',
  },
  center: {
    textAlign: 'center',
  },
});
