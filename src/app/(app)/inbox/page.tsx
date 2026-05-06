export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8 h-full">
      {/* Subtle glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-[#6c63ff]/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-[28px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6c63ff15, #6c63ff08)', border: '1px solid #6c63ff20' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="#6c63ff" fillOpacity="0.15" stroke="#6c63ff" strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="7" y="10" width="2" height="2" rx="1" fill="#6c63ff"/>
            <rect x="11" y="10" width="2" height="2" rx="1" fill="#6c63ff"/>
            <rect x="15" y="10" width="2" height="2" rx="1" fill="#6c63ff"/>
          </svg>
        </div>

        <div>
          <h2 className="text-[17px] font-semibold text-[#f0f0f5]">Your messages</h2>
          <p className="text-sm text-[#55556a] mt-1.5 max-w-[240px] leading-relaxed">
            Select a conversation from the sidebar or start a new one
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: '#1e1e23', border: '1px solid #2a2a33' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3ddc84" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
          </svg>
          <span className="text-[12px] text-[#55556a]">End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}