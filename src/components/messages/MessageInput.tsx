'use client';

import { useState, useRef, type KeyboardEvent } from 'react';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

interface Props {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<SendStatus>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || status === 'sending' || disabled) return;
    setStatus('sending');
    try {
      await onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 130)}px`;
  }

  const canSend = text.trim().length > 0 && status !== 'sending' && !disabled;

  return (
    <div className="shrink-0 safe-bottom" style={{ borderTop: '1px solid #2a2a33', background: '#0d0d0f' }}>
      {/* Status bar */}
      {status !== 'idle' && (
        <div className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-all ${
          status === 'sending' ? 'text-[#9090a8]' :
          status === 'sent'    ? 'text-[#3ddc84]' :
          'text-[#ff4f4f]'
        }`}>
          {status === 'sending' && <>
            <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Encrypting &amp; sending…
          </>}
          {status === 'sent' && <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17L4 12"/>
            </svg>
            Delivered
          </>}
          {status === 'error' && <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Failed to send — tap to retry
          </>}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        <div className="flex-1 flex items-end gap-2 px-4 py-2.5 rounded-[26px] transition-colors"
          style={{ background: '#1e1e23', border: '1px solid #2a2a33' }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message…"
            disabled={disabled || status === 'sending'}
            className="flex-1 bg-transparent text-[15px] text-[#f0f0f5] placeholder:text-[#55556a] resize-none outline-none leading-relaxed"
            style={{ maxHeight: 130 }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-11 h-11 rounded-full flex items-center justify-center tap transition-all duration-200 shrink-0"
          style={{
            background: canSend ? 'linear-gradient(135deg, #6c63ff, #4f46cc)' : '#1e1e23',
            boxShadow: canSend ? '0 2px 16px rgba(108,99,255,0.35)' : 'none',
            border: canSend ? 'none' : '1px solid #2a2a33',
          }}
        >
          {status === 'sending' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke={canSend ? 'white' : '#55556a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={canSend ? 'white' : '#55556a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}