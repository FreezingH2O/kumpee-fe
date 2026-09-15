/**
 * คำอ่าน document types (§14) — matched to the backend's OpenAPI
 * (DocumentOut, PageOut, DocumentAssistRequest/Result, JobOut).
 */

import type { WireJob, WireLanguageResult } from "@/lib/api/wire";

export type DocumentState =
  | "uploaded"
  | "queued"
  | "processing"
  | "ready"
  | "partial"
  | "failed"
  | "deleting"
  | "deleted";

export interface DocumentMeta {
  id: string;
  filename: string | null;
  media_type: string;
  byte_size: number;
  state: DocumentState;
  page_count: number | null;
  pages_ready: number;
  pages_failed: number;
  /** Document revision — bumps on every page-text correction. */
  revision: number;
  extraction_version: string;
  process_job_id: string | null;
  error: { code?: string; message?: string } | null;
  original_url: string | null;
  original_url_expires_at: string | null;
  retention_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  document: DocumentMeta;
  job: JobStatus | null;
  /** True when the same file was already uploaded (HTTP 200 instead of 202). */
  duplicate: boolean;
}

export type JobStatus = WireJob;

export type GeometryPrecision = "glyph" | "word" | "line" | "approximate";

export interface Quad {
  /** [x0,y0,x1,y1,x2,y2,x3,y3] in normalized page coordinates. */
  quad: number[];
  precision: GeometryPrecision;
}

export interface PageSpan {
  start: number;
  end: number;
  reading_order: number;
  block_index: number;
  quads: Quad[];
  precision: GeometryPrecision;
  source: "native" | "ocr" | "corrected";
  confidence?: number | null;
}

export interface PageToken {
  start: number; // UTF-16 offset into page text
  end: number;
  line_index: number;
  quad: Quad;
}

export interface PageContent {
  document_id: string;
  page_number: number;
  page_revision: number;
  /** Document revision this page view belongs to (send as expected_revision). */
  revision: number;
  status: "ready" | "failed";
  width: number | null;
  height: number | null;
  unit: string;
  rotation: number;
  extraction_method: string;
  geometry_status: string;
  text_utf16_length: number;
  warnings: string[];
  error: { code?: string; message?: string } | null;
  text: string; // canonical page text
  blocks: PageSpan[];
  lines: PageSpan[];
  tokens: PageToken[];
  transform: Record<string, unknown>;
  provenance: Record<string, unknown>;
}

/** Half-open UTF-16 range into one page's canonical text. */
export interface DocumentRange {
  page_number: number;
  start: number;
  end: number;
}

export type DocumentTask = "lookup" | "analyze" | "translate" | "rewrite";

/** POST /v1/documents/{id}/assist. `selected_text_sha256` is the hex SHA-256 of
 *  the selected text (ranges joined with "\n"), so stale selections are rejected. */
export interface DocumentAssistRequest {
  revision: number;
  ranges: DocumentRange[];
  selected_text_sha256: string;
  task: DocumentTask;
  client_request_id?: string | null;
  source?: { language: string; variety_id?: string | null };
  target?: { language: string; variety_id?: string | null } | null;
}

export interface DocumentAssistResult {
  document_id: string;
  revision: number;
  client_request_id: string | null;
  selected_text: string;
  highlights: { page_number: number; quads: Quad[] }[];
  result: WireLanguageResult;
}

export interface DocumentDeleteResult {
  document_id: string;
  state: DocumentState;
  job: JobStatus;
}
