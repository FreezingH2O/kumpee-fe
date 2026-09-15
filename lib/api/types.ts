/**
 * คัมภีร์ API types.
 *
 * Two layers:
 *  - the envelope + REQUEST bodies below mirror the backend wire contract
 *    exactly (snake_case, §7/§8/§13);
 *  - the RESULT model (LanguageResult and friends) is the display model the
 *    components render. lib/api/adapt.ts builds it from the raw backend
 *    response (lib/api/wire.ts), so provenance is carried through, never
 *    invented.
 */

/* ------------------------------------------------------------------ envelope */

/** §7 allowed result statuses. `complete` is the success case. */
export type MetaStatus =
  | "complete"
  | "partial"
  | "needs_context"
  | "insufficient_evidence"
  | "unsupported";

/** §0.5 — cache flags are cosmetic. Read for display/diagnostics only. */
export interface CacheMeta {
  hit: boolean;
  layer: string | null;
}

export interface Meta {
  schema_version: string; // "1"
  status: MetaStatus;
  cache: CacheMeta;
  warnings: string[];
  /** Quiet metadata shown on the found screen (§5). Optional; backend may omit. */
  dataset_version?: string | null;
}

export interface ApiSuccess<T> {
  request_id: string;
  data: T;
  meta: Meta;
}

/** §4/§7 error shape. Retry only when `retryable` is true. */
export interface ApiErrorBody {
  code: string;
  message: string;
  retryable: boolean;
  details: Record<string, unknown>;
}

