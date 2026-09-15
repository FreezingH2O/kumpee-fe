"use client";

import { ChevronDownIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { SourceEntry, Meta } from "@/lib/api/types";
import { SourceBlock } from "@/components/SourceBlock";

/**
 * Left column of the found state: one uniform SourceBlock per dictionary entry
 * (§0.1 source separation — entries from different sources/varieties are never
 * merged). Older-edition duplicates (`presentation: secondary`) are collapsed.
 * Quiet dataset + cache metadata sits at the bottom (§5, §0.5).
 */
export function SourcesCard({ sources, meta }: { sources: SourceEntry[]; meta: Meta }) {
  const primary = sources.filter((s) => !s.secondary);
  const secondary = sources.filter((s) => s.secondary);
  const sourceCount = new Set(sources.map((s) => s.source_id)).size;

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-ink-900">ความหมายแยกตามแหล่งข้อมูล</h2>
        <p className="mt-1 text-sm text-ink-600">
          ดูความหมายจากแหล่งที่เชื่อถือได้ และเลือกตามบริบทการใช้งาน
        </p>
      </header>

      <div className="space-y-3">
        {primary.map((entry) => (
          <SourceBlock key={entry.entry_id} entry={entry} />
        ))}
      </div>

      {secondary.length ? (
        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 rounded-control py-2 text-sm font-medium text-primary-600 hover:bg-primary-50">
            ดูฉบับพิมพ์เก่า ({secondary.length} รายการ)
            <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3">
            {secondary.map((entry) => (
              <SourceBlock key={entry.entry_id} entry={entry} />
            ))}
          </div>
        </details>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4" aria-hidden="true" />
          {meta.dataset_version ? `ชุดข้อมูล ${meta.dataset_version} · ` : ""}
          {sources.length} รายการจาก {sourceCount} แหล่ง
        </span>
        {meta.cache.hit ? <span>ผลนี้มาจากแคช</span> : null}
      </div>
    </section>
  );
}
