"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { Logo } from "@/components/brand/Logo";

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
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 shadow-[0_1px_0_rgba(16,60,140,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="คัมภีร์ หน้าแรก">
            <Logo />
          </Link>

          <nav aria-label="เมนูหลัก" className="hidden h-[68px] items-stretch gap-6 md:flex">
            {NAV.map((item) => {
              const active = isActive(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center px-1 text-[15px] font-semibold transition-colors ${
                    active ? "text-primary-600" : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-chip bg-primary-600" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <AccountMenu />
          <button
            type="button"
            className="rounded-control p-2 text-ink-600 hover:bg-primary-50 md:hidden"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav aria-label="เมนูมือถือ" className="border-t border-line bg-white px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.match) ? "page" : undefined}
              className={`block rounded-control px-3 py-2.5 text-sm font-semibold ${
                isActive(item.match) ? "bg-primary-50 text-primary-600" : "text-ink-600"
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
