"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  SparklesIcon,
  ClipboardIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { Formality, LanguageRequest } from "@/lib/api/types";
import { errorMessage, isApiError, needsLogin } from "@/lib/api/types";
import { LoginLink } from "@/components/auth/LoginLink";
import { rewrite } from "@/lib/api/client";
import { REGISTERS } from "@/components/live/RewriteSelectionCard";
import { Field, controlClass } from "@/components/form/Field";

const TARGETS = [
  { id: "th", label: "ไทย (ภาษาไทย)" },
  { id: "en", label: "English (ภาษาอังกฤษ)" },
];

const PRESERVE_OPTIONS = ["ชื่อ", "ตัวเลข/วันที่", "การปฏิเสธ", "ใจความหลัก"];

/**
 * ปรับข้อความ (§5) — POST /v1/rewrite. Recipient and occasion go in `context`;
 * the "keep" chips are passed as additional context. The backend always keeps
 * facts, names, numbers, and negation, and reports what it could not verify as
 * warnings, which are shown with the result.
 */
export function RewriteForm({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("");
  const [formality, setFormality] = useState<Formality>("neutral");
  const [target, setTarget] = useState("th");
  const [preserve, setPreserve] = useState<string[]>(["ชื่อ", "ตัวเลข/วันที่"]);

  const mutation = useMutation({
    mutationFn: (body: LanguageRequest) => rewrite(body),
  });

  function togglePreserve(v: string) {
    setPreserve((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  }

  function run() {
    if (!text.trim()) return;
    mutation.mutate({
      text,
      source: { language: "th", variety_id: null },
      target: { language: target, variety_id: null },
      context: {
        recipient: recipient.trim() || null,
        occasion: occasion.trim() || null,
        additional_context: preserve.length ? `ต้องคงไว้: ${preserve.join(", ")}` : null,
      },
      preferences: { formality, style: [], explanation_language: "th" },
    });
  }

  const res = mutation.data;
  const data = res && !isApiError(res) ? res.data : null;
  const result = data?.rewrite ?? null;
  const failure =
    res && isApiError(res)
      ? errorMessage(res.error)
      : data && !result
        ? "ยังปรับข้อความนี้ไม่ได้ ลองเพิ่มบริบทหรือลองใหม่อีกครั้ง"
        : mutation.isError
          ? "เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง"
          : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* form */}
        <section className="space-y-4 rounded-card border border-line bg-surface shadow-card p-5">
          <Field label="ข้อความต้นฉบับ" required helper="วางข้อความที่ต้องการปรับ">
            {(p) => (
              <textarea
                {...p}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="พิมพ์หรือวางข้อความที่นี่"
                className={controlClass + " resize-y"}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ผู้รับ" helper="เช่น อาจารย์ ลูกค้า เพื่อนร่วมงาน">
              {(p) => (
                <input
                  {...p}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  maxLength={300}
                  className={controlClass}
                  placeholder="ใครคือผู้รับ"
                />
              )}
            </Field>
            <Field label="ใช้ในโอกาสไหน?" helper="เช่น แจ้งลาผ่านแชต อีเมลทางการ">
              {(p) => (
                <input
                  {...p}
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  maxLength={300}
                  className={controlClass}
                  placeholder="โอกาส/สถานการณ์"
                />
              )}
            </Field>
          </div>

          <div>
            <span className="block text-sm font-medium text-ink-900">ระดับภาษา</span>
            <div
              role="group"
              aria-label="ระดับภาษา"
              className="mt-1.5 grid grid-cols-3 gap-1 rounded-control bg-slate100 p-1"
            >
              {REGISTERS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={formality === r.id}
                  onClick={() => setFormality(r.id)}
                  className={`rounded-control px-3 py-1.5 text-sm font-medium ${
                    formality === r.id ? "bg-surface text-primary-600 shadow-sm" : "text-ink-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="ภาษาปลายทาง" helper="ภาษาของข้อความที่ปรับแล้ว">
            {(p) => (
              <select
                {...p}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={controlClass}
              >
                {TARGETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <div>
            <span className="block text-sm font-medium text-ink-900">สิ่งที่ต้องคงไว้</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {PRESERVE_OPTIONS.map((opt) => {
                const on = preserve.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={on}
                    onClick={() => togglePreserve(opt)}
                    className={`rounded-chip border px-3 py-1.5 text-sm ${
                      on
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-line bg-surface text-ink-600"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={run}
            disabled={mutation.isPending || !text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-control bg-primary-500 shadow-button py-3 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <SparklesIcon className="h-5 w-5" />
            )}
            {mutation.isPending ? "กำลังปรับข้อความ…" : "ปรับข้อความ"}
          </button>
        </section>

        {/* result */}
        <section className="rounded-card border border-line bg-surface shadow-card p-5">
          <h2 className="font-semibold text-ink-900">ข้อความที่ปรับแล้ว</h2>
          {failure ? (
            <p className="mt-4 rounded-control bg-amber-50 p-4 text-sm text-amber-700">
              {failure}
              {res && isApiError(res) && needsLogin(res.error) ? (
                <>
                  {" "}
                  <LoginLink />
                </>
              ) : null}
            </p>
          ) : null}
          {!result ? (
            !failure ? (
              <div className="mt-4 rounded-control border border-dashed border-line p-6 text-center text-sm text-ink-400">
                {mutation.isPending
                  ? "กำลังเรียบเรียงข้อความ…"
                  : "กรอกข้อความแล้วกด “ปรับข้อความ” เพื่อดูผลลัพธ์"}
              </div>
            ) : null
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-control border border-violet-600/20 bg-violet-50 p-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-violet-600">
                  <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                  AI ช่วยเรียบเรียง · ยังไม่ตรวจสอบ
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[17px] leading-body text-ink-900">
                  {result.output_text}
                </p>
                <p className="mt-2 text-xs text-ink-400">
                  สร้างโดย AI · {result.generation.provider} · {result.generation.model}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(result.output_text).catch(() => {})}
                  className="inline-flex items-center gap-2 rounded-control bg-primary-500 shadow-button px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                >
                  <ClipboardIcon className="h-5 w-5" /> คัดลอก
                </button>
                <button
                  type="button"
                  disabled
                  title="เสียงอ่านยังไม่เปิดให้บริการ"
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-control border border-line px-4 py-2 text-sm font-medium text-ink-400"
                >
                  <SpeakerWaveIcon className="h-5 w-5" /> ฟัง
                </button>
                <button
                  type="button"
                  onClick={run}
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-2 rounded-control border border-line px-4 py-2 text-sm font-medium text-ink-600 hover:border-primary-500 disabled:opacity-60"
                >
                  <ArrowPathIcon className="h-5 w-5" /> ลองใหม่
                </button>
              </div>

              {result.explanation ? (
                <div>
                  <p className="text-xs font-medium text-ink-400">คำอธิบาย</p>
                  <p className="mt-1 text-[15px] leading-body text-ink-600">
                    {result.explanation}
                  </p>
                </div>
              ) : null}

              {preserve.length ? (
                <div className="rounded-control bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-700">สิ่งที่ขอให้คงไว้</p>
                  <ul className="mt-1.5 space-y-1">
                    {preserve.map((w) => (
                      <li key={w} className="flex items-center gap-1.5 text-sm text-green-700">
                        <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data?.warnings?.length ? (
                <ul className="space-y-1 rounded-control bg-amber-50 p-3 text-sm text-amber-700">
                  {data.warnings.map((w) => (
                    <li key={w} className="flex items-start gap-1.5">
                      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
