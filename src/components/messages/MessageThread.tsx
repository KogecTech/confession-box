'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '../ui/Spinner';
import type { DecryptedMessage } from '../../types';

interface Props {
  messages: DecryptedMessage[];
  currentUserId: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

function DateDivider({ date }: { date: string }) {
  const label = (() => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  })();

  return (
    <div className="flex items-center justify-center my-6 sticky top-2 z-10">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 px-4 py-1.5 rounded-full glass-card shadow-sm">
        {label}
      </span>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {[65, 45, 72, 50, 60, 40].map((w, i) => (
        <div key={i} className={`flex ${i % 3 === 2 ? 'justify-end' : 'justify-start'}`}>
          <div className="skeleton rounded-2xl" style={{ width: `${w}%`, height: 48 }} />
        </div>
      ))}
    </div>
  );
}

// Group messages by date for date dividers
function groupByDate(messages: DecryptedMessage[]) {
  const groups: { date: string; messages: DecryptedMessage[] }[] = [];
  for (const msg of messages) {
    const date = new Date(msg.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === date) { last.messages.push(msg); }
    else { groups.push({ date, messages: [msg] }); }
  }
  return groups;
}

export function MessageThread({ messages, currentUserId, isLoading, isLoadingMore, hasMore, onLoadMore }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Scroll to bottom on initial load and new messages from others
  useEffect(() => {
    if (!isLoading && isFirstLoad.current) {
      bottomRef.current?.scrollIntoView();
      isFirstLoad.current = false;
    }
  }, [isLoading]);

  // Smooth scroll for new messages
  useEffect(() => {
    if (!isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleTopIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
      const container = containerRef.current;
      const prevHeight = container?.scrollHeight ?? 0;
      onLoadMore();
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevHeight;
      });
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleTopIntersect, { threshold: 1 });
    if (topRef.current) observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [handleTopIntersect]);

  const groups = groupByDate(messages);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-hide">
      <div ref={topRef} className="h-2" />

      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <Spinner size={22} className="text-primary/60" />
        </div>
      )}

      {isLoading ? (
        <MessageSkeleton />
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6 py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-[28px] flex items-center justify-center bg-secondary border border-border/50 shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-foreground/80 text-base font-bold">No messages here yet</p>
            <p className="text-muted-foreground text-sm mt-1">Send a message to start the conversation.</p>
          </div>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.date} className="flex flex-col">
            <DateDivider date={group.messages[0].created_at} />
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.from_user_id === currentUserId}
              />
            ))}
          </div>
        ))
      )}

      <div ref={bottomRef} className="h-6" />
    </div>
  );
}