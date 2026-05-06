'use client';

import { use, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMessages } from '../../../../hooks/useMessages';
import { useAuth } from '../../../../hooks/useAuth';
import { useIncomingMessages, usePresence } from '../../../../hooks/useWebSocket';
import { useWebSocketContext } from '../../../../context/WebSocketContext';
import { getUserPublicKey } from '../../../../lib/api/users';
import { encryptMessage } from '../../../../lib/crypto/encrypt';
import { getPrivateKey } from '../../../../lib/crypto/session';
import { MessageThread } from '../../../../components/messages/MessageThread';
import { MessageInput } from '../../../../components/messages/MessageInput';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';
import { EncryptionBadge } from '../../../../components/messages/EncryptionBadge';
import type { DecryptedMessage, Message } from '../../../../types';

interface Props { params: Promise<{ userId: string }>; }

export default function ConversationPage({ params }: Props) {
  const { userId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { send: wsSend, status } = useWebSocketContext();
  const presence = usePresence();

  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    appendIncoming,
    appendOptimistic,
  } = useMessages(userId);

  // Derive display name from the first message received from them
  const recipientName = useMemo(() => {
    return `User ${userId.slice(0, 8)}`;
  }, [userId]);

  // Wire incoming real-time messages
  const handleIncoming = useCallback((msg: Message) => {
    if (msg.from_user_id === userId) appendIncoming(msg);
  }, [userId, appendIncoming]);

  useIncomingMessages(handleIncoming);

  // Private key guard — if page reloaded, key is gone, must re-login
  useEffect(() => {
    if (!getPrivateKey()) router.replace('/login');
  }, [router]);

  async function handleSend(plaintext: string) {
    if (!user) return;
    const recipientPublicKey = await getUserPublicKey(userId);
    const payload = await encryptMessage(plaintext, recipientPublicKey, user.public_key);

    // Optimistic — show immediately before server confirms
    const optimistic: DecryptedMessage = {
      id: `opt-${Date.now()}`,
      from_user_id: user.id,
      to_user_id: userId,
      delivered: false,
      created_at: new Date().toISOString(),
      plaintext,
      decryptionFailed: false,
    };
    appendOptimistic(optimistic);

    if (status === 'connected') {
      wsSend({ event: 'message.send', to: userId, payload });
    } else {
      const { sendMessageHTTP } = await import('../../../../lib/api/messages');
      await sendMessageHTTP(userId, payload);
    }
  }

  const isOnline = !!presence[userId];

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-border/50 glass-card">
        {/* Back — mobile only */}
        <button
          onClick={() => router.push('/inbox')}
          className="w-10 h-10 rounded-xl flex items-center justify-center tap text-muted-foreground hover:text-foreground hover:bg-secondary/80 md:hidden shrink-0 transition-all duration-200"
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="relative shrink-0">
          <Avatar name={recipientName} size={44} className="ring-2 ring-primary/20 shadow-lg" />
          <div className="absolute -bottom-0.5 -right-0.5">
            <Badge online={isOnline} size={13} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-foreground text-[16px] leading-tight truncate">{recipientName}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-[#3ddc84] shadow-[0_0_8px_rgba(61,220,132,0.4)]' : 'bg-muted-foreground/40'}`} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 truncate">
              {isOnline ? 'Active Now' : 'Offline'}
              {status !== 'connected' && (
                 <span className="ml-1 text-primary animate-pulse">
                   · {status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'}
                 </span>
              )}
            </p>
          </div>
        </div>

        <EncryptionBadge compact />
      </header>

      {/* Messages — fills remaining space */}
      <MessageThread
        messages={messages}
        currentUserId={user?.id ?? ''}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      {/* Compose */}
      <MessageInput onSend={handleSend} disabled={!user} />
    </div>
  );
}