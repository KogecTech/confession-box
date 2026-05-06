'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getMessages } from '../lib/api/messages';
import { decryptMessage } from '../lib/crypto/decrypt';
import type { DecryptedMessage, Message } from '../types';
import { useAuth } from './useAuth';

function toDecrypted(msg: Message, myId: string): Promise<DecryptedMessage> {
  const isSentByMe = msg.from_user_id === myId;
  return decryptMessage(msg.payload, isSentByMe)
    .then((plaintext) => ({ ...msg, plaintext, decryptionFailed: false }))
    .catch(() => ({ ...msg, plaintext: '', decryptionFailed: true }));
}

export function useMessages(userId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Oldest message timestamp used as the `before` cursor for pagination
  const oldestTimestamp = useRef<string | undefined>(undefined);

  const loadInitial = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setMessages([]);
    oldestTimestamp.current = undefined;
    setHasMore(true);
    try {
      const raw = await getMessages(userId, 50);
      // API returns newest first — reverse so UI shows oldest at top
      const decrypted = await Promise.all(raw.map((m) => toDecrypted(m, user.id)));
      setMessages(decrypted.reverse());
      setHasMore(raw.length === 50);
      oldestTimestamp.current = raw[raw.length - 1]?.created_at;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    (async () => {
      await loadInitial();
    })();
  }, [loadInitial]);

  // Load older messages (pagination — prepend without scroll-jump)
  const loadMore = useCallback(async () => {
    if (!user || isLoadingMore || !hasMore || !oldestTimestamp.current) return;
    setIsLoadingMore(true);
    try {
      const raw = await getMessages(userId, 50, oldestTimestamp.current);
      const decrypted = await Promise.all(raw.map((m) => toDecrypted(m, user.id)));
      setMessages((prev) => [...decrypted.reverse(), ...prev]);
      setHasMore(raw.length === 50);
      oldestTimestamp.current = raw[raw.length - 1]?.created_at;
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, user, isLoadingMore, hasMore]);

  // Called by WebSocket handler when a new message arrives
  const appendIncoming = useCallback(
    async (msg: Message) => {
      if (!user) return;
      const decrypted = await toDecrypted(msg, user.id);
      setMessages((prev) => [...prev, decrypted]);
    },
    [user],
  );

  // Optimistic send — add to UI immediately before server confirms
  const appendOptimistic = useCallback((msg: DecryptedMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    appendIncoming,
    appendOptimistic,
  };
}