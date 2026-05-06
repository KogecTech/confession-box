'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ConversationItem } from './ConversationItem';
import { NewConversationSearch } from './NewConversationSearch';
import { Avatar } from '../ui/Avatar';
import { useConversations } from '../../hooks/useConversations';
import { usePresence } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="skeleton w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 md:pt-6 safe-top">
        <div>
          <h1 className="text-xl font-semibold text-[#f0f0f5] tracking-tight">Messages</h1>
          <p className="text-xs text-[#55556a] mt-0.5">End-to-end encrypted</p>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center tap transition-colors"
          style={{ background: '#1e1e23', border: '1px solid #2a2a33' }}
          aria-label="New conversation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Search hint */}
      <div className="px-4 mb-3">
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl tap text-[#55556a] text-sm transition-colors"
          style={{ background: '#1e1e23', border: '1px solid #2a2a33' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Search people…
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading
          ? [...Array(7)].map((_, i) => <SkeletonRow key={i} />)
          : conversations.length === 0
          ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-8 text-center">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center" style={{ background: '#1e1e23' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[#9090a8] font-medium text-sm">No conversations yet</p>
                <p className="text-[#55556a] text-xs mt-1">Start a new encrypted chat</p>
              </div>
              <button
                onClick={() => setShowSearch(true)}
                className="text-[#6c63ff] text-sm font-medium hover:text-[#7a72ff] transition-colors tap"
              >
                Find someone →
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

      {/* Footer — current user */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[#2a2a33] safe-bottom">
          <Avatar name={user.display_name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#f0f0f5] truncate">{user.display_name}</p>
            <p className="text-xs text-[#55556a] truncate">@{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl flex items-center justify-center tap text-[#55556a] hover:text-[#ff4f4f] transition-colors"
            title="Sign out"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      )}

      {showSearch && <NewConversationSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}