export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 bg-[#7c6af7]/10 border border-[#7c6af7]/20 rounded-3xl flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#7c6af7" strokeWidth="1.8" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#7c6af7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#f5f5f5]">End-to-end encrypted</h2>
        <p className="text-sm text-[#888888] mt-1 max-w-xs leading-relaxed">
          Select a conversation or start a new one. Only you and your recipient can read your messages.
        </p>
      </div>
    </div>
  );
}