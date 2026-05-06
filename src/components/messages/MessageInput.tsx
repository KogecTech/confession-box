'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Spinner } from '../ui';

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
    <div className="shrink-0 safe-bottom bg-background/80 backdrop-blur-xl border-t border-border/50">
      {/* Status bar */}
      <div className={`overflow-hidden transition-all duration-300 ${status !== 'idle' ? 'h-8 opacity-100' : 'h-0 opacity-0'}`}>
        <div className={`flex items-center justify-center gap-2 h-full text-[11px] font-bold uppercase tracking-widest ${
          status === 'sending' ? 'text-primary' :
          status === 'sent'    ? 'text-[#3ddc84]' :
          'text-red-500'
        }`}>
          {status === 'sending' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Securing & Sending…</span>
            </div>
          )}
          {status === 'sent' && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Delivered</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>Encryption Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3 px-4 py-3">
        <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-[24px] bg-secondary/50 border border-border/40 focus-within:border-primary/40 focus-within:bg-secondary/80 transition-all duration-200">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message Confession Box…"
            disabled={disabled || status === 'sending'}
            className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-normal min-h-[22px]"
            style={{ maxHeight: 130 }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            w-[46px] h-[46px] rounded-full flex items-center justify-center tap transition-all duration-300 shrink-0 shadow-lg
            ${canSend 
              ? 'bg-primary text-white shadow-primary/25 scale-100' 
              : 'bg-secondary text-muted-foreground/30 border border-border/30 scale-95'
            }
          `}
        >
          {status === 'sending' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" className="animate-spin" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${canSend ? 'rotate-0 translate-x-0.5' : 'rotate-45'}`}>
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}