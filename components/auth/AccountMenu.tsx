"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Header auth control: the เข้าสู่ระบบ button when signed out; a compact avatar
 *  with a dropdown (email + ออกจากระบบ) when signed in — same footprint either
 *  way, so the header layout doesn't shift. Tracks Supabase auth state live. */
export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // close the dropdown on outside click, Escape, or navigation
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    setOpen(false);
    await getSupabaseBrowser()?.auth.signOut();
    setEmail(null);
    router.refresh();
  }

  // Reserve the button's space while the session loads, so nothing jumps.
  if (!ready) return <span className="block h-9 w-9" aria-hidden="true" />;

  if (!email) {
    const next = pathname && pathname !== "/login" ? `?next=${encodeURIComponent(pathname)}` : "";
    return (
      <Link
        href={`/login${next}`}
        className="rounded-control bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
      >
        เข้าสู่ระบบ
      </Link>
    );
  }

  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`บัญชีของคุณ (${email})`}
        title={email}
        className="grid h-9 w-9 place-items-center rounded-full bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        {initial}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 rounded-card border border-line bg-surface p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-xs text-ink-400">เข้าสู่ระบบในชื่อ</p>
            <p className="truncate text-sm font-medium text-ink-900" title={email}>
              {email}
            </p>
          </div>
          <hr className="my-1 border-line" />
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-ink-600 hover:bg-slate100 hover:text-ink-900"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
            ออกจากระบบ
          </button>
        </div>
      ) : null}
    </div>
  );
}
