/**
 * User Service
 *
 * Business logic for user profile operations.
 *
 * Usage:
 *   import { userService } from '@services/user.service';
 *   await userService.fetchProfile();
 *   await userService.updateProfile({ displayName: 'New Name' });
 */

import { userApi } from '@api/endpoints/user';
import { useUserStore } from '@store/user.store';
import { useAuthStore } from '@store/auth.store';
import type { UpdateProfileRequest } from '@api/types';

export const userService = {
  fetchProfile: async (): Promise<void> => {
    const userStore = useUserStore.getState();
    const authStore = useAuthStore.getState();

    userStore.setLoading(true);

    try {
      const profile = await userApi.getProfile();

      // Update user store with profile data
      userStore.setProfile({
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });

      // Also update auth store user if needed
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        });
      }
    } finally {
      userStore.setLoading(false);
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    const userStore = useUserStore.getState();
    const authStore = useAuthStore.getState();

    userStore.setLoading(true);

    try {
      const updatedProfile = await userApi.updateProfile(data);

      userStore.setProfile({
        displayName: updatedProfile.displayName,
        avatarUrl: updatedProfile.avatarUrl,
      });

      // Also update auth store user
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          displayName: updatedProfile.displayName,
          avatarUrl: updatedProfile.avatarUrl,
        });
      }
    } finally {
      userStore.setLoading(false);
    }
  },
};
