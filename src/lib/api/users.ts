import { apiClient } from './client';
import type { User } from '../../types';

export async function searchUsers(query: string): Promise<Pick<User, 'id' | 'username' | 'display_name'>[]> {
  return apiClient(`/users/search?q=${encodeURIComponent(query)}`);
}

export async function getUserPublicKey(userId: string): Promise<string> {
  const data = await apiClient<{ public_key: string }>(`/users/${userId}/public-key`);
  return data.public_key;
}