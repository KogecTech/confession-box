'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { WebSocketProvider } from '../../context/WebSocketContext';
import { ConversationList } from '../../components/conversations/ConversationList';
import { Spinner } from '../../components/ui/Spinner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Mobile: show sidebar when at /inbox, show chat when in /conversations/[id]
  const isInConversation = pathname.startsWith('/conversations/');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#0d0d0f]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} />
          <p className="text-sm text-[#55556a]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <WebSocketProvider>
      <div className="flex h-dvh overflow-hidden bg-[#0d0d0f]">

        {/* Sidebar — full width on mobile when NOT in conversation */}
        <div className={`
          flex-col shrink-0 border-r border-[#2a2a33] bg-[#0d0d0f]
          ${isInConversation
            ? 'hidden md:flex md:w-[340px] lg:w-[360px]'
            : 'flex w-full md:w-[340px] lg:w-[360px]'
          }
        `}>
          <ConversationList />
        </div>

        {/* Main panel — full width on mobile when IN conversation */}
        <main className={`
          flex-col min-w-0 flex-1 overflow-hidden
          ${isInConversation ? 'flex' : 'hidden md:flex'}
        `}>
          {children}
        </main>

      </div>
    </WebSocketProvider>
  );
}