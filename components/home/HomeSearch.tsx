"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { SearchBar } from "@/components/shell/SearchBar";

const TABS = [
  {
    id: "word",
    label: "ค้นคำ",
    Icon: MagnifyingGlassIcon,
    placeholder: "พิมพ์คำที่อยากรู้ความหมาย...",
  },
  {
    id: "sentence",
    label: "เข้าใจประโยค",
    Icon: ChatBubbleLeftEllipsisIcon,
    placeholder: "วางประโยคที่อยากเข้าใจ เช่น งานวันนี้จึ้งมาก...",
  },
] as const;

const CHIPS = ["น้ำใจ", "เกรงใจ", "ภาษาทางการ", "จึ้ง"];

/** Hero search card: the tabs only change the hint — the backend decides word
 *  vs sentence (§8.2). สแกนภาพ opens คำอ่าน. */
export function HomeSearch() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("word");
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="glass rounded-[24px] p-3 shadow-float sm:p-4">
      <div role="tablist" aria-label="วิธีค้นหา" className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-1 rounded-card bg-slate100/70 p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex min-w-0 items-center justify-center gap-1.5 rounded-control px-1.5 py-2.5 text-[13px] font-semibold transition sm:gap-2 sm:px-2 sm:text-[15px] ${
              tab === id
                ? "bg-primary-100 text-primary-700 shadow-sm"
                : "text-ink-600 hover:bg-white/70"
            }`}
          >
            <Icon className="hidden h-5 w-5 shrink-0 min-[400px]:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
        <Link
          href="/read"
          className="flex min-w-0 items-center justify-center gap-1.5 rounded-control px-1.5 py-2.5 text-[13px] font-semibold text-ink-600 transition hover:bg-white/70 sm:gap-2 sm:px-2 sm:text-[15px]"
        >
          <CameraIcon className="hidden h-5 w-5 shrink-0 min-[400px]:block" aria-hidden="true" />
          <span className="truncate">สแกนภาพ</span>
        </Link>
      </div>

      <div className="mt-3">
        <SearchBar key={tab} size="lg" placeholder={current.placeholder} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        <span className="text-sm text-ink-400">ลองค้นดู:</span>
        {CHIPS.map((c) => (
          <Link
            key={c}
            href={`/search?q=${encodeURIComponent(c)}`}
            className="rounded-chip bg-primary-50 px-3.5 py-1.5 text-sm font-medium text-ink-600 hover:bg-primary-100 hover:text-primary-700"
          >
            {c}
          </Link>
        ))}
      </div>
    </div>
  );
}
