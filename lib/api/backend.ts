/**
 * Server-side backend access. Import ONLY from route handlers and server
 * components: the env vars are not NEXT_PUBLIC, so server keys never reach the
 * browser bundle (§0.4).
 *
 * KAMPHEE_API_BASE defaults to the deployed backend; override it for a local
 * backend (http://localhost:8000).
 *
 * Credentials:
 *  - signed in → the user's Supabase JWT (read from the session cookie), so
 *    uploads and private results are owned by that user (§17);
 *  - signed out → nothing, except the daily-metered guest key for AI calls
 *    (lib/guest/quota.ts). Public reads (/v1/entries, /v1/sources,
 *    /v1/capabilities) need no credential.
 */
import { getUserAccessToken } from "@/lib/supabase/server";

export const DEFAULT_API_BASE = "https://kumpee-be.vercel.app";

export const API_BASE = (process.env.KAMPHEE_API_BASE || DEFAULT_API_BASE).replace(
  /\/+$/,
  ""
);

export function withBearer(token: string | null, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return headers;
}

/** The signed-in user's token for this request, or null. */
export const resolveUserToken = getUserAccessToken;
