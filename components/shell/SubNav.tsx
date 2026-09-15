"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

/** ค้นหา / Live submenu under คำแปล (§1). */
const ITEMS = [
  { href: "/search", label: "ค้นหา", Icon: MagnifyingGlassIcon },
  { href: "/live", label: "Live", Icon: PencilSquareIcon },
];

export function SubNav({ hint }: { hint?: string }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
      <div className="flex gap-1 rounded-card bg-slate100/80 p-1">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-control px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-primary-100 text-primary-700 shadow-sm" : "text-ink-600 hover:bg-white/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
      {hint ? <span className="text-sm text-ink-400">{hint}</span> : null}
    </div>
  );
}
