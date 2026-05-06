'use client';

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} style={{ minWidth: size }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['hsl(258 89% 66%)', 'hsl(258 89% 50%)'], // Primary Purple
  ['hsl(330 81% 60%)', 'hsl(330 81% 45%)'], // Pink
  ['hsl(160 84% 39%)', 'hsl(160 84% 30%)'], // Emerald
  ['hsl(30 93% 53%)',  'hsl(30 93% 40%)'],  // Orange
  ['hsl(217 91% 60%)', 'hsl(217 91% 45%)'], // Blue
  ['hsl(271 91% 65%)', 'hsl(271 91% 50%)'], // Violet
  ['hsl(0 84% 60%)',   'hsl(0 84% 45%)'],   // Red
];

export function Avatar({ name, size = 40, className = '' }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const [from, to] = AVATAR_COLORS[colorIndex];
  const fontSize = Math.round(size * 0.4);

  return (
    <div
      style={{
        width: size, 
        height: size, 
        minWidth: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize,
      }}
      className={`rounded-full flex items-center justify-center font-bold text-white select-none shadow-lg shadow-black/20 ${className}`}
    >
      {initials}
    </div>
  );
}

// ── Online Badge ─────────────────────────────────────────────
export function Badge({ online, size = 12 }: { online: boolean; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full border-2 border-background shrink-0 transition-all duration-500 shadow-sm ${
        online 
          ? 'bg-[#3ddc84] scale-100' 
          : 'bg-muted-foreground/30 scale-90'
      }`}
    />
  );
}