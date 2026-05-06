'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchUsers } from '../../lib/api/users';
import { Avatar } from '../ui/Avatar';
import { Spinner } from '../ui/Spinner';

interface Props { onClose: () => void; }

export function NewConversationSearch({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; username: string; display_name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setIsSearching(true);
    try { setResults(await searchUsers(q)); }
    catch { setResults([]); }
    finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSelect(userId: string) {
    router.push(`/conversations/${userId}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md rounded-t-[28px] md:rounded-3xl overflow-hidden slide-up md:fade-in"
        style={{ background: '#17171a', border: '1px solid #2a2a33' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#2a2a33]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-base font-semibold text-[#f0f0f5]">New message</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center tap text-[#55556a] hover:text-[#f0f0f5] transition-colors" style={{ background: '#1e1e23' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: '#1e1e23', border: '1px solid #2a2a33' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="2" strokeLinecap="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username…"
              className="flex-1 bg-transparent text-[15px] text-[#f0f0f5] placeholder:text-[#55556a] outline-none"
            />
            {isSearching && <Spinner size={16} />}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-72 px-3 pb-6 safe-bottom">
          {!isSearching && query && results.length === 0 && (
            <p className="text-center text-[#55556a] text-sm py-8">No users found for &quot;{query}&quot;</p>
          )}
          {!query && (
            <p className="text-center text-[#55556a] text-sm py-8">Type to search for people</p>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl tap hover:bg-[#1e1e23] transition-colors text-left"
            >
              <Avatar name={user.display_name} size={44} />
              <div>
                <p className="text-[15px] font-medium text-[#f0f0f5]">{user.display_name}</p>
                <p className="text-sm text-[#55556a]">@{user.username}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="2" strokeLinecap="round" className="ml-auto">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}