"use client";

import type { MatchedTerm } from "@/lib/api/types";

/**
 * The sentence with each matched term selectable (§5, TokenizedSentence).
 * Spans are built from `matched_terms` UTF-16 offsets into the exact sentence
 * text (§7) — JS string indexing is already UTF-16, so text.slice(start,end)
 * lines up with the backend offsets. The selected term is solid blue; other
 * annotated terms are underlined (matching the design's จึ้ง / เอาอยู่).
 *
 * Non-matched runs are plain text. We do NOT invent word boundaries in the
 * unspaced Thai — only the backend's matched terms are interactive (§8.2).
 */
export function TokenizedSentence({
  text,
  terms,
  selectedStart,
  onSelect,
}: {
  text: string;
  terms: MatchedTerm[];
  selectedStart: number | null;
  onSelect: (term: MatchedTerm) => void;
}) {
  // The backend reports every dictionary match, including overlapping ones
  // (อากาศ / อากาศดี). Keep the longest match at each position and skip spans
  // that overlap one already shown.
  const ordered = [...terms].sort((a, b) => a.start - b.start || b.end - a.end);

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  ordered.forEach((term, i) => {
    if (term.start < cursor) return;
    if (term.start > cursor) {
      parts.push(<span key={`t-${i}`}>{text.slice(cursor, term.start)}</span>);
    }
    const selected = term.start === selectedStart;
    parts.push(
      <button
        key={`m-${i}`}
        type="button"
        onClick={() => onSelect(term)}
        aria-pressed={selected}
        aria-label={`ดูความหมายของ ${term.text} ในประโยคนี้`}
        className={
          selected
            ? "rounded-control bg-primary-500 px-2 py-0.5 font-semibold text-white"
            : "rounded-sm px-0.5 font-semibold text-ink-900 underline decoration-teal-500 decoration-2 underline-offset-4 hover:bg-teal-50"
        }
      >
        {text.slice(term.start, term.end)}
      </button>
    );
    cursor = term.end;
  });

  if (cursor < text.length) {
    parts.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-3 text-2xl leading-[1.9] text-ink-900">
      {parts}
    </p>
  );
}
