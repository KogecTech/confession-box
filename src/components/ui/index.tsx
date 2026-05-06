'use client';

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 20, color = '#6c63ff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ minWidth: size }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#6c63ff','#4f46cc'],
  ['#f472b6','#db2777'],
  ['#34d399','#059669'],
  ['#fb923c','#ea580c'],
  ['#60a5fa','#2563eb'],
  ['#a78bfa','#7c3aed'],
  ['#f87171','#dc2626'],
];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const [from, to] = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const fontSize = Math.round(size * 0.35);

  return (
    <div
      style={{
        width: size, height: size, minWidth: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize,
      }}
      className="rounded-full flex items-center justify-center font-semibold text-white select-none shadow-sm"
    >
      {initials}
    </div>
  );
}

// ── Online Badge ─────────────────────────────────────────────
export function Badge({ online }: { online: boolean }) {
  return (
    <span
      style={{ width: 11, height: 11 }}
      className={`rounded-full border-2 border-[#0d0d0f] shrink-0 transition-colors duration-300 ${
        online ? 'bg-[#3ddc84]' : 'bg-[#55556a]'
      }`}
    />
  );
}