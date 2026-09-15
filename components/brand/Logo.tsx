import { useId } from "react";

export const APP_NAME = "คัมภีร์";

/** The คัมภีร์ mark: an open book with blue, teal, and yellow pages. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B8BFF" />
          <stop offset="1" stopColor="#0F4FC4" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5FD6CB" />
          <stop offset="1" stopColor="#14B3A8" />
        </linearGradient>
        <linearGradient id={`${id}-y`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD166" />
          <stop offset="1" stopColor="#F29D1B" />
        </linearGradient>
      </defs>
      {/* base / spine shadow */}
      <path d="M3 33c7-3 14-3 21 1 7-4 14-4 21-1v3c-7-3-14-3-21 1-7-4-14-4-21-1z" fill="#0F4FC4" opacity=".9" />
      {/* left page */}
      <path d="M4 8c7-2 14-1 20 5v21c-6-5-13-6-20-4z" fill={`url(#${id}-l)`} />
      {/* right pages: yellow behind, teal front */}
      <path d="M24 11c5-7 12-10 20-9v26c-8-1-15 2-20 8z" fill={`url(#${id}-y)`} />
      <path d="M24 13c6-5 12-6 19-4v21c-7-2-13-1-19 4z" fill={`url(#${id}-r)`} />
      {/* page lines */}
      <path d="M8 13.5c4-.6 8 0 12 2.5M8 18.5c4-.6 8 0 12 2.5" stroke="#fff" strokeOpacity=".55" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-10 w-12" : size === "sm" ? "h-6 w-7" : "h-8 w-10";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className="flex items-center gap-2">
      <LogoMark className={mark} />
      <span className={`${text} font-extrabold tracking-tight text-primary-900`}>{APP_NAME}</span>
    </span>
  );
}
