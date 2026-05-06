'use client';

// ============================================================
// Confession Box — AuthContext
// Manages: currentUser, accessToken (memory only), isAuthenticated
// Coordinates login/register crypto flows + token refresh scheduling.
// ============================================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { AuthState, User } from '../types';
import { setAccessToken } from '../lib/api/client';
import { setRefreshToken, getRefreshToken, clearRefreshToken } from '../lib/utils/storage';
import { clearPrivateKey, setPrivateKey } from '../lib/crypto/session';
import {
  generateKeyPair,
  generateSalt,
  deriveWrappingKey,
  wrapPrivateKey,
  exportPublicKey,
  unwrapPrivateKey,
} from '../lib/crypto/keys';
import { register as apiRegister, login as apiLogin, logout as apiLogout, refreshToken as apiRefresh } from '../lib/api/auth';
import { TOKEN_REFRESH_AT_MS } from '../lib/utils/constants';

// ── State & Actions ──────────────────────────────────────────

type Action =
  | { type: 'SET_AUTH'; user: User; accessToken: string }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_LOADING'; loading: boolean };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_AUTH':
      return { user: action.user, accessToken: action.accessToken, isAuthenticated: true, isLoading: false };
    case 'CLEAR_AUTH':
      return { user: null, accessToken: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
};

// ── Context ──────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  register: (username: string, displayName: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleRefresh() {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await apiRefresh();
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        dispatch({ type: 'SET_AUTH', user: data.user, accessToken: data.access_token });
        scheduleRefresh(); // reschedule
      } catch {
        await handleLogout();
      }
    }, TOKEN_REFRESH_AT_MS);
  }

  async function handleLogout() {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await apiLogout().catch(() => {});
    setAccessToken(null);
    clearRefreshToken();
    clearPrivateKey();
    dispatch({ type: 'CLEAR_AUTH' });
  }

  // On mount: check if a refresh token exists and restore session
  useEffect(() => {
    const rt = getRefreshToken();
    if (!rt) return;
    // We have a refresh token but no access token in memory — try to restore
    // This handles page reloads: the private key is gone so we redirect to login
    // (user must re-enter password to unwrap private key — by design)
    // Just clear — user must log in again
    clearRefreshToken();
  }, []);

  const register = useCallback(
    async (username: string, displayName: string, password: string) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        // 1. Generate RSA keypair
        const keyPair = await generateKeyPair();
        // 2. Generate PBKDF2 salt
        const salt = generateSalt();
        // 3. Derive AES-KW wrapping key from password + salt
        const wrappingKey = await deriveWrappingKey(password, salt);
        // 4. Wrap the private key
        const wrappedPrivateKey = await wrapPrivateKey(keyPair.privateKey, wrappingKey);
        // 5. Export public key as base64
        const publicKey = await exportPublicKey(keyPair.publicKey);

        // 6. Register with server
        const data = await apiRegister({
          username,
          display_name: displayName,
          password,
          public_key: publicKey,
          wrapped_private_key: wrappedPrivateKey,
          pbkdf2_salt: salt,
        });

        // 7. Store private key in memory for the session
        setPrivateKey(keyPair.privateKey);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        dispatch({ type: 'SET_AUTH', user: data.user, accessToken: data.access_token });
        scheduleRefresh();
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const login = useCallback(async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const data = await apiLogin(username, password);

      // Re-derive the AES-KW wrapping key and unwrap the private key into memory
      const wrappingKey = await deriveWrappingKey(password, data.user.pbkdf2_salt);
      const privateKey = await unwrapPrivateKey(data.user.wrapped_private_key, wrappingKey);

      // Store private key in memory (never touches storage)
      setPrivateKey(privateKey);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      dispatch({ type: 'SET_AUTH', user: data.user, accessToken: data.access_token });
      scheduleRefresh();
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}