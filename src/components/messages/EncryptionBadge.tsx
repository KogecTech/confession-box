'use client';

export function EncryptionBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-all duration-200 group hover:bg-primary/20">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary group-hover:scale-110 transition-transform">
          <rect x="3" y="11" width="18" height="11" rx="2.5"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary hidden sm:block">E2EE Secured</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4 animate-fade-in">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted/40 border border-border/50">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/60">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="text-[11px] text-muted-foreground font-semibold tracking-wide">
        Your messages are end-to-end encrypted
      </span>
    </div>
  );
}