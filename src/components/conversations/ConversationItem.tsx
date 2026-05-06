'use client';

import Link from 'next/link';
import { Avatar, Badge } from '../ui';
import type { Conversation } from '../../types';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  isOnline: boolean;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationItem({ conversation, isActive, isOnline }: Props) {
  return (
    <Link
      href={`/conversations/${conversation.user_id}`}
      className={`
        relative flex items-center gap-3 px-4 py-4 cursor-pointer tap transition-all duration-200
        ${isActive
          ? 'bg-primary/10'
          : 'hover:bg-secondary/50'
        }
      `}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_12px_rgba(108,99,255,0.4)]" />
      )}

      <div className="relative shrink-0">
        <Avatar name={conversation.display_name} size={52} />
        <div className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background rounded-full">
          <Badge online={isOnline} size={13} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`font-semibold truncate text-[15.5px] ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>
            {conversation.display_name}
          </p>
          <span className="text-[11px] font-medium text-muted-foreground shrink-0 tabular-nums">
            {timeAgo(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-sm text-muted-foreground truncate">
            @{conversation.username}
          </p>
          {/* Unread dot placeholder or something if needed, but for now just the username */}
        </div>
      </div>
    </Link>
  );
}