export interface ApiError {
  request_id: string;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError<T>(r: ApiResponse<T>): r is ApiError {
  return (r as ApiError).error !== undefined;
}

/** A short Thai message for an error envelope, with a hint for auth failures. */
export function errorMessage(err: ApiErrorBody): string {
  switch (err.code) {
    case "AUTHENTICATION_REQUIRED":
      return "กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้";
    case "GUEST_LIMIT_REACHED":
      return "คุณใช้ AI ฟรีครบจำนวนสำหรับวันนี้แล้ว — เข้าสู่ระบบเพื่อใช้งานต่อได้ไม่จำกัด";
    case "INVALID_TOKEN":
      return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง";
    case "INVALID_API_KEY":
      return "API key ของระบบไม่ถูกต้อง หมดอายุ หรือถูกเพิกถอน (KAMPHEE_GUEST_API_TOKEN)";
    case "AUTH_NOT_CONFIGURED":
      return "backend ยังไม่ได้ตั้งค่าการยืนยันตัวตนด้วย Supabase";
    case "INSUFFICIENT_SCOPE":
      return "สิทธิ์ของ token นี้ไม่พอสำหรับการใช้งานส่วนนี้";
    case "RATE_LIMITED":
      return "มีการใช้งานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่";
    case "UPSTREAM_UNREACHABLE":
      return "เชื่อมต่อ backend ไม่สำเร็จ";
    default:
      return err.message || "เกิดข้อผิดพลาด";
  }
}

/** Errors a signed-in user wouldn't get — show a เข้าสู่ระบบ link with them. */
export const needsLogin = (err: ApiErrorBody) =>
  err.code === "AUTHENTICATION_REQUIRED" ||
  err.code === "GUEST_LIMIT_REACHED" ||
  err.code === "INVALID_TOKEN";

/* ------------------------------------------------------------- shared request */

export interface LanguageVarietyRef {
  language: string; // e.g. "th", "en"
  /** The UI pickers must expose variety, not just language (§4/§8.2). */
  variety_id?: string | null;
}

/** §7/§8.2/§13 — half-open UTF-16 code-unit offsets into the exact,
 *  unnormalized text. `text` is the sliced substring, sent for verification. */
export interface Selection {
  start: number;
  end: number;
  unit: "utf16";
  text: string;
}

export interface RequestContext {
  recipient?: string | null;
  occasion?: string | null;
  additional_context?: string | null;
}

export type Formality = "preserve" | "informal" | "neutral" | "formal";
export type RewriteStyle = "concise" | "gentle" | "clear";
export type WebSearchPolicy = "auto" | "never" | "always";
export type CachePolicy = "use" | "refresh" | "bypass";

export interface Preferences {
  formality?: Formality;
  style?: RewriteStyle[];
  explanation_language?: string;
}

export interface RequestOptions {
  web_search?: WebSearchPolicy;
  cache?: CachePolicy;
}

/** Shared body for search/lookup/analyze/translate/rewrite (§8.2). Everything
 *  but `text` has a backend default. `target` is REQUIRED for translate and
 *  must be OMITTED for analyze. Unknown fields are rejected. */
export interface LanguageRequest {
  text: string;
  selection?: Selection | null;
  source?: LanguageVarietyRef;
  target?: LanguageVarietyRef | null;
  context?: RequestContext;
  preferences?: Preferences;
  options?: RequestOptions;
}

export type SearchMode = "auto" | "word" | "sentence";

export type ResultSectionKey =
  | "dictionary_results"
  | "meaning"
  | "intents"
  | "mood"
  | "tone"
  | "formality"
  | "matched_terms"
  | "translation"
  | "rewrite";

export interface SearchRequest extends LanguageRequest {
  mode?: SearchMode;
  include?: ResultSectionKey[];
}

/** §13 live/assist adds client identity + revision/sequence, outside the
 *  reusable cache payload. */
export type LiveTask = "translate" | "analyze" | "lookup" | "rewrite";

export interface LiveAssistRequest extends LanguageRequest {
  client_request_id: string;
  document_id?: string | null;
  document_revision: string;
  selection_sequence: number;
  task: LiveTask;
}

/* --------------------------------------------------------- provenance & data */

/** §5.1 — kept orthogonal on every generated/imported record. */
export type CreationMethod = "source_import" | "human_authored" | "ai_generated";
export type ReviewStatus = "unreviewed" | "approved" | "disputed" | "rejected";

/** The four provenance tags shown on a SourceBlock (front-end.md §5, and the
 *  real D2 frame 44:26). Derived from source kind + creation/review, never
 *  hardcoded in the component — see lib/provenance.ts. */
export type ProvenanceTag =
  | "เชื่อถือได้" // authoritative / verified source
  | "เฉพาะทาง" // specialist lexicon
  | "ชุมชน" // community
  | "ยังไม่ตรวจสอบ"; // unverified (AI or unreviewed)

/** One meaning from ONE source. Always carries its provenance triple; never
 *  merged across sources (§0.1). */
export interface SourceDefinition {
  source_id: string;
  source_record_id: string;
  source_locator: string;
  text: string;
  /** Verbatim sense number from the source (e.g. "๑."), when it has one. */
  number?: string | null;
  part_of_speech?: string | null;
  creation_method: CreationMethod;
  review_status: ReviewStatus;
}

/** One dictionary entry from a single source — the SourceBlock model. Entries
 *  with the same spelling in different sources/varieties stay separate. */
export interface SourceEntry {
  entry_id: string;
  source_id: string;
  source_name: string;
  headword: string;
  /** The source's own entry number (e.g. "๒" for ตา ๒). */
  homograph_number?: string | null;
  variety_code: string;
  variety_label: string;
  /** Older edition duplicated by a newer one — render collapsed. */
  secondary: boolean;
  /** UI convenience: derived with tagForSource(), not trusted from a raw field. */
  tag: ProvenanceTag;
  definitions: SourceDefinition[];
}

/** Dialect coverage row on the found screen's dialect-block (D2 44:26). */
export type CoverageLevel = "covered" | "in_progress" | "unsupported";

export interface DialectEquivalent {
  variety_id: string;
  variety_label: string; // e.g. "เหนือ (คำเมือง)"
  form: string | null; // null when not yet covered
  coverage: CoverageLevel;
}

/* ---------------------------------------------------- pronunciation & audio */

/** §6 / §27 — the pronunciation's own audio capability. The runtime button
 *  state (AudioButtonState) is derived on top of this; never hardcode enabled. */
export type AudioAvailability = "supported" | "unavailable" | "unsupported";

export interface Pronunciation {
  id: string;
  revision: number;
  variety_id: string | null;
  written_reading: string | null; // e.g. "ความ-คิด"
  phonetic: string | null; // e.g. "[ khwaam-khít ]"
  notation_system: string | null;
  audio_availability: AudioAvailability;
}

/** Derived, per §27.8 button lifecycle. Not a wire type. */
export type AudioButtonState =
  | "idle_supported"
  | "preparing"
  | "ready"
  | "unsupported"
  | "provider_unavailable"
  | "error";

/* ------------------------------------------------------- generated sections */

/** Provenance carried by any generated block, so AiBlock can label it (§0.2). */
export interface GenerationMeta {
  provider: string;
  model: string;
  creation_method: CreationMethod; // always "ai_generated" for AiBlock
  review_status: ReviewStatus;
}

/** §10 web evidence — each item links out and is marked ยังไม่ตรวจสอบ.
 *  Citation presence is not proof of support (§8.3). */
export interface WebEvidence {
  evidence_id: string;
  source: string;
  quote: string;
  date: string | null;
  url: string;
}

export interface GeneratedText {
  text: string;
  generation: GenerationMeta;
  disclaimer?: string | null;
  evidence?: WebEvidence[];
}

/* ------------------------------------------------------------- result model */

export type ResultView = "word" | "sentence" | "mixed";

/** §8.3 — mood/intent allow multiple labels + an unclear/context-dependent
 *  value, with a short justification. NEVER a made-up confidence percentage. */
export interface LabeledInterpretation {
  labels: string[];
  unclear: boolean;
  justification: string;
}

/** The sense shown in the selected-word sidebar. When `generation` is present
 *  the sense is AI-derived and must be labeled (§0.2); dictionary senses carry
 *  their source name instead. */
export interface MatchedTermSense {
  headword: string;
  register_label?: string | null; // e.g. "คำร่วมสมัย", "แสลง"
  meaning: string;
  near?: string[];
  note?: string | null;
  source_name?: string | null;
  generation?: GenerationMeta | null;
}

/** §8.3 — a tappable span in the sentence view. Offsets are half-open UTF-16
 *  code units into the original sentence text (§7). `ambiguous` marks a term
 *  with more than one candidate sense. */
export interface MatchedTerm {
  text: string;
  start: number;
  end: number;
  candidate_entry_ids: string[];
  candidate_sense_ids: string[];
  selected_sense_id: string | null;
  ambiguous: boolean;
  source_refs: string[];
  sense?: MatchedTermSense | null;
}

export interface TranslationResult {
  output_text: string;
  target: LanguageVarietyRef;
  explanation?: string | null;
  unresolved_terms?: string[];
  generation: GenerationMeta;
  evidence_ids?: string[];
}

/** §2.1 rewrite. The backend does not return a "preserved" checklist; its
 *  preservation checks surface as `warnings` on the result instead. */
export interface RewriteResult {
  output_text: string;
  target: LanguageVarietyRef;
  explanation?: string | null;
  unresolved_terms?: string[];
  generation: GenerationMeta;
}

/** An example sentence. May be source- or AI-provenanced; render an AI tag
 *  when generated. */
export interface ExampleItem {
  text: string;
  generation?: GenerationMeta | null;
}

/** The "คำร่วมสมัย / คำแสลง" guidance card — always AI-labeled. */
export interface ContemporaryNote {
  rows: { label: string; value: string }[];
  generation: GenerationMeta;
}

/** The display payload for คำแปล / Live / คำอ่าน, built by lib/api/adapt.ts.
 *  Every field optional — the shape drives which state renders (§2). */
export interface LanguageResult {
  view: ResultView;
  status?: MetaStatus;
  selected_text?: string | null;
  headword?: string | null;
  part_of_speech?: string | null;
  gloss?: string | null;
  pronunciations?: Pronunciation[];
  dictionary_results?: SourceEntry[];
  dialects?: DialectEquivalent[];
  meaning?: GeneratedText | null;
  intents?: LabeledInterpretation | null;
  mood?: LabeledInterpretation | null;
  tone?: LabeledInterpretation | null;
  formality?: LabeledInterpretation | null;
  matched_terms?: MatchedTerm[];
  translation?: TranslationResult | null;
  rewrite?: RewriteResult | null;
  /** Labeled AI hypothesis used by the not-found state (§5). */
  ai_hypothesis?: GeneratedText | null;
  alternatives?: string[]; // คำใกล้เคียง (AI-suggested)
  examples?: ExampleItem[]; // ตัวอย่างเพิ่มเติม
  related_searches?: string[]; // ลองค้นหาเพิ่มเติม
  contemporary?: ContemporaryNote | null; // คำร่วมสมัย / คำแสลง
  needs_context?: boolean;
  follow_up_question?: string | null;
  /** Public web pages a provisional explanation drew on (§10). */
  web_evidence?: WebEvidence[];
  warnings?: string[];
}

/** Live echoes back the client identity fields (§13). */
export interface LiveAssistResult extends LanguageResult {
  client_request_id: string;
  document_id: string | null;
  document_revision: string;
  selection_sequence: number;
}

/* ------------------------------------------------------- derived UI helpers */

/** Which คำแปล state to render, from the response shape (§2). */
export type SearchState = "found" | "not_found" | "ai_only";

export function searchStateFor(result: LanguageResult): SearchState {
  if ((result.dictionary_results?.length ?? 0) > 0) return "found";
  if (result.ai_hypothesis) return "not_found";
  if (result.meaning?.generation.creation_method === "ai_generated") return "ai_only";
  return "not_found";
}
