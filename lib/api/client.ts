import type {
  ApiResponse,
  LanguageRequest,
  LanguageResult,
  LiveAssistRequest,
  LiveAssistResult,
  SearchRequest,
} from "@/lib/api/types";
import type {
  UploadResponse,
  DocumentMeta,
  DocumentAssistRequest,
  DocumentAssistResult,
  DocumentDeleteResult,
  PageContent,
  JobStatus,
} from "@/lib/api/documentTypes";
import type {
  WireAudioAsset,
  WireAudioRequestResult,
  WireEntry,
  WireEntryList,
  WireLanguageResult,
  WireLiveAssistResult,
  WireSource,
} from "@/lib/api/wire";
import { adaptLanguageResult, adaptLiveResult, mapResponse } from "@/lib/api/adapt";

/**
 * Browser API client. Everything goes through the SERVER-SIDE proxy at
 * `/api/kamphee/*` (see app/api/kamphee/[...path]/route.ts), which attaches the
 * bearer token — so the browser never holds a key (§0.4).
 *
 * All calls return the standard envelope { request_id, data, meta } or
 * { request_id, error } (§4/§7). Retry only when error.retryable is true and,
 * on 429, honor Retry-After. Language calls are adapted to the display model
 * (lib/api/adapt.ts) before they're returned.
 */
export const PROXY = "/api/kamphee";

/** Backend-relative URLs (e.g. audio playback_url "/v1/audio-files/…") → proxy URL. */
export const proxied = (backendPath: string) =>
  backendPath.startsWith("/v1/") ? `${PROXY}${backendPath}` : backendPath;

async function asJson<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      request_id: "client",
      error: {
        code: "BAD_RESPONSE",
        message: `ไม่สามารถอ่านผลลัพธ์ (HTTP ${res.status})`,
        retryable: res.status >= 500,
        details: {},
      },
    };
  }
}

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal
): Promise<ApiResponse<T>> {
  const res = await fetch(`${PROXY}${path}`, {
    method,
    signal,
    headers:
      body === undefined
        ? { accept: "application/json" }
        : { "content-type": "application/json", accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return asJson<T>(res);
}

const getJson = <T>(path: string, signal?: AbortSignal) =>
  send<T>("GET", path, undefined, signal);
const postJson = <T>(path: string, body: unknown, signal?: AbortSignal) =>
  send<T>("POST", path, body, signal);

const id = encodeURIComponent;

/** Hex SHA-256 of a UTF-8 string (document selections are verified by hash). */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newRequestId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ------------------------------------------------ public lexicon (no auth) */

export const listEntries = (query: string, signal?: AbortSignal, varietyId?: string) =>
  getJson<WireEntryList>(
    `/v1/entries?query=${id(query)}${varietyId ? `&variety_id=${id(varietyId)}` : ""}`,
    signal
  );

export const getEntry = (entryId: string, signal?: AbortSignal) =>
  getJson<WireEntry>(`/v1/entries/${id(entryId)}`, signal);

export const listSources = (signal?: AbortSignal) =>
  getJson<{ items: WireSource[] }>("/v1/sources", signal);

export const getCapabilities = (signal?: AbortSignal) =>
  getJson<Record<string, unknown>>("/v1/capabilities", signal);

/* ------------------------------------------------- language endpoints (§8) */

const language =
  (path: string) =>
  (body: LanguageRequest, signal?: AbortSignal): Promise<ApiResponse<LanguageResult>> =>
    postJson<WireLanguageResult>(path, body, signal).then((res) =>
      mapResponse(res, (data) => adaptLanguageResult(data, body.text))
    );

export const search = (body: SearchRequest, signal?: AbortSignal) =>
  language("/v1/search")(body, signal);
export const lookup = language("/v1/lookup");
/** `target` must be omitted for analyze. */
export const analyze = language("/v1/analyze");
/** `target` is required for translate. */
export const translate = language("/v1/translate");
export const rewrite = language("/v1/rewrite");

export const liveAssist = (
  body: LiveAssistRequest,
  signal?: AbortSignal
): Promise<ApiResponse<LiveAssistResult>> =>
  postJson<WireLiveAssistResult>("/v1/live/assist", body, signal).then((res) =>
    mapResponse(res, (data) => adaptLiveResult(data, body.text))
  );

/* ------------------------------------------------------------- documents (§14) */

export async function uploadDocument(
  file: File,
  signal?: AbortSignal
): Promise<ApiResponse<UploadResponse>> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${PROXY}/v1/documents`, {
    method: "POST",
    body: fd, // browser sets multipart content-type + boundary
    signal,
    headers: { accept: "application/json" },
  });
  return asJson<UploadResponse>(res);
}

export const getDocument = (docId: string, signal?: AbortSignal) =>
  getJson<DocumentMeta>(`/v1/documents/${id(docId)}`, signal);

export const getDocumentPage = (docId: string, page: number, signal?: AbortSignal) =>
  getJson<PageContent>(`/v1/documents/${id(docId)}/pages/${page}`, signal);

export const getJob = (jobId: string, signal?: AbortSignal) =>
  getJson<JobStatus>(`/v1/jobs/${id(jobId)}`, signal);

export const assistDocumentSelection = (
  docId: string,
  body: DocumentAssistRequest,
  signal?: AbortSignal
) => postJson<DocumentAssistResult>(`/v1/documents/${id(docId)}/assist`, body, signal);

export const correctPageText = (
  docId: string,
  page: number,
  body: { expected_revision: number; text: string },
  signal?: AbortSignal
) => send<PageContent>("PATCH", `/v1/documents/${id(docId)}/pages/${page}/text`, body, signal);

export const deleteDocument = (docId: string, signal?: AbortSignal) =>
  send<DocumentDeleteResult>("DELETE", `/v1/documents/${id(docId)}`, undefined, signal);

/* ------------------------------------------------------------ audio (§27) */

/** Call ONLY when the user presses the audio button — never on load (§27). */
export const requestPronunciationAudio = (
  pronunciationId: string,
  expectedRevision: number,
  signal?: AbortSignal
) =>
  postJson<WireAudioRequestResult>(
    `/v1/pronunciations/${id(pronunciationId)}/audio`,
    { expected_revision: expectedRevision, format: "wav" },
    signal
  );

export const getAudio = (audioId: string, signal?: AbortSignal) =>
  getJson<WireAudioAsset>(`/v1/audio/${id(audioId)}`, signal);
