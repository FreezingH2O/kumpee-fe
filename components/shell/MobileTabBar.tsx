"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

/** Bottom tab bar shown on mobile only. */
const TABS = [
  { href: "/search", label: "คำแปล", Icon: MagnifyingGlassIcon, match: ["/search", "/live"] },
  { href: "/rewrite", label: "ปรับข้อความ", Icon: ChatBubbleLeftEllipsisIcon, match: ["/rewrite"] },
  { href: "/read", label: "คำอ่าน", Icon: DocumentTextIcon, match: ["/read"] },
  { href: "/klangkham", label: "คลังคำ", Icon: BookOpenIcon, match: ["/klangkham"] },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="แถบเมนูล่าง"
      className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-white/70 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-12px_rgba(16,60,140,0.25)] backdrop-blur-md md:hidden"
    >
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match.some((m) => pathname.startsWith(m));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
              active ? "text-primary-600" : "text-ink-400"
            }`}
          >
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
