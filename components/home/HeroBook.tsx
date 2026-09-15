/**
 * Decorative open book for the hero (purely visual): a glassy book seen from
 * the front-left — a large royal-blue page with a translucent page behind it,
 * a teal page curling up on the right, a golden glow along the spine, and soft
 * light streaks around it.
 */
export function HeroBook({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 330" className={className} aria-hidden="true" focusable="false">
      <defs>
        {/* page fills */}
        <linearGradient id="hb-front" x1="0.05" y1="0.3" x2="0.95" y2="0.85">
          <stop offset="0" stopColor="#5AA2F2" />
          <stop offset="0.35" stopColor="#3D7BEB" />
          <stop offset="0.75" stopColor="#4F8DF0" />
          <stop offset="1" stopColor="#7CC4F4" />
        </linearGradient>
        <linearGradient id="hb-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFE3FB" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#8EC3F5" stopOpacity="0.85" />
          <stop offset="1" stopColor="#7FDCE3" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="hb-right" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#8DEBE2" />
          <stop offset="0.5" stopColor="#5BC6E6" />
          <stop offset="1" stopColor="#3E98E6" />
        </linearGradient>
        <linearGradient id="hb-sliver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A9C4FA" />
          <stop offset="1" stopColor="#6F97F2" />
        </linearGradient>
        <linearGradient id="hb-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF3C4" stopOpacity="0" />
          <stop offset="0.25" stopColor="#FFE58A" />
          <stop offset="0.8" stopColor="#F9D35B" />
          <stop offset="1" stopColor="#F6C343" stopOpacity="0.6" />
        </linearGradient>
        {/* glassy highlight over the pages */}
        <radialGradient id="hb-shine" cx="0.62" cy="0.42" r="0.55">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hb-streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="hb-blur-lg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="hb-blur-md" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="hb-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* soft light wash + streaks */}
      <ellipse cx="300" cy="200" rx="250" ry="110" fill="#D6E9FF" opacity="0.7" filter="url(#hb-blur-lg)" />
      <path d="M20 70 C 160 20, 330 30, 540 110" stroke="url(#hb-streak)" strokeWidth="26" fill="none" opacity="0.7" filter="url(#hb-blur-md)" />
      <path d="M60 120 C 200 70, 360 80, 520 160" stroke="url(#hb-streak)" strokeWidth="10" fill="none" opacity="0.6" filter="url(#hb-blur-md)" />

      {/* golden glow under the spine */}
      <ellipse cx="170" cy="262" rx="170" ry="26" fill="#FFE27A" opacity="0.65" filter="url(#hb-blur-lg)" />

      {/* translucent back page (left) */}
      <path
        d="M150 86 C 240 78, 330 92, 392 136 L 346 296 C 310 222, 240 150, 150 86 Z"
        fill="url(#hb-back)"
        opacity="0.8"
        filter="url(#hb-blur-sm)"
      />

      {/* thin blue sliver page (far right) */}
      <path d="M482 200 L 506 198 L 526 268 L 494 262 Z" fill="url(#hb-sliver)" opacity="0.85" />

      {/* right page curling up */}
      <path
        d="M344 296 C 366 236, 402 196, 480 176 C 488 206, 494 236, 496 264 C 440 254, 386 266, 344 296 Z"
        fill="url(#hb-right)"
      />
      <path d="M350 290 C 372 238, 406 204, 474 186" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="2" fill="none" />

      {/* front left page */}
      <path
        d="M100 128 C 190 140, 280 196, 344 296 C 250 268, 140 246, 44 234 C 60 198, 78 160, 100 128 Z"
        fill="url(#hb-front)"
      />
      {/* page edge highlight + thickness */}
      <path d="M100 128 C 190 140, 280 196, 344 296" stroke="#BFE0FF" strokeOpacity="0.8" strokeWidth="2" fill="none" />
      <path d="M44 234 C 140 246, 250 268, 344 296" stroke="#2F63D8" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* golden page stack along the bottom edge */}
      <path
        d="M20 244 C 130 252, 250 276, 344 302 L 346 308 C 250 286, 120 264, 8 258 Z"
        fill="url(#hb-gold)"
      />

      {/* glassy shine over everything */}
      <path
        d="M100 128 C 190 140, 280 196, 344 296 C 366 236, 402 196, 480 176 C 488 206, 494 236, 496 264 C 440 254, 386 266, 344 296 C 250 268, 140 246, 44 234 C 60 198, 78 160, 100 128 Z"
        fill="url(#hb-shine)"
      />
    </svg>
  );
}
