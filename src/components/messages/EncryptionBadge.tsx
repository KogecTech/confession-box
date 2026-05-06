'use client';

export function EncryptionBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl" style={{ background: '#1e1e23', border: '1px solid #2a2a33' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3ddc84" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
        </svg>
        <span className="text-[10px] font-medium text-[#3ddc84] hidden sm:block">Encrypted</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#55556a" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
      </svg>
      <span className="text-[11px] text-[#55556a] font-medium tracking-wide">
        Messages are end-to-end encrypted
      </span>
    </div>
  );
}