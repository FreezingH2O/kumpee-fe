import Link from "next/link";
import {
  ArrowDownTrayIcon,
  KeyIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { AppShell } from "@/components/shell/AppShell";

/**
 * คลังคำ (developer) — §5. Dataset stats, the endpoint list (§4) with scope,
 * a sample envelope, the meta.status vocabulary, a rate-limit gauge, and the
 * สถานะการพัฒนา panel (§8). Dataset export is shown as coming-soon (not a working
 * download). Numbers are illustrative (mock) — real values come from /capabilities.
 */
const ENDPOINTS = [
  { m: "GET", p: "/v1/entries", scope: "สาธารณะ", d: "ค้นหาคำ แยกตามแหล่งข้อมูล" },
  { m: "GET", p: "/v1/entries/{id}", scope: "สาธารณะ", d: "รายละเอียดคำ พร้อม source_locator" },
  { m: "GET", p: "/v1/entries/{id}/pronunciations", scope: "สาธารณะ", d: "คำอ่านและระบบสัทอักษร" },
  { m: "GET", p: "/v1/sources", scope: "สาธารณะ", d: "ข้อมูลแหล่งอ้างอิงและเงื่อนไขการใช้" },
  { m: "GET", p: "/v1/capabilities", scope: "สาธารณะ", d: "งาน/สำเนียง/ขีดจำกัดที่รองรับจริง" },
  { m: "POST", p: "/v1/lookup", scope: "ต้องมีคีย์", d: "ค้นแบบพจนานุกรม" },
  { m: "POST", p: "/v1/search", scope: "ต้องมีคีย์", d: "ค้นรวมคำ/วลี/ประโยค" },
  { m: "POST", p: "/v1/analyze", scope: "ต้องมีคีย์", d: "ความหมาย/เจตนา/อารมณ์/น้ำเสียง" },
  { m: "POST", p: "/v1/translate", scope: "ต้องมีคีย์", d: "แปล (ต้องระบุ target)" },
  { m: "POST", p: "/v1/rewrite", scope: "ต้องมีคีย์", d: "ปรับข้อความตามบริบท" },
  { m: "POST", p: "/v1/live/assist", scope: "ต้องมีคีย์", d: "ช่วยเหลือขณะเลือกข้อความใน Live" },
];

const STATUS_VALUES = [
  "complete",
  "partial",
  "needs_context",
  "insufficient_evidence",
  "unsupported",
];

const READY = [
  "คำ / ความหมายแยกตามแหล่ง",
  "ตัวแปลบริบท (เจตนา / อารมณ์ / น้ำเสียง)",
  "แปลข้ามภาษา",
  "เขียนใหม่ (rewrite)",
  "แปลสด Live เลือกข้อความ",
  "อ่าน entries / sources ผ่าน API",
];
const IN_PROGRESS = [
  "อัปโหลดเอกสาร · OCR · แก้ไขข้อความ",
  "สถานะประมวลผลรายหน้า (job API)",
  "ดาวน์โหลดชุดข้อมูลฉบับเสถียร (export)",
  "สังเคราะห์เสียงอ่านศัพท์ (Milestone 7)",
  "ความพร้อมของภาษาถิ่นทุกถิ่น",
];

const SAMPLE = `GET https://kumpee-be.vercel.app/v1/entries?query=ตา

→ { "request_id": "…",
    "data": { "query": "ตา", "total": 7,
      "items": [ { "headword": "ตา", "homograph_number": "๑",
        "variety_code": "th-central",
        "source_title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2542",
        "senses": [ { "definitions": [ {
          "source_record_id": "ba38666a-…",
          "source_locator": "DICT_2542 (ก_ฮ).xlsx#Sheet1!R11634" } ] } ] } ] },
    "meta": { "status": "complete", "cache": { "hit": false, "layer": null } } }`;

const SUBNAV = [
  { label: "ชุดข้อมูล", href: "#dataset", active: true },
  { label: "API", href: "#api" },
  { label: "เอกสารนักพัฒนา", href: "#docs" },
  { label: "เสนอคำ", href: "/klangkham/submit" },
];

export default function KlangkhamPage() {
  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span>{" "}
            <span className="text-primary-600">คลังคำ</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">คลังคำ</h1>
          <p className="mt-1 text-sm text-ink-600">
            ชุดข้อมูลคำศัพท์ภาษาไทยและ API ประมวลผลภาษาชุดเดียวกันกับที่เว็บไซต์ใช้งานอยู่
            เปิดให้นักพัฒนานำไปต่อยอดได้
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUBNAV.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`rounded-chip px-3 py-1.5 text-sm font-medium ${
                  s.active
                    ? "bg-primary-50 text-primary-600"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 lg:px-8">
        {/* stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: "128,470", l: "คำในฐานข้อมูล (ตัวอย่าง)" },
            { v: "6", l: "แหล่งข้อมูล" },
            { v: "ไทย + 4 ถิ่น", l: "ภาษา / สำเนียง" },
            { v: "กำลังพัฒนา", l: "สถานะชุดข้อมูล" },
          ].map((s) => (
            <div key={s.l} className="rounded-card border border-line bg-surface p-4">
              <p className="text-2xl font-bold text-ink-900">{s.v}</p>
              <p className="mt-1 text-xs text-ink-400">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            {/* dataset export — coming soon (§8) */}
            <section id="dataset" className="rounded-card border border-line bg-surface p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-ink-900">ชุดข้อมูลคำศัพท์</h2>
                <span className="rounded-chip bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                  ยังไม่เปิดให้โหลด
                </span>
              </div>
              <p className="mb-3 text-sm text-ink-600">
                ชุดข้อมูลจะเปิดให้ดาวน์โหลดแบบ JSONL / JSON เมื่อชุดข้อมูลฉบับเสถียรพร้อมเผยแพร่
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {["JSONL", "JSON"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    disabled
                    className="flex cursor-not-allowed items-center justify-between rounded-control border border-line px-4 py-3 text-sm text-ink-400"
                  >
                    <span>{fmt}</span>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </section>

            {/* endpoints */}
            <section id="api" className="rounded-card border border-line bg-surface p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-semibold text-ink-900">API ที่เปิดให้ใช้</h2>
                <span className="rounded-chip bg-slate100 px-2 py-0.5 text-xs text-ink-600">
                  Base: /v1
                </span>
              </div>
              <ul className="divide-y divide-line">
                {ENDPOINTS.map((e) => (
                  <li key={e.p} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`w-12 shrink-0 rounded px-1.5 py-0.5 text-center text-xs font-semibold ${
                        e.m === "GET"
                          ? "bg-green-50 text-green-700"
                          : "bg-primary-50 text-primary-600"
                      }`}
                    >
                      {e.m}
                    </span>
                    <code className="min-w-0 flex-1 font-mono text-sm text-ink-900">
                      {e.p}
                    </code>
                    <span
                      className={`shrink-0 text-xs ${
                        e.scope === "สาธารณะ" ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {e.scope}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* right column */}
          <div className="space-y-6" id="docs">
            <section className="overflow-hidden rounded-card border border-line bg-ink-900">
              <div className="border-b border-white/10 px-4 py-2 text-xs font-medium text-white/70">
                ตัวอย่างการเรียกใช้
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-white/90">
                {SAMPLE}
              </pre>
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="mb-2 font-semibold text-ink-900">
                ค่า meta.status ที่ต้องรองรับ
              </h2>
              <div className="flex flex-wrap gap-2">
                {STATUS_VALUES.map((s) => (
                  <span
                    key={s}
                    className="rounded-chip bg-slate100 px-2.5 py-1 font-mono text-xs text-ink-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-400">
                unsupported / insufficient_evidence เป็นคำตอบทางภาษาที่ถูกต้อง ไม่ใช่ AI แต่งขึ้น
              </p>
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900">
                <KeyIcon className="h-5 w-5 text-ink-400" /> คีย์และโควตา
              </h2>
              <p className="text-sm text-ink-600">
                รองรับ Supabase JWT หรือคีย์ที่ขึ้นต้นด้วย{" "}
                <code className="font-mono">kh_live_</code>
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-ink-400">
                  <span>อัตราการเรียก (ตัวอย่าง)</span>
                  <span>1,240 / 5,000 ต่อชั่วโมง</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-chip bg-slate100">
                  <span className="block h-full w-1/4 rounded-chip bg-primary-500" />
                </div>
              </div>
              <p className="mt-2 rounded-control bg-amber-50 px-3 py-2 text-xs text-amber-700">
                เกินโควตาจะได้ HTTP 429 · ต้องรอตาม Retry-After
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-control bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
              >
                สร้างคีย์ใหม่
              </button>
            </section>
          </div>
        </div>

        {/* development status (§8) */}
        <section className="rounded-card border border-line bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-ink-900">สถานะการพัฒนา</h2>
            <span className="font-mono text-xs text-ink-400">IMPLEMENTATION_STATUS.md</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-green-700">พร้อมใช้งาน</p>
              <ul className="space-y-1.5">
                {READY.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-ink-900">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-amber-700">
                อยู่ระหว่างพัฒนา / ยังไม่เปิด
              </p>
              <ul className="space-y-1.5">
                {IN_PROGRESS.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-ink-600">
                    <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
