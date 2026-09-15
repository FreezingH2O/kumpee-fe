"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpenIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AccountMenu } from "@/components/auth/AccountMenu";

const NAV = [
  { href: "/search", label: "คำแปล", match: ["/search", "/live", "/rewrite"] },
  { href: "/read", label: "คำอ่าน", match: ["/read"] },
  { href: "/klangkham", label: "คลังคำ", match: ["/klangkham"] },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (m: string[]) => m.some((p) => pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-primary-600">
          <BookOpenIcon className="h-7 w-7" aria-hidden="true" />
          <span className="text-xl font-bold">คำภีร์</span>
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-2 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.match) ? "page" : undefined}
              className={`relative px-3 py-2 text-sm font-medium ${
                isActive(item.match)
                  ? "text-primary-600"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {item.label}
              {isActive(item.match) ? (
                <span className="absolute inset-x-3 -bottom-[1px] h-[3px] rounded-chip bg-primary-600" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AccountMenu />
          <button
            type="button"
            className="rounded-control p-2 text-ink-600 md:hidden"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          aria-label="เมนูมือถือ"
          className="border-t border-line bg-surface px-4 py-2 md:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.match) ? "page" : undefined}
              className={`block rounded-control px-3 py-2 text-sm font-medium ${
                isActive(item.match)
                  ? "bg-primary-50 text-primary-600"
                  : "text-ink-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
