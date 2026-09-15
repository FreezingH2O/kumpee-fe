"use client";

import {
  BookOpenIcon,
  SpeakerWaveIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import type { LanguageResult } from "@/lib/api/types";
import { AiBlock } from "@/components/AiBlock";
import { InterpretationTile } from "@/components/wording/InterpretationTile";

/**
 * "ประโยคนี้หมายถึง" — the plain-language sentence meaning plus the four
 * interpretation tiles. The meaning is generated, so it is rendered through
 * AiBlock (violet, labeled, with provenance) rather than a plain card (§0.2).
 * Sentence read-aloud is out of scope (§27 covers vocabulary audio only), so
 * the speaker control is present but disabled.
 */
export function SentenceMeaningCard({ result }: { result: LanguageResult }) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
          <BookOpenIcon className="h-5 w-5 text-primary-600" aria-hidden="true" />
          ประโยคนี้หมายถึง
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            title="การอ่านออกเสียงประโยคยังไม่รองรับ"
            aria-label="อ่านออกเสียง (ยังไม่รองรับ)"
            className="cursor-not-allowed rounded-control p-2 text-ink-400"
          >
            <SpeakerWaveIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="คัดลอกคำอธิบาย"
            disabled={!result.meaning}
            onClick={() =>
              result.meaning &&
              navigator.clipboard?.writeText(result.meaning.text).catch(() => {})
            }
            className="rounded-control p-2 text-ink-400 hover:bg-slate100 hover:text-ink-600"
          >
            <ClipboardIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      {result.meaning ? (
        <AiBlock label="วิเคราะห์โดย AI" content={result.meaning} />
      ) : (
        <p className="rounded-control bg-slate100 p-4 text-sm text-ink-600">
          {result.status === "needs_context" || result.needs_context
            ? "ต้องการบริบทเพิ่มเติมเพื่ออธิบายข้อความนี้"
            : "ยังไม่มีหลักฐานเพียงพอที่จะอธิบายข้อความนี้"}
        </p>
      )}

      {result.follow_up_question ? (
        <p className="mt-3 text-sm text-ink-600">{result.follow_up_question}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {result.intents ? (
          <InterpretationTile kind="intent" data={result.intents} />
        ) : null}
        {result.mood ? (
          <InterpretationTile kind="mood" data={result.mood} />
        ) : null}
        {result.tone ? (
          <InterpretationTile kind="tone" data={result.tone} />
        ) : null}
        {result.formality ? (
          <InterpretationTile kind="formality" data={result.formality} />
        ) : null}
      </div>

      <p className="mt-3 text-xs text-ink-400">
        การตีความจากข้อความและบริบทที่ให้
      </p>
    </section>
  );
}
