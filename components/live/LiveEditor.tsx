"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type {
  ApiResponse,
  LiveAssistResult,
  LiveAssistRequest,
  LiveTask,
  Formality,
  MatchedTermSense,
} from "@/lib/api/types";
import { errorMessage, isApiError } from "@/lib/api/types";
import { liveAssist, listEntries, newRequestId } from "@/lib/api/client";
import { senseForMatchedTerm } from "@/lib/api/adapt";
import { SelectedWordCard } from "@/components/wording/SelectedWordCard";
import { SentenceMeaningCard } from "@/components/wording/SentenceMeaningCard";
import { RewriteSelectionCard } from "@/components/live/RewriteSelectionCard";

const INITIAL = `อัปเดตงานให้ทีม — ปิดสปรินต์

สวัสดีทุกคน สรุปสั้น ๆ ของวันนี้นะ เราปิดงานที่ค้างไว้ได้ครบทุกตัวแล้ว และเดินหน้าฝั่งลูกค้าผ่านไปได้ด้วยดี งานวันนี้จึ้งมาก ทีมเราเอาอยู่!

ขอบคุณทุกคนที่ช่วยกันดันจนจบ พรุ่งนี้เจอกันตอนเช้าเพื่อวางแผนสปรินต์ถัดไป`;

/** Selections up to this length also get a dictionary lookup (public, no token). */
const DICTIONARY_LOOKUP_MAX = 30;

type SegmenterLike = {
  segment(input: string): Iterable<{ isWordLike?: boolean }>;
};
type SegmenterCtor = new (
  locale: string,
  options: { granularity: "word" }
) => SegmenterLike;

function countThaiWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  // Prefer real Thai word segmentation where available.
  const Seg = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (Seg) {
    try {
      const seg = new Seg("th", { granularity: "word" });
      let n = 0;
      for (const s of seg.segment(t)) if (s.isWordLike) n++;
      return n;
    } catch {
      /* fall through to heuristic */
    }
  }
  return Math.max(1, Math.round(t.replace(/\s/g, "").length / 3));
}

type Sel = { start: number; end: number };

/**
 * คำแปล Live — the §7 selection protocol against POST /v1/live/assist.
 *
 * The editor is a <textarea>: selectionStart/End are half-open UTF-16 code-unit
 * offsets into the exact, unnormalized value, which is precisely what §7 needs.
 * We:
 *   - debounce a settled selection ~300ms, then request `analyze`,
 *   - request `rewrite` only when the user asks (register buttons / ปรับข้อความ),
 *   - abort superseded fetches,
 *   - render a response ONLY if document_revision AND selection_sequence still
 *     match current editor state (else discard — it's for a stale selection),
 *   - never mutate the document from a suggestion: แทนที่ replaces the range on
 *     explicit click; คัดลอก is the non-destructive path.
 */
