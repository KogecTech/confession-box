'use client';

import Link from 'next/link';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
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
        flex items-center gap-3 px-4 py-3.5 cursor-pointer tap transition-colors duration-150
        ${isActive
          ? 'bg-[#6c63ff]/10 border-l-2 border-[#6c63ff]'
          : 'hover:bg-[#1e1e23] border-l-2 border-transparent'
        }
      `}
    >
      <div className="relative shrink-0">
        <Avatar name={conversation.display_name} size={48} />
        <span className="absolute bottom-0 right-0">
          <Badge online={isOnline} />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`font-medium truncate ${isActive ? 'text-[#f0f0f5]' : 'text-[#e0e0ea]'}`}>
            {conversation.display_name}
          </p>
          <span className="text-[11px] text-[#55556a] shrink-0">
            {timeAgo(conversation.last_message_at)}
          </span>
        </div>
        <p className="text-sm text-[#55556a] truncate mt-0.5">
          @{conversation.username}
        </p>
      </div>
    </Link>
  );
}