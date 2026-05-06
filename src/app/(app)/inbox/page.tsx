export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-10 h-full bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-24 h-24 rounded-[36px] flex items-center justify-center bg-secondary/30 border border-primary/20 shadow-[0_0_60px_rgba(108,99,255,0.1)] backdrop-blur-md">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <rect x="7" y="10" width="2" height="2" rx="1" fill="currentColor"/>
            <rect x="11" y="10" width="2" height="2" rx="1" fill="currentColor"/>
            <rect x="15" y="10" width="2" height="2" rx="1" fill="currentColor"/>
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Select a Chat</h2>
          <p className="text-[15px] font-medium text-muted-foreground max-w-[280px] leading-relaxed opacity-70">
            Open an existing conversation or find someone new to start messaging.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary/70">
            <rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}