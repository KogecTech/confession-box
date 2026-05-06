'use client';

import type { DecryptedMessage } from '../../types';

interface Props {
  message: DecryptedMessage;
  isMine: boolean;
  showAvatar?: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isMine }: Props) {
  if (message.decryptionFailed) {
    return (
      <div className={`flex mb-2 px-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-medium bg-muted/30 border border-border/50 text-muted-foreground italic backdrop-blur-sm animate-scale-in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Unable to decrypt message
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-1.5 px-4 animate-scale-in ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`
        relative max-w-[85%] sm:max-w-[70%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm
        ${isMine
          ? 'bg-primary text-white rounded-[20px] rounded-br-[4px]'
          : 'bg-secondary text-foreground rounded-[20px] rounded-bl-[4px] border border-border/30'
        }
      `}>
        <p className="whitespace-pre-wrap break-words font-normal">{message.plaintext}</p>
        <div className={`flex items-center justify-end gap-1.5 mt-1 ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
          <span className="text-[10px] font-medium uppercase tracking-tighter tabular-nums">{formatTime(message.created_at)}</span>
          {isMine && (
            <div className="flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                {/* Single check = sent */}
                <path d="M4 12L9 17L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={message.delivered ? 'opacity-40' : 'opacity-100'} />
                {/* Double check = delivered */}
                {message.delivered && (
                  <path d="M8 12L13 17L24 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-1" />
                )}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}