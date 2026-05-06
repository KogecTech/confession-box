'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  connect,
  disconnect,
  sendWsMessage,
  onMessage,
  onStatusChange,
  configureSocketCallbacks,
} from '../lib/websocket/socket';
import { useAuth } from './AuthContext';
import { refreshToken as apiRefresh } from '../lib/api/auth';
import { setAccessToken } from '../lib/api/client';
import { setRefreshToken } from '../lib/utils/storage';
import type { WsServerEvent, WsSendPayload } from '../types';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface WebSocketContextValue {
  status: ConnectionStatus;
  send: (payload: WsSendPayload) => void;
  onMessage: (handler: (event: WsServerEvent) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken, logout } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // Wire up the token-refresh + auth-failed callbacks so socket.ts
  // can trigger auth flows without importing React context
  useEffect(() => {
    configureSocketCallbacks({
      onTokenExpired: async () => {
        try {
          const data = await apiRefresh();
          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token);
          return data.access_token;
        } catch {
          return null;
        }
      },
      onAuthFailed: () => {
        logout();
      },
    });
  }, [logout]);

  // Connect when authenticated, disconnect on logout
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect(accessToken);
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken]);

  // Mirror socket status into React state for consumers
  useEffect(() => {
    const unsub = onStatusChange(setStatus);
    return unsub;
  }, []);

  const send = useCallback((payload: WsSendPayload) => {
    sendWsMessage(payload);
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, send, onMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketContext must be used inside <WebSocketProvider>');
  return ctx;
}