import { apiClient } from './client';
import type { Conversation, Message, MessagePayload } from '../../types';

export async function getConversations(): Promise<Conversation[]> {
  return apiClient('/conversations');
}

export async function getMessages(
  userId: string,
  limit = 50,
  before?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  return apiClient(`/conversations/${userId}/messages?${params}`);
}

// HTTP fallback — use WebSocket send when connected
export async function sendMessageHTTP(
  to: string,
  payload: MessagePayload,
): Promise<Message> {
  return apiClient('/messages', {
    method: 'POST',
    body: JSON.stringify({ to, payload }),
  });
}