/** Decorative open book behind the hero (purely visual). */
export function HeroBook({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 260" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hb-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9FE7F0" />
          <stop offset=".55" stopColor="#3B9BFF" />
          <stop offset="1" stopColor="#0F4FC4" />
        </linearGradient>
        <linearGradient id="hb-right" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7FBFF" />
          <stop offset=".6" stopColor="#8FD3FF" />
          <stop offset="1" stopColor="#1A73F5" />
        </linearGradient>
        <linearGradient id="hb-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="1" stopColor="#F7B538" />
        </linearGradient>
        <radialGradient id="hb-glow" cx=".5" cy=".6" r=".6">
          <stop offset="0" stopColor="#BFE3FF" stopOpacity=".9" />
          <stop offset="1" stopColor="#BFE3FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="210" cy="170" rx="200" ry="80" fill="url(#hb-glow)" />
      <path d="M40 200c55-30 115-34 170-6 55-28 115-24 170 6l-6 14c-55-26-110-28-164 2-54-30-109-28-164-2z" fill="url(#hb-gold)" />
      <path d="M52 186C60 120 110 60 206 60l4 128c-60-28-110-24-158-2z" fill="url(#hb-left)" opacity=".95" />
      <path d="M214 188l4-128c96 0 146 60 150 126-48-22-98-26-154 2z" fill="url(#hb-right)" opacity=".95" />
      <path d="M86 150c30-22 64-30 104-24M96 124c26-20 56-28 92-24" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M236 126c34-6 68 2 98 24M240 100c32-4 62 4 90 24" stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
