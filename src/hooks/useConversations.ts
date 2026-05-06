'use client';

import { useEffect, useState, useCallback } from 'react';
import { getConversations } from '../lib/api/messages';
import type { Conversation } from '../types';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetch();
    })();
  }, [fetch]);

  // Call this after sending a message to bump the conversation to the top
  const refresh = useCallback(() => fetch(), [fetch]);

  return { conversations, isLoading, error, refresh };
}