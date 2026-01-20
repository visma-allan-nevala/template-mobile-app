/**
 * Container Component
 *
 * Main layout container with safe area handling and consistent padding.
 *
 * Usage:
 *   <Container>
 *     <Text>Screen content</Text>
 *   </Container>
 *   <Container safeArea={false} centered>
 *     <Text>Centered content</Text>
 *   </Container>
 */

import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@core/theme';

interface ContainerProps {
  children: React.ReactNode;
  safeArea?: boolean;
  centered?: boolean;
  padding?: boolean;
  style?: ViewStyle;
}

export function Container({
  children,
  safeArea = true,
  centered = false,
  padding = true,
  style,
}: ContainerProps) {
  const containerStyles = [
    styles.base,
    padding && styles.padding,
    centered && styles.centered,
    style,
  ];

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <View style={containerStyles}>{children}</View>
      </SafeAreaView>
    );
  }

  return <View style={containerStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  base: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  padding: {
    paddingHorizontal: spacing.md,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
