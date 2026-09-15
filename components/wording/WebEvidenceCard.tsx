import { LinkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { WebEvidence } from "@/lib/api/types";

/**
 * "หลักฐานที่ใช้อธิบาย" — the web evidence a provisional explanation was grounded
 * in (§10). Each item links out and the whole card is marked unverified.
 * Citation presence is not proof of support (§8.3) — the heading says so.
 */
export function WebEvidenceCard({ evidence }: { evidence: WebEvidence[] }) {
  if (!evidence.length) return null;
  return (
    <section className="rounded-card border border-line bg-surface shadow-card p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1.5 font-semibold text-ink-900">
          <LinkIcon className="h-5 w-5 text-ink-400" aria-hidden="true" />
          หลักฐานที่ใช้อธิบาย
        </h3>
        <span className="rounded-chip bg-slate100 px-2 py-0.5 text-xs text-ink-600">
          พบเว็บ {evidence.length} แหล่ง
        </span>
      </div>
      <p className="mb-3 text-sm text-ink-600">
        คำอธิบายไม่มีในพจนานุกรม คำอธิบายด้านบนสร้างขึ้นจากตัวอย่างการใช้จริงที่พบบนเว็บ
        คุณสามารถกดตรวจสอบต้นทางเพื่อตรวจสอบเองได้
      </p>
      <ul className="space-y-2">
        {evidence.map((ev) => (
          <li
            key={ev.evidence_id}
            className="rounded-control border border-line p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">{ev.source}</p>
                <p className="mt-0.5 text-[15px] leading-body text-ink-900">
                  “{ev.quote}”
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  {ev.date ? ev.date : "ไม่ระบุวันที่"}
                </p>
              </div>
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`เปิดแหล่งที่มา: ${ev.source}`}
                className="shrink-0 rounded-control p-1 text-primary-600 hover:bg-primary-50"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-xs text-amber-700">
        หลักฐานจากเว็บยังไม่ผ่านการตรวจสอบ
      </p>
    </section>
  );
}
