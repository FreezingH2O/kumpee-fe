/**
 * Server-component data access (import only from server code — it reads
 * credentials via lib/api/backend and lib/guest/quota).
 */

import { API_BASE, resolveUserToken, withBearer } from "@/lib/api/backend";
import { adaptEntries, adaptLanguageResult, mapResponse } from "@/lib/api/adapt";
import {
  consumeGuestQuota,
  getGuestQuota,
  guestToken,
  type GuestQuota,
} from "@/lib/guest/quota";
import type { ApiResponse, LanguageResult, SearchRequest } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import type { WireEntryList, WireLanguageResult } from "@/lib/api/wire";

const TIMEOUT_MS = 55_000;

async function call<T>(
  path: string,
  token: string | null,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      ...init,
      headers: withBearer(token, { accept: "application/json", ...(init?.headers ?? {}) }),
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
  /** Whether AI features can be used for this visitor right now. */
  aiAvailable: boolean;
  /** Signed-out visitors: their free AI trial usage (null when signed in or no trial). */
  guest: GuestQuota | null;
  /** Signed-out visitor whose free AI searches for today are used up. */
  guestLimitReached: boolean;
}

async function aiSearch(text: string, token: string) {
  const body: SearchRequest = {
    text,
    source: { language: "th", variety_id: null },
    mode: "auto",
    include: ["meaning", "intents", "mood", "tone", "formality", "matched_terms"],
  };
  const res = await call<WireLanguageResult>("/v1/search", token, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return mapResponse(res, (d) => adaptLanguageResult(d, text));
}

async function dictionarySearch(text: string) {
  const res = await call<WireEntryList>(`/v1/entries?query=${encodeURIComponent(text)}`, null);
  return mapResponse(res, (d) => ({
    view: "word" as const,
    status: d.items.length ? ("complete" as const) : ("insufficient_evidence" as const),
    selected_text: text,
    ...(d.items.length ? adaptEntries(d.items, text) : { headword: text }),
  }));
}

/**
 * คำแปล search.
 *  - Signed in: POST /v1/search — dictionary hits come back directly; otherwise
 *    the backend generates a labeled explanation (and sentence analysis).
 *  - Signed out: the public dictionary first (free). Only when it has no match
 *    is the AI search used, with the guest key, counting against the daily
 *    free limit.
 */
export async function searchServer(text: string): Promise<SearchOutcome> {
  const userToken = await resolveUserToken();
  if (userToken) {
    return {
      response: await aiSearch(text, userToken),
      aiAvailable: true,
      guest: null,
      guestLimitReached: false,
    };
  }

  const dictionary = await dictionarySearch(text);
  const quota = await getGuestQuota();
  const found = !isApiError(dictionary) && (dictionary.data.dictionary_results?.length ?? 0) > 0;

  if (found || isApiError(dictionary) || !quota || quota.remaining <= 0) {
    return {
      response: dictionary,
      aiAvailable: !!quota && quota.remaining > 0,
      guest: quota,
      guestLimitReached: !!quota && quota.remaining <= 0,
    };
  }

  const response = await aiSearch(text, guestToken());
  const updated = isApiError(response) ? quota : ((await consumeGuestQuota()) ?? quota);
  return {
    response,
    aiAvailable: updated.remaining > 0,
    guest: updated,
    guestLimitReached: false,
  };
}

export interface FeaturedWord {
  headword: string;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  sourceTitle: string | null;
}

/** A few real dictionary entries for the home page (public, cached 1 hour).
 *  Words that fail to load are skipped — nothing is invented. */
export async function featuredWords(words: string[]): Promise<FeaturedWord[]> {
  const results = await Promise.all(
    words.map(async (word) => {
      try {
        const res = await fetch(`${API_BASE}/v1/entries?query=${encodeURIComponent(word)}`, {
          headers: { accept: "application/json" },
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(8000),
        });
        const body = (await res.json()) as ApiResponse<WireEntryList>;
        if (isApiError(body)) return null;
        const entries = body.data.items;
        const entry =
          entries.find((e) => e.variety_code === "th-central" && e.presentation !== "secondary") ??
          entries[0];
        const sense = entry?.senses[0];
        const definition = sense?.definitions[0];
        if (!entry || !sense || !definition) return null;
        return {
          headword: entry.headword,
          partOfSpeech: sense.part_of_speech ?? entry.part_of_speech ?? null,
          definition: definition.text,
          example: sense.examples?.[0]?.text ?? null,
          sourceTitle: definition.source_title ?? entry.source_title ?? null,
        } satisfies FeaturedWord;
      } catch {
        return null;
      }
    })
  );
  return results.filter((w): w is FeaturedWord => w !== null);
}
