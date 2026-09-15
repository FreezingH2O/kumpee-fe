"use client";

import Link from "next/link";
import {
  SparklesIcon,
  PlusCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import type { ApiSuccess, LanguageResult } from "@/lib/api/types";
import { searchStateFor } from "@/lib/api/types";
import { WordHeader } from "@/components/wording/WordHeader";
import { SourcesCard } from "@/components/wording/SourcesCard";
import { TranslateCard } from "@/components/wording/TranslateCard";
import { RelatedCards } from "@/components/wording/RelatedCards";
import { WebEvidenceCard } from "@/components/wording/WebEvidenceCard";
import { ContemporaryCard } from "@/components/wording/ContemporaryCard";
import { AiBlock } from "@/components/AiBlock";

/**
 * The คำแปล result — ONE route, three states, chosen from the response shape
 * (§2): dictionary entries present → found; only a generated meaning → AI-only;
 * nothing found → not-found. Never separate pages.
 */
export function WordingResult({
  response,
  aiAvailable = true,
}: {
  response: ApiSuccess<LanguageResult>;
  /** False when the server has no API token — only the public dictionary was searched. */
  aiAvailable?: boolean;
}) {
  const result = response.data;
  const state = searchStateFor(result);
  const headword = result.headword ?? result.selected_text ?? "";
  const showTranslate = aiAvailable && state !== "not_found";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <WordHeader result={result} />

      {state === "not_found" ? (
        <NotFoundNotice headword={headword} aiAvailable={aiAvailable} />
      ) : null}

      {/* main region: two columns on desktop, stacked on mobile */}
      <div className={`mt-6 grid gap-4 ${showTranslate ? "lg:grid-cols-[1fr_500px]" : ""}`}>
        <div className="min-w-0 space-y-4">
          {state === "found" ? (
            <SourcesCard sources={result.dictionary_results ?? []} meta={response.meta} />
          ) : null}

          {state === "ai_only" && result.meaning ? (
            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="mb-1 text-xl font-semibold text-ink-900">
                คำอธิบายและคำแปล
              </h2>
              <p className="mb-4 text-sm text-ink-600">
                ไม่พบ “{headword}” ในพจนานุกรมที่เชื่อมต่อ คำอธิบายนี้สร้างโดย AI
              </p>
              <AiBlock label="คำอธิบายโดย AI" content={result.meaning} />
              <Link
                href="/klangkham/submit"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
              >
                <PlusCircleIcon className="h-4 w-4" />
                เสนอคำเข้าสู่คลังคำ
              </Link>
            </section>
          ) : null}

          {state === "not_found" && result.ai_hypothesis ? (
            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="mb-4 text-xl font-semibold text-ink-900">
                คำอธิบายและคำแปล
              </h2>
              <AiBlock
                label="คำอธิบายโดย AI"
                content={{ ...result.ai_hypothesis, evidence: undefined }}
              />
            </section>
          ) : null}

          {state !== "found" && result.web_evidence?.length ? (
            <WebEvidenceCard evidence={result.web_evidence} />
          ) : null}

          {result.contemporary ? <ContemporaryCard note={result.contemporary} /> : null}

          {result.follow_up_question ? (
            <p className="flex items-start gap-2 rounded-card border border-line bg-surface p-4 text-sm text-ink-600">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" />
              {result.follow_up_question}
            </p>
          ) : null}
        </div>

        {/* right column — on-demand translation (needs the API token) */}
        {showTranslate ? (
          <div className="min-w-0">
            <TranslateCard text={headword} />
          </div>
        ) : null}
      </div>

      <RelatedCards result={result} />
    </div>
  );
}

function NotFoundNotice({
  headword,
  aiAvailable,
}: {
  headword: string;
  aiAvailable: boolean;
}) {
  return (
    <div className="mt-4 rounded-card border border-violet-600/20 bg-violet-50 p-4">
      <p className="flex items-start gap-2 text-[15px] leading-body text-ink-900">
        <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
        <span>
          ยังไม่พบ “{headword}” ในพจนานุกรมและแหล่งข้อมูลที่เชื่อมต่ออยู่
          <span className="text-ink-600">
            {" "}
            — การไม่พบไม่ได้แปลว่าคำนี้ผิด อาจเป็นคำใหม่หรือคำเฉพาะกลุ่ม
          </span>
        </span>
      </p>
      {!aiAvailable ? (
        <p className="mt-2 text-sm text-ink-600">
          ขณะนี้ค้นได้เฉพาะพจนานุกรมสาธารณะ —{" "}
          <Link
            href={`/login?next=${encodeURIComponent(`/search?q=${headword}`)}`}
            className="font-medium text-primary-600 underline"
          >
            เข้าสู่ระบบ
          </Link>{" "}
          เพื่อดูคำอธิบายโดย AI และการวิเคราะห์ประโยค
        </p>
      ) : null}
      <Link
        href="/klangkham/submit"
        className="mt-3 inline-flex items-center gap-1.5 rounded-control bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
      >
        <PlusCircleIcon className="h-5 w-5" />
        เสนอคำเข้าสู่คลังคำ
      </Link>
    </div>
  );
}
