/**
 * Backend wire types — exactly what https://kumpee-be.vercel.app returns
 * (checked against its /openapi.json and app/schemas in thai-dic).
 *
 * Components don't read these directly: lib/api/adapt.ts maps them onto the
 * display model in lib/api/types.ts. If the backend changes shape, fix it here
 * and in the adapter.
 */

import type { CreationMethod, MetaStatus, ReviewStatus } from "@/lib/api/types";

/* ------------------------------------------------------------------ lexicon */

export interface WireForm {
  id: string;
  original_form: string;
  lookup_form: string | null;
  form_type: string;
  script_metadata: Record<string, unknown>;
}

export interface WirePronunciation {
  id: string;
  revision: number;
  variety_id: string;
  variety_code: string;
  written_reading: string | null;
  phonetic_text: string | null;
  notation_system: string | null;
  audio_availability: "supported" | "unavailable" | "unsupported" | string;
  audio_reason?: string | null;
}

export interface WireDefinition {
  id: string;
  text: string;
  original_text: string | null;
  creation_method: string;
  review_status: string;
  provenance: Record<string, unknown>;
  source_record_id: string | null;
  source_id: string | null;
  source_title: string | null;
  source_locator: string | null;
}

export interface WireExample {
  text: string;
  citation: string | null;
  language: string | null;
}

export interface WireRelation {
  relation_type: string;
  target_text: string;
  target_language: string | null;
  target_entry_id: string | null;
  target_sense_id: string | null;
}

export interface WireCrossReference {
  id: string;
  relation_type: string;
  original_text: string;
  target_headword: string;
  target_number: string | null;
  status: "unresolved" | "ambiguous" | "resolved" | "resolved_manual";
  resolved_entry_id: string | null;
  resolved_sense_id: string | null;
}

export interface WireSense {
  id: string;
  meaning_key: string;
  source_number?: string | null;
  position: number;
  part_of_speech?: string | null;
  subject_field?: string | null;
  register_labels?: string[];
  etymology?: string[];
  usage_context: string | null;
  regional_scope: string[];
  regional_variety_codes?: string[];
  temporal_scope: string | null;
  pronunciation_id?: string | null;
  review_status: string;
  definitions: WireDefinition[];
  examples?: WireExample[];
  relations?: WireRelation[];
  cross_references?: WireCrossReference[];
}

export interface WireEntry {
  id: string;
  headword: string;
  homograph_number?: string | null;
  parent_entry_id?: string | null;
  source_id?: string | null;
  source_title?: string | null;
  presentation?: "primary" | "secondary";
  hidden_duplicate_definitions?: number;
  superseded_entry_ids?: string[];
  script_forms?: { text: string; font: string; script: string | null }[];
  language: string;
  variety_id: string;
  variety_code: string;
  variety_name_th: string;
  part_of_speech: string | null;
  creation_method: string;
  review_status: string;
  publication_status: string;
  revision: number;
  forms: WireForm[];
  pronunciations: WirePronunciation[];
  senses: WireSense[];
}

export interface WireEntryList {
  query: string;
  normalized_query: string;
  items: WireEntry[];
  total: number;
}

export interface WireSource {
  id: string;
  title: string;
  publisher: string | null;
  source_type: "dictionary" | "dialect_dictionary" | "technical_terms" | string;
  citation: string;
  source_version: string;
  rights_metadata: Record<string, unknown>;
  retrieval_allowed: boolean;
  redistribution_allowed: boolean;
}

/* ----------------------------------------------------------------- language */

/** Every generated section is wrapped with its provenance. */
export interface WireSection<C> {
  status: MetaStatus;
  content: C;
  creation_method: CreationMethod;
  review_status: ReviewStatus;
  evidence_ids?: string[];
}

/** meaning / intents / mood / tone / formality content. */
export interface WireGeneratedSection {
  text: string;
  labels?: string[];
  justification?: string | null;
  ambiguity?: string | null;
}

/** translation / rewrite / alternatives content. */
export interface WireGeneratedText {
  text: string;
  target_language: string;
  target_variety_id?: string | null;
  explanation?: string | null;
  unresolved_terms?: string[];
}

/** Dictionary spans inside a sentence (only POST /v1/search adds these). */
export interface WireMatchedTerm {
  original_text: string;
  start: number;
  end: number;
  candidate_entry_ids: string[];
  candidate_sense_ids: string[];
  selected_sense_id: string | null;
  ambiguity: boolean;
  boundary_verified: boolean;
  source_ids: string[];
}

/** Dictionary sources are `{id, title}`; web sources add type/url. */
export interface WireResultSource {
  id: string;
  title: string | null;
  type?: "web";
  url?: string;
  passage_type?: string;
}

export interface WireGeneration {
  provider: string;
  model: string;
  creation_method: "ai_generated";
  review_status: ReviewStatus;
  provisional?: boolean;
  [key: string]: unknown;
}

export interface WireLanguageResult {
  view: "word" | "sentence" | "mixed";
  status?: MetaStatus;
  selected_text?: string | null;
  dictionary_results?: WireEntry[];
  meaning?: WireSection<WireGeneratedSection> | null;
  intents?: WireSection<WireGeneratedSection> | null;
  mood?: WireSection<WireGeneratedSection> | null;
  tone?: WireSection<WireGeneratedSection> | null;
  formality?: WireSection<WireGeneratedSection> | null;
  matched_terms?: WireMatchedTerm[];
  translation?: WireSection<WireGeneratedText> | null;
  rewrite?: WireSection<WireGeneratedText> | null;
  alternatives?: WireGeneratedText[];
  needs_context?: boolean;
  follow_up_question?: string | null;
  sources?: WireResultSource[];
  warnings?: string[];
  generation?: WireGeneration | null;
}

export interface WireLiveAssistResult {
  client_request_id: string;
  document_id: string | null;
  document_revision: string;
  selection_sequence: number;
  result: WireLanguageResult;
}

/* -------------------------------------------------------------------- audio */

export interface WireJob {
  id: string;
  job_type: string;
  state: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  resource_type: string | null;
  resource_id: string | null;
  error: { code: string; message: string; retryable: boolean } | null;
  result: Record<string, unknown> | null;
  poll_url: string;
  progress: Record<string, unknown>;
}

export interface WireAudioAsset {
  id: string;
  status: "preparing" | "ready" | "failed" | "revoked";
  pronunciation_id: string;
  pronunciation_revision: number;
  mime_type: string | null;
  label?: string;
  playback_url: string | null;
  playback_url_expires_at: string | null;
  job_id: string | null;
  error: Record<string, unknown> | null;
}

export interface WireAudioRequestResult {
  status: "ready" | "preparing" | "unsupported";
  reason: string | null;
  pronunciation_id: string;
  pronunciation_revision: number;
  variety_code: string;
  audio: WireAudioAsset | null;
  job: WireJob | null;
}
