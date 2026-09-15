import { BookOpenIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import type { DialectEquivalent } from "@/lib/api/types";
import { COVERAGE_LABEL } from "@/lib/provenance";

/**
 * Dialect equivalents block (D2 44:26). Coverage is reported per variety
 * (§1 / §8 — support is per-variety, never assume all dialects work). Uncovered
 * varieties show their real coverage state, not a fabricated form.
 */
export function DialectBlock({ dialects }: { dialects: DialectEquivalent[] }) {
  return (
    <article className="flex items-start gap-3 rounded-control border border-line bg-surface p-4">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-canvas text-ink-600"
        aria-hidden="true"
      >
        <BookOpenIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-ink-600">ภาษาถิ่น</h3>
          <span className="rounded-chip bg-slate100 px-2 py-0.5 text-xs font-medium text-ink-600">
            ถิ่น
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {dialects.map((d) => (
            <li key={d.variety_id} className="flex flex-wrap items-center gap-2">
              <span className="rounded-chip bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                {d.variety_label}
              </span>
              <span className="text-[17px] text-ink-900">{d.form ?? "—"}</span>
              <span
                className={`rounded-chip px-2 py-0.5 text-xs ${
                  d.coverage === "covered"
                    ? "bg-green-50 text-green-700"
                    : "bg-slate100 text-ink-400"
                }`}
              >
                {COVERAGE_LABEL[d.coverage]}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            className="rounded-control border border-line px-3 py-1.5 text-ink-600 hover:bg-slate100"
          >
            อธิบายเป็นภาษากลาง
          </button>
          <ArrowsRightLeftIcon className="h-4 w-4 text-ink-400" aria-hidden="true" />
          <button
            type="button"
            className="rounded-control border border-line px-3 py-1.5 text-ink-600 hover:bg-slate100"
          >
            แปลเป็นภาษาถิ่น
          </button>
        </div>
      </div>
    </article>
  );
}
