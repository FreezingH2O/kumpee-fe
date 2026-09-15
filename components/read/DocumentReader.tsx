"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DocumentIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  getDocument,
  getDocumentPage,
  assistDocumentSelection,
  correctPageText,
  newRequestId,
  sha256Hex,
} from "@/lib/api/client";
import { errorMessage, isApiError, type LanguageResult } from "@/lib/api/types";
import type {
  DocumentMeta,
  DocumentRange,
  DocumentTask,
  PageContent,
} from "@/lib/api/documentTypes";
import { adaptLanguageResult } from "@/lib/api/adapt";
import { AiBlock } from "@/components/AiBlock";
import { InterpretationTile } from "@/components/wording/InterpretationTile";

export function DocumentReader({ docId }: { docId: string }) {
  if (docId === "demo") return <SampleReader />;
  return <LiveReader docId={docId} />;
}

/* -------------------------------------------------------- live (real backend) */

const POLL_MS = 1500;
const READY_STATES = new Set(["ready", "partial"]);

type Picked = { range: DocumentRange; text: string };

function LiveReader({ docId }: { docId: string }) {
  const [doc, setDoc] = useState<DocumentMeta | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [page, setPage] = useState<PageContent | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [picked, setPicked] = useState<Picked | null>(null);
  const [analysis, setAnalysis] = useState<LanguageResult | null>(null);
  const [translation, setTranslation] = useState<LanguageResult | null>(null);
  const [busyTask, setBusyTask] = useState<DocumentTask | null>(null);
  const [assistError, setAssistError] = useState<string | null>(null);

  const [correcting, setCorrecting] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const textRef = useRef<HTMLDivElement>(null);
  const assistAbort = useRef<AbortController | null>(null);

  // fetch document + poll while it processes
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    async function tick() {
      const res = await getDocument(docId);
      if (!alive) return;
      if (isApiError(res)) {
        setError(errorMessage(res.error));
        return;
      }
      setDoc(res.data);
      const s = res.data.state;
      if (s === "failed") {
        setError(res.data.error?.message || "อ่านเอกสารนี้ไม่สำเร็จ");
      } else if (s === "deleting" || s === "deleted") {
        setError("เอกสารนี้ถูกลบแล้ว");
      } else if (!READY_STATES.has(s)) {
        timer = setTimeout(tick, POLL_MS); // uploaded / queued / processing
      }
    }
    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [docId]);

  const ready = !!doc && READY_STATES.has(doc.state);

  const clearAssist = () => {
    assistAbort.current?.abort();
    setPicked(null);
    setAnalysis(null);
    setTranslation(null);
    setAssistError(null);
    setBusyTask(null);
  };

  // load the current page once the document is readable
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setPageLoading(true);
    getDocumentPage(docId, pageNumber, controller.signal)
      .then((res) => {
        if (isApiError(res)) setError(errorMessage(res.error));
        else setPage(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setPageLoading(false);
      });
    return () => controller.abort();
  }, [docId, pageNumber, ready]);

  const runAssist = useCallback(
    async (task: DocumentTask, target: Picked, revision: number) => {
      assistAbort.current?.abort();
      const controller = new AbortController();
      assistAbort.current = controller;
      setBusyTask(task);
      setAssistError(null);
      try {
        const res = await assistDocumentSelection(
          docId,
          {
            revision,
            ranges: [target.range],
            selected_text_sha256: await sha256Hex(target.text),
            task,
            client_request_id: newRequestId(),
            source: { language: "th", variety_id: null },
            ...(task === "translate" ? { target: { language: "en", variety_id: null } } : {}),
          },
          controller.signal
        );
        if (isApiError(res)) {
          setAssistError(errorMessage(res.error));
        } else {
          const result = adaptLanguageResult(res.data.result, res.data.selected_text);
          if (task === "translate") setTranslation(result);
          else setAnalysis(result);
        }
        setBusyTask(null);
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
        setAssistError("ขออภัย ระบบช่วยอ่านขัดข้อง ลองเลือกข้อความอีกครั้ง");
        setBusyTask(null);
      }
    },
    [docId]
  );

  // selection → analyze (UTF-16 offsets into the page's canonical text)
  const onSelectText = useCallback(() => {
    const container = textRef.current;
    const sel = window.getSelection();
    if (!container || !sel || sel.isCollapsed || !page) return;
    const a = sel.anchorNode;
    const f = sel.focusNode;
    if (!a || !f || !container.contains(a) || !container.contains(f)) return;

    const measure = (node: Node, offset: number) => {
      const r = document.createRange();
      r.selectNodeContents(container);
      r.setEnd(node, offset);
      return r.toString().length; // UTF-16 index into page text
    };
    let start = measure(a, sel.anchorOffset);
    let end = measure(f, sel.focusOffset);
    if (start > end) [start, end] = [end, start];
    if (start === end) return;

    const next: Picked = {
      range: { page_number: page.page_number, start, end },
      text: page.text.slice(start, end),
    };
    if (!next.text.trim()) return;
    clearAssist();
    setPicked(next);
    runAssist("analyze", next, page.revision);
  }, [page, runAssist]);

  async function saveCorrection() {
    if (!page) return;
    setCorrectionError(null);
    const res = await correctPageText(docId, page.page_number, {
      expected_revision: page.revision,
      text: draftText,
    });
    if (isApiError(res)) {
      setCorrectionError(errorMessage(res.error));
      return;
    }
    setPage(res.data); // new document revision; old selections are invalid
    clearAssist();
    setCorrecting(false);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ink-900">{error}</p>
        <p className="mt-2 text-sm text-ink-400">
          ลองดู{" "}
          <Link href="/read/demo" className="text-primary-600 underline">
            เอกสารตัวอย่าง
          </Link>{" "}
          หรือวิธีเชื่อมต่อใน CONNECTING.md
        </p>
        <Link
          href="/read"
          className="mt-4 inline-flex items-center gap-1.5 rounded-control border border-line px-4 py-2 text-sm text-ink-600"
        >
          <ArrowUpTrayIcon className="h-4 w-4" /> อัปโหลดใหม่
        </Link>
      </div>
    );
  }

  const pageCount = doc?.page_count ?? 0;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <section className="min-w-0 rounded-card border border-line bg-surface">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 text-sm">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <DocumentIcon className="h-5 w-5 shrink-0 text-ink-400" />
              <span className="truncate font-medium text-ink-900">
                {doc?.filename ?? "เอกสาร"}
              </span>
              {pageCount ? (
                <span className="rounded-chip bg-slate100 px-2 py-0.5 text-xs text-ink-600">
                  {pageCount} หน้า
                </span>
              ) : null}
              <StatusPill doc={doc} />
            </span>
            <span className="flex items-center gap-2">
              {doc?.original_url ? (
                <a
                  href={doc.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  ไฟล์ต้นฉบับ
                </a>
              ) : null}
              <Link
                href="/read"
                className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-1.5 text-ink-600 hover:border-primary-500"
              >
                <ArrowUpTrayIcon className="h-4 w-4" /> อัปโหลดใหม่
              </Link>
            </span>
          </header>

          <div className="p-6">
            {!ready ? (
              <div className="flex items-center gap-3 rounded-control bg-slate100 px-4 py-6 text-sm text-ink-600">
                <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
                กำลังอ่านเอกสาร…{doc ? ` (${stateLabel(doc.state)})` : ""}
              </div>
            ) : pageLoading && !page ? (
              <p className="text-sm text-ink-400">กำลังโหลดหน้า {pageNumber}…</p>
            ) : page && page.status === "failed" ? (
              <p className="rounded-control bg-amber-50 p-4 text-sm text-amber-700">
                อ่านหน้านี้ไม่สำเร็จ{page.error?.message ? ` — ${page.error.message}` : ""}
              </p>
            ) : page ? (
              <>
                <div
                  ref={textRef}
                  onMouseUp={onSelectText}
                  onKeyUp={onSelectText}
                  className={`whitespace-pre-wrap rounded-control border border-line p-6 text-[17px] leading-body text-ink-900 selection:bg-primary-100 ${
                    pageLoading ? "opacity-50" : ""
                  }`}
                >
                  {page.text}
                </div>
                <p className="mt-3 text-sm text-ink-400">
                  ✎ ลากเลือกข้อความบนเอกสาร เพื่อดูคำอธิบายและคำแปลทางขวา
                </p>
                {page.warnings.length ? (
                  <p className="mt-2 text-xs text-amber-700">{page.warnings.join(" · ")}</p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-ink-400">ไม่พบเนื้อหาหน้านี้</p>
            )}

            {ready && pageCount > 1 ? (
              <nav
                aria-label="เปลี่ยนหน้า"
                className="mt-4 flex items-center justify-center gap-3 text-sm"
              >
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => {
                    clearAssist();
                    setCorrecting(false);
                    setPageNumber((n) => n - 1);
                  }}
                  className="rounded-control border border-line p-2 text-ink-600 disabled:opacity-40"
                  aria-label="หน้าก่อนหน้า"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-ink-600">
                  หน้า {pageNumber} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= pageCount}
                  onClick={() => {
                    clearAssist();
                    setCorrecting(false);
                    setPageNumber((n) => n + 1);
                  }}
                  className="rounded-control border border-line p-2 text-ink-600 disabled:opacity-40"
                  aria-label="หน้าถัดไป"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </nav>
            ) : null}
          </div>
        </section>

        {/* rail */}
        <aside className="min-w-0 space-y-4">
          {page && page.status === "ready" ? (
            <section className="rounded-card border border-line bg-surface p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-ink-900">
                  <DocumentIcon className="h-5 w-5 text-ink-400" /> ข้อความที่อ่านได้
                </h2>
                {!correcting ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftText(page.text);
                      setCorrectionError(null);
                      setCorrecting(true);
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-primary-600"
                  >
                    <PencilIcon className="h-4 w-4" /> แก้ไข
                  </button>
                ) : null}
              </div>
              {correcting ? (
                <div className="space-y-2">
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={6}
                    className="w-full rounded-control border border-line p-2 text-sm outline-none focus:border-primary-500"
                  />
                  {correctionError ? (
                    <p className="text-sm text-amber-700">{correctionError}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveCorrection}
                      className="rounded-control bg-primary-500 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      บันทึกการแก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => setCorrecting(false)}
                      className="rounded-control border border-line px-3 py-1.5 text-sm text-ink-600"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink-400">
                  วิธีอ่าน: {page.extraction_method} · ฉบับแก้ไขที่ {page.revision}
                </p>
              )}
            </section>
          ) : null}

          {picked ? (
            <AssistRail
              picked={picked}
              analysis={analysis}
              translation={translation}
              busyTask={busyTask}
              error={assistError}
              onTranslate={() => page && runAssist("translate", picked, page.revision)}
            />
          ) : page && page.status === "ready" ? (
            <div className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-400">
              ลากเลือกข้อความในเอกสารเพื่อดูความหมายและคำแปล
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

const STATE_LABEL: Record<string, string> = {
  uploaded: "อัปโหลดแล้ว",
  queued: "รอคิว",
  processing: "กำลังประมวลผล",
  ready: "พร้อม",
  partial: "อ่านได้บางหน้า",
  failed: "ไม่สำเร็จ",
  deleting: "กำลังลบ",
  deleted: "ลบแล้ว",
};
const stateLabel = (s: string) => STATE_LABEL[s] ?? s;

function StatusPill({ doc }: { doc: DocumentMeta | null }) {
  if (!doc) return null;
  const ready = READY_STATES.has(doc.state);
  return (
    <span
      className={`flex items-center gap-1 rounded-chip px-2 py-0.5 text-xs ${
        ready ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-green-500" : "bg-amber-500"}`} />
      {ready
        ? `อ่านข้อความแล้ว ${doc.pages_ready}/${doc.page_count ?? doc.pages_ready} หน้า`
        : stateLabel(doc.state)}
    </span>
  );
}

/** Analysis of the selected passage + on-demand translation. */
function AssistRail({
  picked,
  analysis,
  translation,
  busyTask,
  error,
  onTranslate,
}: {
  picked: Picked;
  analysis: LanguageResult | null;
  translation: LanguageResult | null;
  busyTask: DocumentTask | null;
  error: string | null;
  onTranslate: () => void;
}) {
  const tiles = analysis
    ? ([
        ["intent", analysis.intents],
        ["mood", analysis.mood],
        ["tone", analysis.tone],
        ["formality", analysis.formality],
      ] as const)
    : [];

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900">
          <BookOpenIcon className="h-5 w-5 text-primary-600" /> ข้อความนี้หมายถึง
        </h2>
        <p className="mb-3 line-clamp-3 rounded-control bg-slate100 px-3 py-2 text-sm text-ink-600">
          “{picked.text}”
        </p>
        {busyTask === "analyze" ? (
          <p className="text-sm text-ink-400">กำลังวิเคราะห์ส่วนที่เลือก…</p>
        ) : analysis?.meaning ? (
          <>
            <AiBlock label="อธิบายโดย AI" content={analysis.meaning} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {tiles.map(([kind, data]) =>
                data ? <InterpretationTile key={kind} kind={kind} data={data} /> : null
              )}
            </div>
          </>
        ) : analysis ? (
          <p className="text-sm text-ink-600">ยังไม่มีหลักฐานเพียงพอที่จะอธิบายข้อความนี้</p>
        ) : null}
      </section>

      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="mb-2 font-semibold text-ink-900">แปลข้อความที่เลือก</h2>
        {translation?.translation ? (
          <div className="rounded-control border border-violet-600/20 bg-violet-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-violet-600">
              <SparklesIcon className="h-4 w-4" /> แปลโดย AI · ยังไม่ตรวจสอบ
            </p>
            <p className="mt-1.5 text-[15px] leading-body text-ink-900">
              {translation.translation.output_text}
            </p>
            <p className="mt-2 text-xs text-ink-400">
              สร้างโดย AI · {translation.translation.generation.provider} ·{" "}
              {translation.translation.generation.model}
            </p>
          </div>
        ) : translation ? (
          <p className="text-sm text-ink-600">ยังแปลข้อความนี้ไม่ได้</p>
        ) : (
          <button
            type="button"
            onClick={onTranslate}
            disabled={busyTask !== null}
            className="inline-flex items-center gap-2 rounded-control border border-line px-3 py-2 text-sm font-medium text-ink-600 hover:border-primary-500 disabled:opacity-60"
          >
            {busyTask === "translate" ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <GlobeAltIcon className="h-4 w-4" />
            )}
            {busyTask === "translate" ? "กำลังแปล…" : "แปลเป็นภาษาอังกฤษ"}
          </button>
        )}
      </section>

      {error ? (
        <p className="rounded-card border border-amber-700/30 bg-amber-50 p-4 text-sm text-amber-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- sample (/read/demo) */

const SAMPLE = {
  name: "ใบประกาศ_ทุนการศึกษา.pdf",
  pages: 3,
  title: "ประกาศรับสมัครทุนการศึกษา ประจำปี ๒๕๖๘",
  body: [
    "ด้วยคณะกรรมการกองทุนมีมติให้เปิดรับสมัครนิสิตผู้มีความประพฤติดีและขาดแคลนทุนทรัพย์ เพื่อรับทุนการศึกษาในภาคการศึกษาต้น",
    "ผู้ประสงค์จะขอรับทุนต้องยื่นคำร้องพร้อมหลักฐานภายในกำหนด มิฉะนั้นจะถือว่าสละสิทธิ์",
    "ทั้งนี้ ผู้ได้รับการคัดเลือกจะต้องเข้าร่วมกิจกรรมบำเพ็ญประโยชน์ตามที่คณะกรรมการกำหนด",
  ],
  meaning:
    "ถ้าอยากได้ทุน ต้องส่งใบสมัครพร้อมเอกสารให้ทันเวลาที่กำหนด ถ้าส่งไม่ทันจะถือว่าไม่ขอรับทุนแล้ว",
  hardWords: [
    { word: "สละสิทธิ์", meaning: "ยอมเสียสิทธิ์ที่มีอยู่ ไม่ขอรับสิ่งนั้นแล้ว" },
    { word: "คำร้อง", meaning: "เอกสารที่ยื่นเพื่อขอให้พิจารณาเรื่องใดเรื่องหนึ่ง" },
  ],
  translationEn:
    "Applicants must submit the request form with supporting documents by the deadline, or the claim will be forfeited.",
};

function SampleReader() {
  const [selectedWord, setSelectedWord] = useState(0);
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <div className="mb-4 rounded-control border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        เอกสารตัวอย่าง — อัปโหลดไฟล์จริงได้ที่หน้า คำอ่าน
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <section className="rounded-card border border-line bg-surface p-6">
          <article className="rounded-control border border-line p-6">
            <h1 className="text-center text-xl font-bold text-ink-900">
              {SAMPLE.title}
            </h1>
            <div className="mt-4 space-y-3 text-[17px] leading-body text-ink-900">
              {SAMPLE.body.map((p, i) => (
                <p key={i} className={i === 1 ? "rounded bg-primary-100/60 px-1" : ""}>
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-400">ประกาศ ณ วันที่ ๑๒ มีนาคม ๒๕๖๘</p>
          </article>
        </section>
        <aside className="space-y-4">
          <section className="rounded-card border border-line bg-surface p-4">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900">
              <BookOpenIcon className="h-5 w-5 text-primary-600" /> ข้อความนี้หมายถึง
            </h2>
            <p className="text-[15px] leading-body text-ink-900">{SAMPLE.meaning}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-control bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                ระดับภาษา: ทางการ
              </span>
              <span className="rounded-control bg-teal-50 px-3 py-1.5 text-xs text-teal-700">
                ลักษณะ: ข้อความราชการ
              </span>
            </div>
          </section>
          <section className="rounded-card border border-line bg-surface p-4">
            <h2 className="mb-2 font-semibold text-ink-900">คำยากในข้อความนี้</h2>
            <ul className="space-y-2">
              {SAMPLE.hardWords.map((hw, i) => (
                <li key={hw.word}>
                  <button
                    type="button"
                    onClick={() => setSelectedWord(i)}
                    aria-pressed={selectedWord === i}
                    className={`w-full rounded-control border p-3 text-left ${
                      selectedWord === i
                        ? "border-primary-500 bg-primary-50"
                        : "border-line"
                    }`}
                  >
                    <span className="block font-semibold text-primary-600">
                      {hw.word}
                    </span>
                    <span className="block text-sm text-ink-600">{hw.meaning}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-card border border-line bg-surface p-4">
            <h2 className="mb-2 font-semibold text-ink-900">แปลข้อความที่เลือก</h2>
            <div className="rounded-control border border-violet-600/20 bg-violet-50 p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-violet-600">
                <SparklesIcon className="h-4 w-4" /> แปลโดย AI
              </p>
              <p className="mt-1.5 text-[15px] leading-body text-ink-900">
                {SAMPLE.translationEn}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
