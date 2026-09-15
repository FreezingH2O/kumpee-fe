"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import type { ApiSuccess, LanguageResult, MatchedTerm } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { getEntry } from "@/lib/api/client";
import { senseForMatchedTerm } from "@/lib/api/adapt";
import type { WireEntry } from "@/lib/api/wire";
import { SentenceMeaningCard } from "@/components/wording/SentenceMeaningCard";
import { TokenizedSentence } from "@/components/wording/TokenizedSentence";
import { SelectedWordCard } from "@/components/wording/SelectedWordCard";
import { TranslateCard } from "@/components/wording/TranslateCard";

const MAX_CANDIDATE_ENTRIES = 5;

/**
 * คำแปล sentence view (§5). Plain meaning + interpretation tiles, a tokenized
 * sentence whose dictionary-matched terms are tappable, and a selected-word
 * sidebar resolved from the public entry records. Exits: rewrite / translate.
 */
export function SentenceResult({ response }: { response: ApiSuccess<LanguageResult> }) {
  const result = response.data;
  const terms = result.matched_terms ?? [];
  const text = result.selected_text ?? "";

  const [selectedStart, setSelectedStart] = useState<number | null>(terms[0]?.start ?? null);
  const [showTranslate, setShowTranslate] = useState(false);
  const selected = terms.find((t) => t.start === selectedStart) ?? terms[0] ?? null;

  const rewriteHref = `/rewrite?text=${encodeURIComponent(text)}`;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      {/* mode toggle */}
      <div className="mb-6 flex justify-center">
        <div className="flex gap-1 rounded-chip bg-slate100 p-1">
          <span className="rounded-chip bg-surface px-4 py-2 text-sm font-medium text-primary-600 shadow-sm">
            ความหมายและคำแปล
          </span>
          <Link
            href={rewriteHref}
            className="rounded-chip px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            ปรับข้อความ
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_360px] lg:gap-4">
        {/* meaning + tiles */}
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <SentenceMeaningCard result={result} />
        </div>

        {/* tokenized sentence */}
        <section className="order-2 rounded-card border border-line bg-surface p-5 lg:col-start-1 lg:row-start-2">
          <h2 className="font-semibold text-ink-900">แตะคำเพื่อดูความหมายในบริบท</h2>
          <p className="mt-1 text-sm text-ink-600">
            {terms.length
              ? "เลือกคำที่ขีดเส้นใต้เพื่อดูความหมายจากพจนานุกรม"
              : "ไม่พบคำในประโยคนี้ที่ตรงกับพจนานุกรม"}
          </p>
          <div className="mt-4 rounded-control bg-canvas p-5">
            <TokenizedSentence
              text={text}
              terms={terms}
              selectedStart={selected?.start ?? null}
              onSelect={(t: MatchedTerm) => setSelectedStart(t.start)}
            />
          </div>
        </section>

        {/* selected-word sidebar */}
        <aside className="order-3 space-y-4 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          {selected ? <SelectedTerm term={selected} /> : null}
          {showTranslate ? <TranslateCard text={text} /> : null}
        </aside>

        {/* exits */}
        <section className="order-4 rounded-card border border-primary-100 bg-primary-50 p-5 lg:col-start-1 lg:row-start-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ChatBubbleLeftRightIcon
                className="mt-0.5 h-6 w-6 shrink-0 text-primary-600"
                aria-hidden="true"
              />
              <div>
                <h2 className="font-semibold text-ink-900">อยากสื่อสารแบบไหนต่อ?</h2>
                <p className="mt-1 text-sm text-ink-600">
                  ปรับข้อความให้เหมาะกับสถานการณ์ หรือแปลเป็นภาษาอื่น
                  เพื่อสื่อสารได้ตรงใจยิ่งขึ้น
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={rewriteHref}
                className="inline-flex items-center gap-2 rounded-control bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
              >
                <PencilSquareIcon className="h-5 w-5" />
                ปรับข้อความ
              </Link>
              <button
                type="button"
                aria-pressed={showTranslate}
                onClick={() => setShowTranslate((v) => !v)}
                className="inline-flex items-center gap-2 rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-600 hover:border-primary-500"
              >
                <GlobeAltIcon className="h-5 w-5" />
                แปล
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Loads the candidate entries of a matched term (public, no token) and shows its sense. */
function SelectedTerm({ term }: { term: MatchedTerm }) {
  const entryIds = term.candidate_entry_ids.slice(0, MAX_CANDIDATE_ENTRIES);
  const query = useQuery({
    queryKey: ["entries", ...entryIds],
    queryFn: async ({ signal }) => {
      const results = await Promise.all(entryIds.map((eid) => getEntry(eid, signal)));
      return results.flatMap((r) => (isApiError(r) ? [] : [r.data])) as WireEntry[];
    },
    staleTime: 5 * 60_000,
  });

  if (query.isPending) {
    return (
      <div className="rounded-card border border-line bg-surface p-4 text-sm text-ink-400">
        กำลังโหลดความหมายของ “{term.text}”…
      </div>
    );
  }
  const sense = query.data ? senseForMatchedTerm(term, query.data) : null;
  if (!sense) {
    return (
      <div className="rounded-card border border-line bg-surface p-4 text-sm text-ink-600">
        โหลดความหมายของ “{term.text}” ไม่สำเร็จ
      </div>
    );
  }
  return <SelectedWordCard sense={sense} />;
}
