// ============================================================
// Confession Box — Auth API
// ============================================================

import { apiClient } from './client';
import { getRefreshToken } from '../utils/storage';
import type { AuthResponse, User } from '../../types';
import { BASE_URL } from '../utils/constants';

export interface RegisterPayload {
  username: string;
  display_name: string;
  password: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail ?? 'Registration failed');
  }
  return res.json();
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(err.detail ?? 'Invalid credentials');
  }
  return res.json();
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  await apiClient('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).catch(() => {
    // Best-effort — clear local state regardless
  });
}

export async function refreshToken(): Promise<AuthResponse> {
  const rt = getRefreshToken();
  if (!rt) throw new Error('No refresh token');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  return res.json();
}

export async function getMe(): Promise<User> {
  return apiClient<User>('/auth/me');
}