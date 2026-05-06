'use client';

import { useEffect, useState } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';
import type { Message, WsServerEvent } from '../types';

export function usePresence(): Record<string, boolean> {
  const { onMessage } = useWebSocketContext();
  const [presence, setPresence] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = onMessage((event: WsServerEvent) => {
      if (event.event === 'user.online') {
        setPresence((p) => ({ ...p, [event.user_id]: true }));
      } else if (event.event === 'user.offline') {
        setPresence((p) => ({ ...p, [event.user_id]: false }));
      }
    });
    return unsub;
  }, [onMessage]);

  return presence;
}

// Server sends message.receive FLAT — reconstruct a Message object from top-level fields
export function useIncomingMessages(onReceive: (msg: Message) => void) {
  const { onMessage } = useWebSocketContext();

  useEffect(() => {
    const unsub = onMessage((event: WsServerEvent) => {
      if (event.event === 'message.receive') {
        // Reconstruct Message from flat WS event fields
        const msg: Message = {
          id: event.id,
          from_user_id: event.from_user_id,
          to_user_id: event.to_user_id,
          payload: event.payload,
          delivered: true,
          created_at: event.created_at,
        };
        onReceive(msg);
      }
    });
    return unsub;
  }, [onMessage, onReceive]);
}

export function useConnectionStatus() {
  const { status } = useWebSocketContext();
  return status;
}