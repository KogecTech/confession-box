// ============================================================
// WhisperBox — WebSocket Manager
//
// Single shared connection. Handles:
//   - Connect / disconnect
//   - Auth token in query string (browsers can't set WS headers)
//   - Reconnect with exponential backoff on unexpected close
//   - Token refresh on close code 4001
//   - Hard redirect on close code 4003
//   - Event listener registration for UI layers
// ============================================================

import { WS_URL } from '../utils/constants';
import type { WsServerEvent, WsSendPayload } from '../../types';

type EventHandler = (event: WsServerEvent) => void;
type StatusHandler = (status: 'connected' | 'disconnected' | 'reconnecting') => void;

let ws: WebSocket | null = null;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let destroyed = false;

const messageHandlers = new Set<EventHandler>();
const statusHandlers = new Set<StatusHandler>();

// Callbacks injected by the app so socket.ts doesn't import AuthContext
let onTokenExpired: (() => Promise<string | null>) | null = null;
let onAuthFailed: (() => void) | null = null;

export function configureSocketCallbacks(callbacks: {
  onTokenExpired: () => Promise<string | null>;
  onAuthFailed: () => void;
}) {
  onTokenExpired = callbacks.onTokenExpired;
  onAuthFailed = callbacks.onAuthFailed;
}

function notifyStatus(status: 'connected' | 'disconnected' | 'reconnecting') {
  statusHandlers.forEach((h) => h(status));
}

export function connect(token: string) {
  destroyed = false;
  if (ws && ws.readyState === WebSocket.OPEN) return;
  if (ws) ws.close();

  ws = new WebSocket(`${WS_URL}?token=${token}`);

  ws.onopen = () => {
    reconnectAttempt = 0;
    notifyStatus('connected');
  };

  ws.onmessage = (e) => {
    try {
      const event: WsServerEvent = JSON.parse(e.data);
      messageHandlers.forEach((h) => h(event));
    } catch {
      console.error('[WS] Failed to parse message', e.data);
    }
  };

  ws.onclose = async (e) => {
    ws = null;
    if (destroyed) return;

    if (e.code === 4001) {
      // Token expired — request a refresh, then reconnect
      notifyStatus('reconnecting');
      const newToken = await onTokenExpired?.();
      if (newToken) {
        connect(newToken);
      } else {
        onAuthFailed?.();
      }
      return;
    }

    if (e.code === 4003) {
      // Token tampered / invalid — go to login immediately
      onAuthFailed?.();
      return;
    }

    // Unexpected close — exponential backoff (max 30s)
    const delay = Math.min(1000 * 2 ** reconnectAttempt, 30_000);
    reconnectAttempt++;
    notifyStatus('reconnecting');
    reconnectTimer = setTimeout(() => {
      if (!destroyed) connect(token);
    }, delay);
  };

  ws.onerror = () => {
    // onclose fires after onerror, so we handle reconnect there
  };
}

export function disconnect() {
  destroyed = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
  notifyStatus('disconnected');
}

export function sendWsMessage(payload: WsSendPayload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket not connected');
  }
  ws.send(JSON.stringify(payload));
}

export function onMessage(handler: EventHandler): () => void {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export function onStatusChange(handler: StatusHandler): () => void {
  statusHandlers.add(handler);
  return () => statusHandlers.delete(handler);
}

export function getReadyState(): number {
  return ws?.readyState ?? WebSocket.CLOSED;
}