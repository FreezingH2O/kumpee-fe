"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlassIcon, CameraIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * SearchBar — accepts a word OR a sentence; the user does not pick a mode (§1).
 * The backend classifies word vs sentence (§8.2); every submit goes to
 * /search?q=. The camera opens คำอ่าน (upload a photo or PDF).
 */
export function SearchBar({
  initial = "",
  autoFocus = false,
  placeholder = "พิมพ์คำหรือประโยคที่อยากเข้าใจ...",
  size = "md",
}: {
  initial?: string;
  autoFocus?: boolean;
  placeholder?: string;
  size?: "md" | "lg";
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const lg = size === "lg";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`flex items-center gap-2 rounded-card border border-line bg-surface shadow-card transition focus-within:border-primary-200 focus-within:shadow-float ${
        lg ? "p-2 pl-4" : "p-1.5 pl-3"
      }`}
    >
      <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
      <label htmlFor="kp-search" className="sr-only">
        ค้นคำหรือประโยค
      </label>
      <input
        id="kp-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent px-1 text-ink-900 outline-none placeholder:text-ink-400 ${
          lg ? "py-3 text-[17px]" : "py-2 text-base"
        }`}
      />
      <Link
        href="/read"
        aria-label="ค้นด้วยรูปภาพหรือเอกสาร"
        className="hidden border-l border-line px-3 py-2 text-ink-600 hover:text-primary-600 sm:block"
      >
        <CameraIcon className="h-6 w-6" />
      </Link>
      <button
        type="submit"
        className={`inline-flex shrink-0 items-center gap-2 rounded-control bg-primary-500 shadow-button font-semibold text-white shadow-button hover:bg-primary-600 ${
          lg ? "px-4 py-3 text-base sm:px-6" : "px-4 py-2.5 text-sm sm:px-5"
        }`}
      >
        ค้นหา
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
