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

  function handleSelect(userId: string, displayName: string, username: string) {
    const params = new URLSearchParams({
      name: displayName,
      user: username
    });
    router.push(`/conversations/${userId}?${params.toString()}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center p-0 md:p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md rounded-t-4xl md:rounded-4xl overflow-hidden animate-slide-up md:animate-fade-in glass-card shadow-2xl border-t md:border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h3 className="text-lg font-bold text-foreground">New conversation</h3>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl flex items-center justify-center tap text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] bg-secondary border border-border/40 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 text-muted-foreground/60">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or @username…"
              className="flex-1 bg-transparent text-[15px] font-medium text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
            {isSearching && <Spinner size={18} className="text-primary" />}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[60vh] md:max-h-96 px-3 pb-6 safe-bottom">
          {!isSearching && query && results.length === 0 && (
            <div className="py-12 text-center animate-fade-in">
              <p className="text-muted-foreground/80 font-medium italic">No matches for &quot;{query}&quot;</p>
            </div>
          )}
          {!query && (
            <div className="py-12 text-center animate-fade-in opacity-40">
              <p className="text-muted-foreground font-semibold">Search for anyone on Confession Box</p>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id, user.display_name, user.username)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl tap hover:bg-secondary/60 transition-all duration-200 text-left group"
              >
                <Avatar name={user.display_name} size={48} className="group-hover:scale-105 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-foreground truncate">{user.display_name}</p>
                  <p className="text-sm font-medium text-muted-foreground/70 truncate">@{user.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}