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
    <div className="flex flex-col h-dvh overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 sm:px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid #2a2a33', background: '#0d0d0f' }}
      >
        {/* Back — mobile only */}
        <button
          onClick={() => router.push('/inbox')}
          className="w-9 h-9 rounded-xl flex items-center justify-center tap text-[#9090a8] hover:text-[#f0f0f5] transition-colors md:hidden shrink-0"
          style={{ background: '#1e1e23' }}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="relative shrink-0">
          <Avatar name={recipientName} size={40} />
          <span className="absolute bottom-0 right-0"><Badge online={isOnline} /></span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#f0f0f5] text-[15px] truncate">{recipientName}</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-[#3ddc84]' : 'bg-[#55556a]'}`} />
            <p className="text-xs text-[#55556a] truncate">
              {isOnline ? 'Online' : 'Offline'}
              {status !== 'connected' && ` · ${status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…'}`}
            </p>
          </div>
        </div>

        <EncryptionBadge compact />
      </div>

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