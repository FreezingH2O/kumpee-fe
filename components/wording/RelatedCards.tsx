import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import type { LanguageResult } from "@/lib/api/types";

/** Small AI tag used on suggestion cards (§0.2 — labeled, not violet-decorated). */
function AiTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-chip bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
      <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
      คำแนะนำโดย AI
    </span>
  );
}

/** The three bottom cards: คำใกล้เคียง / ตัวอย่างเพิ่มเติม / ลองค้นหาเพิ่มเติม. */
export function RelatedCards({ result }: { result: LanguageResult }) {
  const near = result.alternatives ?? [];
  const examples = result.examples ?? [];
  const related = result.related_searches ?? [];

  if (!near.length && !examples.length && !related.length) return null;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {near.length ? (
        <section className="rounded-card border border-line bg-surface shadow-card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink-900">คำใกล้เคียง</h3>
            <AiTag />
          </div>
          <p className="mb-3 text-sm text-ink-600">
            คำที่มีความหมายใกล้เคียง เลือกตามความหมายและบริบท
          </p>
          <div className="flex flex-wrap gap-2">
            {near.map((w) => (
              <span
                key={w}
                className="rounded-chip border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-900"
              >
                {w}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {examples.length ? (
        <section className="rounded-card border border-line bg-surface shadow-card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink-900">ตัวอย่างเพิ่มเติม</h3>
            {examples.some((e) => e.generation) ? <AiTag /> : null}
          </div>
          <ul className="space-y-2">
            {examples.map((ex) => (
              <li
                key={ex.text}
                className="flex items-center justify-between gap-3 rounded-control border border-line bg-canvas px-4 py-3 text-sm text-ink-900"
              >
                <span>“{ex.text}”</span>
                <ClipboardIcon
                  className="h-4 w-4 shrink-0 text-ink-400"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section className="rounded-card border border-line bg-surface shadow-card p-4">
          <h3 className="mb-2 flex items-center gap-1.5 font-semibold text-ink-900">
            <MagnifyingGlassIcon className="h-5 w-5 text-ink-400" />
            ลองค้นหาเพิ่มเติม
          </h3>
          <p className="mb-3 text-sm text-ink-600">
            ค้นหาคำที่เกี่ยวข้องเพื่อขยายความเข้าใจ
          </p>
          <div className="flex flex-wrap gap-2">
            {related.map((w) => (
              <a
                key={w}
                href={`/search?q=${encodeURIComponent(w)}`}
                className="flex items-center gap-1.5 rounded-chip border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-600 hover:border-primary-500 hover:text-primary-600"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                {w}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
