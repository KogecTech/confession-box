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

export function MessageBubble({ message, isMine, showAvatar }: Props) {
  if (message.decryptionFailed) {
    return (
      <div className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm italic"
          style={{ background: '#1e1e23', border: '1px solid #2a2a33', color: '#55556a' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Unable to decrypt
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-0.5 bubble-in ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Spacer to keep alignment when avatar hidden */}
      <div className="w-0 shrink-0" />

      <div className={`
        max-w-[78%] sm:max-w-[65%] px-4 py-2.5 text-[15px] leading-relaxed
        ${isMine
          ? 'rounded-[20px] rounded-br-[6px] text-white'
          : 'rounded-[20px] rounded-bl-[6px] text-[#f0f0f5]'
        }
      `}
        style={isMine
          ? { background: 'linear-gradient(135deg, #6c63ff, #4f46cc)', boxShadow: '0 2px 16px rgba(108,99,255,0.25)' }
          : { background: '#1e1e23', border: '1px solid #2a2a33' }
        }
      >
        <p className="whitespace-pre-wrap break-words">{message.plaintext}</p>
        <div className={`flex items-center justify-end gap-1.5 mt-1 ${isMine ? 'opacity-60' : 'opacity-50'}`}>
          <span className="text-[11px]">{formatTime(message.created_at)}</span>
          {isMine && (
            <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
              {/* Double tick = delivered */}
              <path d="M1 5.5L5 9.5L15 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={message.delivered ? 1 : 0.4}/>
              {message.delivered && <path d="M5 5.5L9 9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}