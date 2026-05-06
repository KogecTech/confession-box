// Refresh token lives in sessionStorage (not localStorage).
// It's cleared when the tab closes — intentional security trade-off.
const REFRESH_TOKEN_KEY = 'wb_rt';

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}