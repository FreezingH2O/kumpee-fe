import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import type { FeaturedWord } from "@/lib/api/server";

/** Part-of-speech chip: source abbreviation → readable label + accent. */
const POS: Record<string, { label: string; className: string }> = {
  "น.": { label: "คำนาม", className: "bg-primary-50 text-primary-700" },
  "ก.": { label: "คำกริยา", className: "bg-teal-50 text-teal-700" },
  "ว.": { label: "คำวิเศษณ์", className: "bg-rose-50 text-rose-600" },
};

/** "คำที่น่ารู้วันนี้" card — a real dictionary entry, with its source. */
export function WordCard({ word }: { word: FeaturedWord }) {
  const pos = word.partOfSpeech ? POS[word.partOfSpeech] : undefined;
  return (
    <Link
      href={`/search?q=${encodeURIComponent(word.headword)}`}
      className="group flex h-full flex-col rounded-card border border-line bg-surface shadow-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-float"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-3xl font-extrabold leading-heading text-ink-900">{word.headword}</span>
          {word.partOfSpeech ? (
            <span
              className={`rounded-chip px-2.5 py-0.5 text-xs font-semibold ${
                pos?.className ?? "bg-slate100 text-ink-600"
              }`}
            >
              {pos?.label ?? word.partOfSpeech}
            </span>
          ) : null}
        </div>
        <ArrowUpRightIcon
          className="mt-2 h-5 w-5 shrink-0 text-ink-400 transition group-hover:text-primary-600"
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 line-clamp-3 text-[15px] leading-body text-ink-600">{word.definition}</p>

      <div className="mt-auto pt-4">
        {word.example ? (
          <p className="line-clamp-2 rounded-control bg-slate100 px-4 py-3 text-sm text-ink-900">
            “{word.example}”
          </p>
        ) : null}
        {word.sourceTitle ? (
          <p className="mt-2 truncate text-xs text-ink-400">ที่มา: {word.sourceTitle}</p>
        ) : null}
      </div>
    </Link>
  );
}