export function LiveEditor() {
  const [text, setText] = useState(INITIAL);
  const [selection, setSelection] = useState<Sel | null>(null);
  const [formality, setFormality] = useState<Formality>("neutral");

  const [analysis, setAnalysis] = useState<LiveAssistResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rewrite, setRewrite] = useState<LiveAssistResult | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  const [sense, setSense] = useState<MatchedTermSense | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const revisionRef = useRef("r1");
  const sequenceRef = useRef(0);
  const analyzeAbort = useRef<AbortController | null>(null);
  const rewriteAbort = useRef<AbortController | null>(null);
  const lookupAbort = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSelKey = useRef<string>("");

  const wordCount = useMemo(() => countThaiWords(text), [text]);

  const isCurrent = (seq: number, revision: string) =>
    revision === revisionRef.current && seq === sequenceRef.current;

  const cancelInflight = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    for (const ref of [analyzeAbort, rewriteAbort, lookupAbort]) {
      ref.current?.abort();
      ref.current = null;
    }
    setAnalyzing(false);
    setRewriting(false);
  };

  const request = useCallback(
    async (
      task: LiveTask,
      sel: Sel,
      seq: number,
      revision: string,
      formalityArg: Formality,
      signal: AbortSignal
    ): Promise<ApiResponse<LiveAssistResult>> => {
      const value = taRef.current?.value ?? "";
      const body: LiveAssistRequest = {
        text: value,
        selection: {
          start: sel.start,
          end: sel.end,
          unit: "utf16",
          text: value.slice(sel.start, sel.end),
        },
        source: { language: "th", variety_id: null },
        // analyze must not carry a target; rewrite stays in Thai.
        ...(task === "rewrite" ? { target: { language: "th", variety_id: null } } : {}),
        preferences: { formality: formalityArg, style: [], explanation_language: "th" },
        client_request_id: newRequestId(),
        document_id: null,
        document_revision: revision,
        selection_sequence: seq,
        task,
      };
      return liveAssist(body, signal);
    },
    []
  );

  const runAnalyze = useCallback(
    async (sel: Sel, seq: number, revision: string) => {
      analyzeAbort.current?.abort();
      const controller = new AbortController();
      analyzeAbort.current = controller;
      setAnalyzing(true);
      setError(null);
      try {
        const res = await request("analyze", sel, seq, revision, "preserve", controller.signal);
        if (!isCurrent(seq, revision)) return; // stale — discard silently (§7)
        if (isApiError(res)) setError(errorMessage(res.error));
        else if (
          res.data.document_revision === revisionRef.current &&
          res.data.selection_sequence === sequenceRef.current
        )
          setAnalysis(res.data);
        setAnalyzing(false);
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return; // superseded
        setError("ขออภัย ระบบช่วยเหลือขัดข้อง ลองเลือกข้อความอีกครั้ง");
        setAnalyzing(false);
      }
    },
    [request]
  );

  const runRewrite = useCallback(
    async (sel: Sel, seq: number, revision: string, formalityArg: Formality) => {
      rewriteAbort.current?.abort();
      const controller = new AbortController();
      rewriteAbort.current = controller;
      setRewriting(true);
      setRewriteError(null);
      try {
        const res = await request("rewrite", sel, seq, revision, formalityArg, controller.signal);
        if (!isCurrent(seq, revision)) return;
        if (isApiError(res)) setRewriteError(errorMessage(res.error));
        else if (!res.data.rewrite) setRewriteError("ยังปรับข้อความส่วนนี้ไม่ได้ ลองใหม่อีกครั้ง");
        else setRewrite(res.data);
        setRewriting(false);
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
        setRewriteError("ขออภัย ระบบปรับข้อความขัดข้อง ลองใหม่อีกครั้ง");
        setRewriting(false);
      }
    },
    [request]
  );

  const runLookup = useCallback(async (selectedText: string, seq: number, revision: string) => {
    lookupAbort.current?.abort();
    const controller = new AbortController();
    lookupAbort.current = controller;
    try {
      const res = await listEntries(selectedText, controller.signal);
      if (!isCurrent(seq, revision) || isApiError(res)) return;
      const entries = res.data.items;
      setSense(
        entries.length
          ? senseForMatchedTerm({ selected_sense_id: null, ambiguous: true }, entries)
          : null
      );
    } catch {
      /* dictionary lookup is best-effort */
    }
  }, []);

  const onSelectionChange = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start === end) {
      // empty selection — clear the rail, cancel any pending work
      lastSelKey.current = "";
      cancelInflight();
      setSelection(null);
      setAnalysis(null);
      setRewrite(null);
      setSense(null);
      return;
    }
    const key = `${start}:${end}`;
    if (key === lastSelKey.current) return; // unchanged
    lastSelKey.current = key;

    cancelInflight();
    setSelection({ start, end });
    setAnalysis(null);
    setRewrite(null);
    setRewriteError(null);
    setSense(null);
    const seq = ++sequenceRef.current;
    const revision = revisionRef.current;
    const selectedText = el.value.slice(start, end).trim();

    debounceRef.current = setTimeout(() => {
      runAnalyze({ start, end }, seq, revision);
      if (selectedText && selectedText.length <= DICTIONARY_LOOKUP_MAX) {
        runLookup(selectedText, seq, revision);
      }
    }, 300); // §7 debounce settled selection
  }, [runAnalyze, runLookup]);

  useEffect(() => () => cancelInflight(), []);

  const onTextChange = (v: string) => {
    setText(v);
    revisionRef.current = "r" + (Number(revisionRef.current.slice(1)) + 1); // old offsets invalid
    lastSelKey.current = "";
    cancelInflight();
    setSelection(null);
    setAnalysis(null);
    setRewrite(null);
    setSense(null);
  };

  const onFormality = (f: Formality) => {
    setFormality(f);
    // re-run for the SAME selection (same revision + sequence) at the new register
    if (selection) runRewrite(selection, sequenceRef.current, revisionRef.current, f);
  };

  const onGenerateRewrite = () => {
    if (selection) runRewrite(selection, sequenceRef.current, revisionRef.current, formality);
  };

  const onReplace = () => {
    const output = rewrite?.rewrite?.output_text;
    if (!selection || !output) return;
    const value = taRef.current?.value ?? text;
    // explicit, destructive — the only path that mutates the document
    onTextChange(value.slice(0, selection.start) + output + value.slice(selection.end));
  };

  const onCopy = () => {
    const output = rewrite?.rewrite?.output_text;
    if (output) navigator.clipboard?.writeText(output).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        {/* editor */}
        <section className="rounded-card border border-line bg-surface p-5">
          <header className="mb-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-ink-600">
              <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
              ข้อความของคุณ
            </span>
            <span className="text-ink-400">{wordCount} คำ</span>
          </header>
          <label htmlFor="live-editor" className="sr-only">
            พิมพ์หรือวางข้อความยาว แล้วลากคลุมส่วนที่อยากให้ช่วย
          </label>
          <textarea
            id="live-editor"
            ref={taRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onSelect={onSelectionChange}
            onKeyUp={onSelectionChange}
            onMouseUp={onSelectionChange}
            spellCheck={false}
            className="min-h-[420px] w-full resize-y rounded-control bg-transparent text-[17px] leading-body text-ink-900 outline-none"
          />
          <p className="mt-2 text-sm text-ink-400">
            ✎ ลากคลุมข้อความที่สนใจเพื่อดูความหมายและปรับข้อความ
          </p>
        </section>

        {/* selection rail */}
        <aside className="space-y-4">
          {!selection ? (
            <div className="rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-400">
              ลากคลุมข้อความในเอกสารเพื่อดูความหมาย น้ำเสียง และปรับข้อความ
            </div>
          ) : (
            <>
              {sense ? <SelectedWordCard sense={sense} /> : null}

              {error ? (
                <div className="rounded-card border border-line bg-surface p-6 text-sm text-ink-600">
                  {error}
                </div>
              ) : analysis ? (
                <SentenceMeaningCard result={analysis} />
              ) : (
                <div className="rounded-card border border-line bg-surface p-6 text-sm text-ink-400">
                  กำลังวิเคราะห์ส่วนที่เลือก…
                </div>
              )}

              <RewriteSelectionCard
                rewrite={rewrite?.rewrite ?? null}
                warnings={rewrite?.warnings ?? []}
                error={rewriteError}
                formality={formality}
                onFormality={onFormality}
                onGenerate={onGenerateRewrite}
                onReplace={onReplace}
                onCopy={onCopy}
                busy={rewriting}
              />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
