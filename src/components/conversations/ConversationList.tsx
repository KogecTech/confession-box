'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ConversationItem } from './ConversationItem';
import { NewConversationSearch } from './NewConversationSearch';
import { Avatar, Badge } from '../ui';
import { useConversations } from '../../hooks/useConversations';
import { usePresence } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="skeleton w-[52px] h-[52px] rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="skeleton h-3.5 w-32 rounded-lg" />
        <div className="skeleton h-3 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function ConversationList() {
  const { user, logout } = useAuth();
  const { conversations, isLoading } = useConversations();
  const presence = usePresence();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  const activeUserId = pathname.match(/\/conversations\/([^/]+)/)?.[1];

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5 md:pt-8 safe-top">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">End-to-end encrypted</p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center tap transition-all duration-200 bg-secondary border border-border/50 hover:bg-muted text-primary"
          aria-label="New conversation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-5 mb-4">
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl tap text-muted-foreground text-sm transition-all duration-200 bg-secondary/80 border border-border/40 hover:border-primary/30 hover:bg-secondary group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-muted-foreground/60 group-hover:text-primary/70 transition-colors">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <span className="font-medium">Search people…</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading
          ? [...Array(7)].map((_, i) => <SkeletonRow key={i} />)
          : conversations.length === 0
          ? (
            <div className="flex flex-col items-center justify-center h-64 gap-5 px-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-[28px] flex items-center justify-center bg-secondary/80 border border-border/50 shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-semibold text-base">Start a conversation</p>
                <p className="text-muted-foreground text-sm mt-1 max-w-[200px]">Your messages are encrypted and safe from prying eyes.</p>
              </div>
              <button
                onClick={() => setShowSearch(true)}
                className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all duration-200 tap"
              >
                Find someone
              </button>
            </div>
          )
          : conversations.map((c) => (
            <ConversationItem
              key={c.user_id}
              conversation={c}
              isActive={c.user_id === activeUserId}
              isOnline={!!presence[c.user_id]}
            />
          ))
        }
      </div>

      {/* Footer — current user profile */}
      {user && (
        <div className="flex items-center gap-3 px-5 py-4 bg-secondary/30 backdrop-blur-md border-t border-border/50 safe-bottom">
          <div className="relative">
            <Avatar name={user.display_name} size={40} className="ring-2 ring-primary/20" />
            <div className="absolute -bottom-0.5 -right-0.5">
               <Badge online={true} size={11} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground truncate">{user.display_name}</p>
            <p className="text-xs font-medium text-muted-foreground truncate opacity-70">@{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl flex items-center justify-center tap text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
            title="Sign out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      )}

      {showSearch && <NewConversationSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}