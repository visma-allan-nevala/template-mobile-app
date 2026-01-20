/**
 * Profile Tab Screen
 *
 * User profile display and edit functionality.
 *
 * LLM Instructions:
 * - Displays user information from auth store
 * - Add profile editing functionality as needed
 * - Consider adding avatar upload feature
 */

import { View, StyleSheet, Image } from 'react-native';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { colors, spacing } from '@/core/theme';
import { formatDate } from '@/utils/formatting';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <Container>
      <Header title="Profile" />
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text variant="title" color="white">
                {(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text variant="title" style={styles.name}>
            {user?.displayName || user?.username}
          </Text>
          <Text variant="body" color="secondary">
            @{user?.username}
          </Text>
        </View>

        {/* Info Card */}
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text variant="label" color="secondary">
              Email
            </Text>
            <Text variant="body">{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="label" color="secondary">
              Member Since
            </Text>
            <Text variant="body">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</Text>
          </View>
        </Card>

        {/* Actions */}
        <Button variant="outline" fullWidth style={styles.button}>
          Edit Profile
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
  button: {
    marginTop: spacing.sm,
  },
});
