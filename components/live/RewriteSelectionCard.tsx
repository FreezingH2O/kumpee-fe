"use client";

import {
  SparklesIcon,
  ArrowsRightLeftIcon,
  ClipboardIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { RewriteResult, Formality } from "@/lib/api/types";

/**
 * "ปรับข้อความที่เลือก" — register-adjusted rewrite of the current selection,
 * requested on demand. The rewrite is generated, so it's violet-labeled (§0.2).
 * The backend's preservation checks (e.g. numbers that may not have been kept)
 * are shown as warnings. แทนที่ replaces the selection (destructive, explicit);
 * คัดลอก is the non-destructive path (§7).
 */
export const REGISTERS: { id: Formality; label: string }[] = [
  { id: "informal", label: "เป็นกันเอง" },
  { id: "neutral", label: "สุภาพ" },
  { id: "formal", label: "ทางการ" },
];

export function RewriteSelectionCard({
  rewrite,
  warnings = [],
  error,
  formality,
  onFormality,
  onGenerate,
  onReplace,
  onCopy,
  busy,
}: {
  rewrite: RewriteResult | null;
  warnings?: string[];
  error?: string | null;
  formality: Formality;
  onFormality: (f: Formality) => void;
  onGenerate: () => void;
  onReplace: () => void;
  onCopy: () => void;
  busy?: boolean;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <h2 className="flex items-center gap-2 font-semibold text-ink-900">
        <SparklesIcon className="h-5 w-5 text-violet-600" aria-hidden="true" />
        ปรับข้อความที่เลือก
      </h2>

      <div
        role="group"
        aria-label="ระดับภาษา"
        className="mt-4 grid grid-cols-3 gap-1 rounded-control bg-slate100 p-1"
      >
        {REGISTERS.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={formality === r.id}
            onClick={() => onFormality(r.id)}
            className={`rounded-control px-3 py-1.5 text-sm font-medium ${
              formality === r.id ? "bg-surface text-primary-600 shadow-sm" : "text-ink-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {rewrite ? (
        <>
          <div
            className="mt-4 rounded-control border border-violet-600/20 bg-violet-50 p-4"
            aria-busy={busy}
          >
            <p className="flex items-center gap-1.5 text-sm font-medium text-violet-600">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              เขียนใหม่โดย AI · ยังไม่ตรวจสอบ
            </p>
            <p className={`mt-2 text-[17px] leading-body text-ink-900 ${busy ? "opacity-50" : ""}`}>
              {rewrite.output_text}
            </p>
            {rewrite.explanation ? (
              <p className="mt-2 text-sm text-ink-600">{rewrite.explanation}</p>
            ) : null}
            <p className="mt-2 text-xs text-ink-400">
              สร้างโดย AI · {rewrite.generation.provider} · {rewrite.generation.model}
            </p>
          </div>

          {warnings.length ? (
            <ul className="mt-3 space-y-1 rounded-control bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {warnings.map((w) => (
                <li key={w} className="flex items-start gap-1.5">
                  <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {w}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onReplace}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-control bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
            >
              <ArrowsRightLeftIcon className="h-5 w-5" />
              แทนที่ข้อความที่เลือก
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-600 hover:border-primary-500"
            >
              <ClipboardIcon className="h-5 w-5" />
              คัดลอก
            </button>
          </div>

          <p className="mt-3 text-xs text-ink-400">
            การแทนที่จะเขียนแทนเฉพาะส่วนที่เลือกไว้ ข้อความอื่นในเอกสารจะคงอยู่ครบ
          </p>
        </>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-control bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {busy ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
          {busy ? "กำลังปรับข้อความ…" : "ปรับข้อความส่วนนี้"}
        </button>
      )}

      {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
    </section>
  );
}
