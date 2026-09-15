"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  CameraIcon,
  BookOpenIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

/** Bottom tab bar shown on mobile only (M frames). */
const TABS = [
  { href: "/search", label: "คำแปล", Icon: MagnifyingGlassIcon },
  { href: "/read", label: "คำอ่าน", Icon: CameraIcon },
  { href: "/klangkham", label: "คลังคำ", Icon: BookOpenIcon },
  { href: "/saved", label: "บันทึก", Icon: BookmarkIcon },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="แถบเมนูล่าง"
      className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface md:hidden"
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2 text-xs ${
              active ? "text-primary-600" : "text-ink-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
