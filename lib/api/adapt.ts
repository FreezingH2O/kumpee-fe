/**
 * Backend wire → display model.
 *
 * The backend returns dictionary entries (EntryOut) and generated sections
 * wrapped as { status, content, creation_method, review_status }. Components
 * render the flatter model in lib/api/types.ts. Everything here is a pure
 * mapping: nothing is invented, and provenance (source, AI provider/model,
 * review status) is carried through to every block (§0.1/§0.2).
 */

import type {
  ApiResponse,
  AudioAvailability,
  CreationMethod,
  GeneratedText,
  GenerationMeta,
  LabeledInterpretation,
  LanguageResult,
  LiveAssistResult,
  MatchedTerm,
  MatchedTermSense,
  Pronunciation,
  ReviewStatus,
  SourceEntry,
  WebEvidence,
} from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { tagForSource, type SourceKind } from "@/lib/provenance";
import type {
  WireEntry,
  WireGeneratedSection,
  WireGeneratedText,
  WireLanguageResult,
  WireLiveAssistResult,
  WirePronunciation,
  WireSection,
  WireSense,
} from "@/lib/api/wire";

const CREATION: readonly CreationMethod[] = ["source_import", "human_authored", "ai_generated"];
const REVIEW: readonly ReviewStatus[] = ["unreviewed", "approved", "disputed", "rejected"];

const asCreation = (v: string): CreationMethod =>
  (CREATION as readonly string[]).includes(v) ? (v as CreationMethod) : "source_import";
// Unknown review states are treated as unreviewed, never as approved.
const asReview = (v: string): ReviewStatus =>
  (REVIEW as readonly string[]).includes(v) ? (v as ReviewStatus) : "unreviewed";

/* ------------------------------------------------------------------ lexicon */

export function sourceKindForEntry(entry: WireEntry): SourceKind {
  // Technical-term lexicons are English headwords with Thai equivalents.
  if (entry.variety_code === "en") return "specialist";
  return "official";
}

export function adaptPronunciation(p: WirePronunciation): Pronunciation {
  const availability: AudioAvailability =
    p.audio_availability === "supported" || p.audio_availability === "unavailable"
      ? p.audio_availability
      : "unsupported";
  return {
    id: p.id,
    revision: p.revision,
    variety_id: p.variety_id,
    written_reading: p.written_reading,
    phonetic: p.phonetic_text,
    notation_system: p.notation_system,
    audio_availability: availability,
  };
}

export function adaptEntry(entry: WireEntry): SourceEntry {
  const kind = sourceKindForEntry(entry);
  const firstDefinition = entry.senses.flatMap((s) => s.definitions)[0];
  return {
    entry_id: entry.id,
    source_id: entry.source_id ?? firstDefinition?.source_id ?? entry.id,
    source_name:
      entry.source_title ?? firstDefinition?.source_title ?? "แหล่งข้อมูลไม่ระบุชื่อ",
    headword: entry.headword,
    homograph_number: entry.homograph_number ?? null,
    variety_code: entry.variety_code,
    variety_label: entry.variety_name_th,
    secondary: entry.presentation === "secondary",
    tag: tagForSource(kind, asCreation(entry.creation_method), asReview(entry.review_status)),
    definitions: entry.senses.flatMap((sense) =>
      sense.definitions.map((d) => ({
        source_id: d.source_id ?? entry.source_id ?? "",
        source_record_id: d.source_record_id ?? d.id,
        source_locator: d.source_locator ?? "",
        text: d.text,
        number: sense.source_number ?? null,
        part_of_speech: sense.part_of_speech ?? null,
        creation_method: asCreation(d.creation_method),
        review_status: asReview(d.review_status),
      }))
    ),
  };
}

/** Related headwords named by the source itself (synonyms, "X ก็ว่า", cross
 *  references) — used for "ลองค้นหาเพิ่มเติม". */
function relatedFromEntries(entries: WireEntry[], headword: string): string[] {
  const out = new Set<string>();
  for (const entry of entries) {
    for (const sense of entry.senses) {
      for (const r of sense.relations ?? []) out.add(r.target_text);
      for (const x of sense.cross_references ?? []) out.add(x.target_headword);
    }
  }
  out.delete(headword);
  return [...out].filter(Boolean).slice(0, 8);
}

function examplesFromEntries(entries: WireEntry[]): string[] {
  const out = new Set<string>();
  for (const entry of entries) {
    for (const sense of entry.senses) {
      for (const ex of sense.examples ?? []) out.add(ex.text.trim());
    }
  }
  return [...out].filter(Boolean).slice(0, 4);
}

/** Display fields derived from a set of dictionary entries (word view). */
export function adaptEntries(entries: WireEntry[], query: string): Partial<LanguageResult> {
  // Primary entries first; central Thai before dialects; source order otherwise.
  const ordered = [...entries].sort(
    (a, b) =>
      Number(a.presentation === "secondary") - Number(b.presentation === "secondary") ||
      Number(a.variety_code !== "th-central") - Number(b.variety_code !== "th-central")
  );
  const first = ordered[0];
  const headword = first?.headword ?? query;
  const pos =
    first?.part_of_speech ?? first?.senses.find((s) => s.part_of_speech)?.part_of_speech ?? null;
  return {
    headword,
    part_of_speech: pos,
    // Only the headline variety's readings: dialect tone notation must not be
    // shown as the reading of a Central Thai headword.
    pronunciations: ordered
      .filter((e) => e.variety_code === first?.variety_code)
      .flatMap((e) => e.pronunciations)
      .map(adaptPronunciation),
    dictionary_results: ordered.map(adaptEntry),
    examples: examplesFromEntries(ordered).map((text) => ({ text, generation: null })),
    related_searches: relatedFromEntries(ordered, headword),
  };
}

