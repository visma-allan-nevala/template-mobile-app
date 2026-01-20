/**
 * Settings Tab Screen
 *
 * App settings and preferences.
 *
 * LLM Instructions:
 * - Add settings options as needed (theme, notifications, etc.)
 * - Logout functionality is already implemented
 * - Use useUserStore for preferences that persist
 */

import { View, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/user.store';
import { colors, spacing } from '@/core/theme';
import { config } from '@/core/config';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { preferences, updatePreferences } = useUserStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const toggleNotifications = () => {
    updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled });
  };

  return (
    <Container>
      <Header title="Settings" />
      <View style={styles.content}>
        {/* Preferences Section */}
        <Text variant="label" color="secondary" style={styles.sectionTitle}>
          PREFERENCES
        </Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.light.text} />
              <Text variant="body" style={styles.settingText}>
                Notifications
              </Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={22} color={colors.light.text} />
              <Text variant="body" style={styles.settingText}>
                Theme
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text variant="body" color="secondary">
                {preferences.themeMode.charAt(0).toUpperCase() + preferences.themeMode.slice(1)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </View>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={22} color={colors.light.text} />
              <Text variant="body" style={styles.settingText}>
                Language
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text variant="body" color="secondary">
                English
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </View>
          </Pressable>
        </Card>

        {/* About Section */}
        <Text variant="label" color="secondary" style={styles.sectionTitle}>
          ABOUT
        </Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <Text variant="body">Version</Text>
            <Text variant="body" color="secondary">
              {config.app.version}
            </Text>
          </View>
        </Card>

        {/* Logout Button */}
        <Button variant="outline" fullWidth onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: spacing.sm,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
  logoutButton: {
    marginTop: spacing.xl,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
  },
});
