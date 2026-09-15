"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlassIcon, CameraIcon } from "@heroicons/react/24/solid";

/**
 * SearchBar — accepts a word OR a sentence; the user does not pick a mode (§1).
 * Routing between word (คำแปล) and sentence view is decided from the query on
 * the result route, not here — we don't classify Thai by spaces/word count
 * (backend §8.2). For now every submit goes to /search?q=.
 */
export function SearchBar({
  initial = "",
  autoFocus = false,
}: {
  initial?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

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
      className="flex items-center gap-2 rounded-card border border-line bg-surface p-2 shadow-sm"
    >
      <MagnifyingGlassIcon
        className="ml-2 h-5 w-5 shrink-0 text-ink-400"
        aria-hidden="true"
      />
      <label htmlFor="kp-search" className="sr-only">
        ค้นคำหรือประโยค
      </label>
      <input
        id="kp-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="พิมพ์คำหรือประโยคที่อยากเข้าใจ..."
        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[17px] leading-body text-ink-900 outline-none placeholder:text-ink-400"
      />
      <button
        type="button"
        aria-label="ค้นด้วยรูปภาพ"
        className="rounded-control p-2 text-ink-400 hover:text-ink-600"
      >
        <CameraIcon className="h-5 w-5" />
      </button>
      <button
        type="submit"
        className="rounded-control bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
      >
        ค้นหา
      </button>
    </form>
  );
}
