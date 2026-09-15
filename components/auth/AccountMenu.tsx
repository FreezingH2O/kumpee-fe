"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightStartOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Header auth control: เข้าสู่ระบบ when signed out; the user's email and
 *  ออกจากระบบ when signed in. Tracks Supabase auth state live. */
export function AccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

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

  async function signOut() {
    await getSupabaseBrowser()?.auth.signOut();
    setEmail(null);
    router.refresh();
  }

  if (!ready) return <span className="h-9 w-24" aria-hidden="true" />;

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

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[180px] items-center gap-1.5 truncate text-sm text-ink-600 sm:flex" title={email}>
        <UserCircleIcon className="h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
        <span className="truncate">{email}</span>
      </span>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-sm font-medium text-ink-600 hover:border-primary-500"
      >
        <ArrowRightStartOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
        ออกจากระบบ
      </button>
    </div>
  );
}
