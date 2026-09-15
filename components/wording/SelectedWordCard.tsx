import Link from "next/link";
import {
  BookOpenIcon,
  SparklesIcon,
  ChevronRightIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { MatchedTermSense } from "@/lib/api/types";

/**
 * Selected-word sidebar for the sentence view — the contextual sense of the
 * tapped term (§5). The sense here is AI-derived, so it is labeled and marked
 * unverified (§0.2); the meaning never appears as a plain, unattributed gloss.
 */
export function SelectedWordCard({ sense }: { sense: MatchedTermSense }) {
  const ai = !!sense.generation;
  const unverified = sense.generation?.review_status !== "approved";

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 font-semibold text-ink-900">
        <BookOpenIcon className="h-5 w-5 text-ink-400" aria-hidden="true" />
        คำที่เลือก: <span className="text-primary-600">{sense.headword}</span>
      </h2>

      <section
        className={
          ai
            ? "rounded-card border border-violet-600/20 bg-violet-50 p-4"
            : "rounded-card border border-line bg-surface shadow-card p-4"
        }
        aria-label={
          ai
            ? `${sense.headword} — ความหมายในบริบทโดย AI${unverified ? " ยังไม่ตรวจสอบ" : ""}`
            : sense.headword
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-ink-900">
            “{sense.headword}”
          </span>
          {sense.register_label ? (
            <span className="rounded-chip bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              {sense.register_label}
            </span>
          ) : null}
        </div>

        {ai ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-violet-600">
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            AI{unverified ? " · ยังไม่ตรวจสอบ" : ""}
          </p>
        ) : null}

        <div className="mt-3">
          <p className="text-xs font-medium text-ink-400">
            {ai
              ? "ความหมายในบริบทนี้"
              : `ความหมายจาก${sense.source_name ? ` ${sense.source_name}` : "พจนานุกรม"}`}
          </p>
          <p className="mt-1 text-[17px] leading-body text-ink-900">
            {sense.meaning}
          </p>
        </div>

        {sense.near?.length ? (
          <div className="mt-3">
            <p className="text-xs font-medium text-ink-400">คำใกล้เคียง</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {sense.near.map((w) => (
                <Link
                  key={w}
                  href={`/search?q=${encodeURIComponent(w)}`}
                  className="rounded-chip border border-line bg-surface px-3.5 py-1 text-sm font-medium text-ink-900 hover:border-primary-500"
                >
                  {w}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <Link
          href={`/search?q=${encodeURIComponent(sense.headword)}`}
          className="mt-4 flex items-center justify-between rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-900 hover:border-primary-500"
        >
          <span className="flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 text-ink-400" />
            เปิดหน้าคำแปล
          </span>
          <ChevronRightIcon className="h-4 w-4 text-ink-400" />
        </Link>

        {ai ? (
          <p className="mt-3 text-xs text-ink-400">
            สร้างโดย AI · {sense.generation!.provider} · {sense.generation!.model}
          </p>
        ) : null}
      </section>

      {sense.note ? (
        <section className="rounded-card border border-line bg-surface shadow-card p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <LightBulbIcon className="h-4 w-4 text-amber-700" aria-hidden="true" />
            คำแนะนำ
          </h3>
          <p className="mt-2 text-sm leading-body text-ink-600">{sense.note}</p>
        </section>
      ) : null}
    </div>
  );
}
