import {
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { SourceEntry, ProvenanceTag } from "@/lib/api/types";
import { TAG_STYLES } from "@/lib/provenance";

/**
 * SourceBlock — one dictionary entry from ONE source. Every source renders in an
 * IDENTICAL block; the official dictionary gets no extra visual weight, only
 * its tag differs (front-end.md §5, D2 frame 44:26). Source separation and the
 * provenance triple are the product's core promise (§0.1) — definitions are
 * never merged.
 *
 * The tag comes from the DATA (entry.tag, derived via lib/provenance), never
 * chosen by this component, and its meaning is carried in text + the accessible
 * name, never by colour alone (§10). Sense numbers and labels like (โบ) are shown
 * exactly as in the source.
 */

const TAG_ICON: Record<ProvenanceTag, typeof BookOpenIcon> = {
  เชื่อถือได้: BookOpenIcon,
  เฉพาะทาง: DocumentTextIcon,
  ชุมชน: UsersIcon,
  ยังไม่ตรวจสอบ: SparklesIcon,
};

export function SourceBlock({ entry }: { entry: SourceEntry }) {
  const Icon = TAG_ICON[entry.tag];
  const tagStyle = TAG_STYLES[entry.tag];

  return (
    <article
      className="flex items-start gap-3 rounded-control border border-line bg-surface p-4"
      aria-label={`${entry.source_name} — ${tagStyle.accessibleLabel}`}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-canvas text-ink-600"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-ink-600">{entry.source_name}</h3>
          <span className={`rounded-chip px-2 py-0.5 text-xs font-medium ${tagStyle.className}`}>
            {entry.tag}
          </span>
          {entry.variety_code !== "th-central" ? (
            <span className="rounded-chip bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              {entry.variety_label}
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-sm font-semibold text-ink-900">
          {entry.headword}
          {entry.homograph_number ? ` ${entry.homograph_number}` : ""}
        </p>

        <ul className="mt-2 space-y-1.5">
          {entry.definitions.map((def, i) => (
            <li
              key={`${def.source_record_id}-${i}`}
              className="flex gap-2 text-[17px] leading-body text-ink-900"
            >
              {def.number ? <span className="shrink-0 text-ink-400">{def.number}</span> : null}
              <span className="min-w-0">{def.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