/** The sense to show for a matched term in the sentence view, resolved from the
 *  public entry records (GET /v1/entries/{id}). */
export function senseForMatchedTerm(
  term: Pick<MatchedTerm, "selected_sense_id" | "ambiguous">,
  entries: WireEntry[]
): MatchedTermSense | null {
  const senses: { entry: WireEntry; sense: WireSense }[] = entries.flatMap((entry) =>
    entry.senses.map((sense) => ({ entry, sense }))
  );
  if (!senses.length) return null;
  const chosen =
    senses.find((s) => s.sense.id === term.selected_sense_id) ??
    senses.find((s) => s.entry.variety_code === "th-central") ??
    senses[0];
  const definition = chosen.sense.definitions[0];
  const near = (chosen.sense.relations ?? [])
    .filter((r) => r.relation_type !== "translation")
    .map((r) => r.target_text);
  return {
    headword: chosen.entry.headword,
    register_label: chosen.sense.register_labels?.[0] ?? null,
    meaning: definition?.text ?? "",
    near,
    note:
      term.ambiguous && senses.length > 1
        ? `คำนี้มี ${senses.length} ความหมายในพจนานุกรม ความหมายที่แสดงอาจไม่ตรงกับบริบท — เปิดหน้าคำแปลเพื่อดูทั้งหมด`
        : null,
    source_name: chosen.entry.source_title ?? definition?.source_title ?? null,
    generation: null,
  };
}

/* ----------------------------------------------------------------- language */

function generationFor(
  wire: WireLanguageResult,
  section?: { creation_method: CreationMethod; review_status: ReviewStatus }
): GenerationMeta {
  return {
    provider: wire.generation?.provider ?? "ไม่ระบุผู้ให้บริการ",
    model: wire.generation?.model ?? "ไม่ระบุโมเดล",
    creation_method: section?.creation_method ?? "ai_generated",
    review_status: section?.review_status ?? wire.generation?.review_status ?? "unreviewed",
  };
}

function adaptMeaning(
  wire: WireLanguageResult,
  section: WireSection<WireGeneratedSection>,
  evidence: WebEvidence[]
): GeneratedText {
  return {
    text: section.content.text,
    generation: generationFor(wire, section),
    disclaimer: section.content.ambiguity ?? null,
    evidence: evidence.length ? evidence : undefined,
  };
}

function adaptInterpretation(
  section: WireSection<WireGeneratedSection> | null | undefined
): LabeledInterpretation | null {
  if (!section) return null;
  const { labels = [], justification, ambiguity, text } = section.content;
  return {
    labels,
    unclear: labels.length === 0 && !!ambiguity,
    justification: justification || ambiguity || text || "",
  };
}

function adaptGeneratedText(
  wire: WireLanguageResult,
  section: WireSection<WireGeneratedText> | null | undefined
) {
  if (!section) return null;
  const c = section.content;
  return {
    output_text: c.text,
    target: { language: c.target_language, variety_id: c.target_variety_id ?? null },
    explanation: c.explanation ?? null,
    unresolved_terms: c.unresolved_terms ?? [],
    generation: generationFor(wire, section),
    evidence_ids: section.evidence_ids ?? [],
  };
}

export function adaptLanguageResult(
  wire: WireLanguageResult,
  /** The exact text the request was made with — matched-term offsets index into it. */
  requestText: string
): LanguageResult {
  const entries = wire.dictionary_results ?? [];
  const web: WebEvidence[] = (wire.sources ?? [])
    .filter((s) => s.type === "web" && s.url)
    .map((s) => ({
      evidence_id: s.id,
      source: s.title ?? s.url!,
      quote: s.title ?? s.url!,
      date: null,
      url: s.url!,
    }));

  const matched: MatchedTerm[] = (wire.matched_terms ?? []).map((m) => ({
    text: m.original_text,
    start: m.start,
    end: m.end,
    candidate_entry_ids: m.candidate_entry_ids,
    candidate_sense_ids: m.candidate_sense_ids,
    selected_sense_id: m.selected_sense_id,
    ambiguous: m.ambiguity,
    source_refs: m.source_ids,
    sense: null,
  }));

  return {
    view: wire.view,
    status: wire.status ?? "complete",
    selected_text: wire.selected_text ?? requestText,
    ...(entries.length ? adaptEntries(entries, requestText) : { headword: requestText }),
    meaning: wire.meaning ? adaptMeaning(wire, wire.meaning, []) : null,
    intents: adaptInterpretation(wire.intents),
    mood: adaptInterpretation(wire.mood),
    tone: adaptInterpretation(wire.tone),
    formality: adaptInterpretation(wire.formality),
    matched_terms: matched,
    translation: adaptGeneratedText(wire, wire.translation),
    rewrite: adaptGeneratedText(wire, wire.rewrite),
    alternatives: (wire.alternatives ?? []).map((a) => a.text).filter(Boolean),
    needs_context: wire.needs_context ?? false,
    follow_up_question: wire.follow_up_question ?? null,
    web_evidence: web,
    warnings: wire.warnings ?? [],
  };
}

export function adaptLiveResult(wire: WireLiveAssistResult, requestText: string): LiveAssistResult {
  return {
    ...adaptLanguageResult(wire.result, requestText),
    client_request_id: wire.client_request_id,
    document_id: wire.document_id,
    document_revision: wire.document_revision,
    selection_sequence: wire.selection_sequence,
  };
}

/** Map the data of a successful envelope, passing errors through unchanged. */
export function mapResponse<T, U>(res: ApiResponse<T>, fn: (data: T) => U): ApiResponse<U> {
  if (isApiError(res)) return res;
  return { ...res, data: fn(res.data) };
}
