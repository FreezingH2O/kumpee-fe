"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon, PencilIcon } from "@heroicons/react/24/outline";

/** ค้นหา / Live submenu under คำแปล (§1). */
const ITEMS = [
  { href: "/search", label: "ค้นหา", Icon: MagnifyingGlassIcon },
  { href: "/live", label: "Live", Icon: PencilIcon },
];

export function SubNav({ hint }: { hint?: string }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 lg:px-8">
      <div className="flex gap-1 rounded-chip bg-slate100 p-1">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-chip px-3 py-1.5 text-sm font-medium ${
                active ? "bg-surface text-primary-600 shadow-sm" : "text-ink-600"
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
