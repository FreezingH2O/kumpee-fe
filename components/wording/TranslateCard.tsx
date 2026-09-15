"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  ChevronDownIcon,
  ClipboardIcon,
  GlobeAltIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { translate } from "@/lib/api/client";
import { errorMessage, isApiError, needsLogin } from "@/lib/api/types";
import { LoginLink } from "@/components/auth/LoginLink";
import { AiBlock } from "@/components/AiBlock";

/**
 * Right column: translation + explanation, requested on demand via
 * POST /v1/translate. The picker exposes the target language (the API also takes
 * a target variety). The generated translation is rendered through AiBlock, so
 * it is always violet-labeled (§0.2).
 */
const TARGETS = [
  { id: "en", label: "English (ภาษาอังกฤษ)" },
  { id: "zh", label: "中文 (ภาษาจีน)" },
  { id: "ja", label: "日本語 (ภาษาญี่ปุ่น)" },
];

export function TranslateCard({ text }: { text: string }) {
  const [target, setTarget] = useState(TARGETS[0].id);
  const mutation = useMutation({
    mutationFn: (language: string) =>
      translate({
        text,
        source: { language: "th", variety_id: null },
        target: { language, variety_id: null },
      }),
  });

  const res = mutation.data;
  const translation = res && !isApiError(res) ? res.data.translation : null;
  const failure =
    res && isApiError(res)
      ? errorMessage(res.error)
      : res && !translation
        ? "ยังแปลข้อความนี้ไม่ได้ ลองใหม่อีกครั้ง"
        : mutation.isError
          ? "เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง"
          : null;

  return (
    <section className="rounded-card border border-line bg-surface shadow-card p-5">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-ink-900">คำแปลและคำอธิบาย</h2>
        <p className="mt-1 text-sm text-ink-600">แปลความหมายเป็นภาษาอื่น พร้อมคำอธิบายเพิ่มเติม</p>
      </header>

      <label htmlFor="kp-target" className="sr-only">
        เลือกภาษาปลายทาง
      </label>
      <div className="relative">
        <select
          id="kp-target"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            mutation.reset();
          }}
          className="w-full appearance-none rounded-control border border-line bg-surface px-4 py-3 text-[15px] text-ink-900"
        >
          {TARGETS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
      </div>

      {translation ? (
        <div className="mt-4">
          <AiBlock
            label="คำแปลโดย AI"
            content={{
              text: `${translation.output_text}${
                translation.explanation ? ` — ${translation.explanation}` : ""
              }`,
              generation: translation.generation,
              disclaimer: "เลือกคำแปลที่เหมาะกับบริบท",
            }}
          />
        </div>
      ) : null}

      {failure ? (
        <p className="mt-4 text-sm text-amber-700">
          {failure}
          {res && isApiError(res) && needsLogin(res.error) ? (
            <>
              {" "}
              <LoginLink />
            </>
          ) : null}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={mutation.isPending || !text}
          onClick={() => mutation.mutate(target)}
          className="flex w-full items-center justify-center gap-2 rounded-control bg-primary-500 shadow-button py-3 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {mutation.isPending ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <GlobeAltIcon className="h-5 w-5" />
          )}
          {mutation.isPending ? "กำลังแปล…" : translation ? "แปลอีกครั้ง" : "แปล"}
        </button>
        {translation ? (
          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(translation.output_text).catch(() => {})
            }
            className="flex w-full items-center justify-center gap-2 rounded-control bg-slate100 py-3 text-sm font-medium text-ink-600 hover:bg-line"
          >
            <ClipboardIcon className="h-5 w-5" />
            คัดลอกคำแปล
          </button>
        ) : null}
      </div>
    </section>
  );
}
