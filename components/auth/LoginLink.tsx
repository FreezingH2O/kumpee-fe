"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** A เข้าสู่ระบบ link that returns the user to the current page afterwards. */
export function LoginLink({
  children = "เข้าสู่ระบบ",
  className = "font-medium text-primary-600 underline",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [href, setHref] = useState("/login");
  useEffect(() => {
    const here = window.location.pathname + window.location.search;
    if (window.location.pathname !== "/login") setHref(`/login?next=${encodeURIComponent(here)}`);
  }, []);
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
