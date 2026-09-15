import { SparklesIcon } from "@heroicons/react/24/outline";
import type { ContemporaryNote } from "@/lib/api/types";

/**
 * "คำร่วมสมัย / คำแสลง" — contextual usage guidance shown on the not-found and
 * AI-only states. Generated content, so it is AI-labeled and unverified.
 */
export function ContemporaryCard({ note }: { note: ContemporaryNote }) {
  const unverified = note.generation.review_status !== "approved";
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-ink-900">คำร่วมสมัย / คำแสลง</h3>
        <span className="inline-flex items-center gap-1 rounded-chip bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
          <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
          อธิบายเป็นภาษากลาง{unverified ? " · ยังไม่ตรวจสอบ" : ""}
        </span>
      </div>
      <dl className="space-y-2">
        {note.rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[9rem_1fr] gap-2 text-sm">
            <dt className="text-ink-400">{row.label}</dt>
            <dd className="text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-ink-400">
        สร้างโดย AI · {note.generation.provider} · {note.generation.model}
      </p>
    </section>
  );
}
