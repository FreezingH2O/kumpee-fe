/**
 * Server-component data access (import only from server code — it reads the
 * token via lib/api/backend).
 */

import { API_BASE, backendHeaders, resolveBackendToken } from "@/lib/api/backend";
import { adaptEntries, adaptLanguageResult, mapResponse } from "@/lib/api/adapt";
import type { ApiResponse, LanguageResult, SearchRequest } from "@/lib/api/types";
import type { WireEntryList, WireLanguageResult } from "@/lib/api/wire";

const TIMEOUT_MS = 55_000;

async function call<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      ...init,
      headers: await backendHeaders({ accept: "application/json", ...(init?.headers ?? {}) }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const timedOut = (e as Error)?.name === "TimeoutError";
    return {
      request_id: "server",
      error: {
        code: timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNREACHABLE",
        message: timedOut ? "backend ใช้เวลานานเกินไป ลองใหม่อีกครั้ง" : "เชื่อมต่อ backend ไม่สำเร็จ",
        retryable: true,
        details: {},
      },
    };
  }
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      request_id: "server",
      error: {
        code: "BAD_RESPONSE",
        message: `ไม่สามารถอ่านผลลัพธ์ (HTTP ${res.status})`,
        retryable: res.status >= 500,
        details: {},
      },
    };
  }
}

export interface SearchOutcome {
  response: ApiResponse<LanguageResult>;
  /** False when only the public dictionary could be queried (no token). */
  aiAvailable: boolean;
}

/**
 * คำแปล search. With a token: POST /v1/search — dictionary hits come back
 * directly; otherwise the backend generates a labeled explanation, and for
 * sentences the interpretation sections + matched dictionary terms.
 * Without a token: the public GET /v1/entries dictionary lookup only.
 */
export async function searchServer(text: string): Promise<SearchOutcome> {
  if (await resolveBackendToken()) {
    const body: SearchRequest = {
      text,
      source: { language: "th", variety_id: null },
      mode: "auto",
      include: ["meaning", "intents", "mood", "tone", "formality", "matched_terms"],
    };
    const res = await call<WireLanguageResult>("/v1/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { response: mapResponse(res, (d) => adaptLanguageResult(d, text)), aiAvailable: true };
  }

  const res = await call<WireEntryList>(`/v1/entries?query=${encodeURIComponent(text)}`);
  return {
    response: mapResponse(res, (d) => ({
      view: "word" as const,
      status: d.items.length ? ("complete" as const) : ("insufficient_evidence" as const),
      selected_text: text,
      ...(d.items.length ? adaptEntries(d.items, text) : { headword: text }),
    })),
    aiAvailable: false,
  };
}
