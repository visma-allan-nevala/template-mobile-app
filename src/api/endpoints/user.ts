/**
 * User API Endpoints
 *
 * API calls for user-related operations.
 *
 * Usage:
 *   import { userApi } from '@api/endpoints/user';
 *   const profile = await userApi.getProfile();
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '@core/constants';
import type { UpdateProfileRequest, UserProfileResponse } from '../types';

export const userApi = {
  getProfile: (): Promise<UserProfileResponse> =>
    apiClient.get<UserProfileResponse>(API_ENDPOINTS.USER.PROFILE),

  updateProfile: (data: UpdateProfileRequest): Promise<UserProfileResponse> =>
    apiClient.patch<UserProfileResponse>(API_ENDPOINTS.USER.UPDATE, data),
};
