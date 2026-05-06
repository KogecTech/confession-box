export interface User {
  id: string;
  username: string;
  display_name: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
}

export interface MessagePayload {
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  payload: MessagePayload;
  delivered: boolean;
  created_at: string;
}

export interface Conversation {
  user_id: string;
  display_name: string;
  username: string;
  last_message_at: string;
}

export interface DecryptedMessage {
  id: string;
  from_user_id: string;
  to_user_id: string;
  delivered: boolean;
  created_at: string;
  plaintext: string;
  decryptionFailed: boolean;
}

// ── WebSocket event shapes ──────────────────────────────────
// IMPORTANT: server sends message.receive FLAT — fields are at
// the top level, NOT nested under a "message" key.
export interface WsMessageReceiveEvent {
  event: 'message.receive';
  id: string;
  from_user_id: string;
  to_user_id: string;
  payload: MessagePayload;
  created_at: string;
}

export interface WsPresenceEvent {
  event: 'user.online' | 'user.offline';
  user_id: string;
}

export interface WsErrorEvent {
  event: 'error';
  detail: string;
}

export type WsServerEvent = WsMessageReceiveEvent | WsPresenceEvent | WsErrorEvent;

export interface WsSendPayload {
  event: 'message.send';
  to: string;
  payload: MessagePayload;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}