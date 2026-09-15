/**
 * Server-side backend access. Import ONLY from route handlers and server
 * components: the env vars are not NEXT_PUBLIC, so the server token never
 * reaches the browser bundle (§0.4).
 *
 * KAMPHEE_API_BASE defaults to the deployed backend; override it for a local
 * backend (http://localhost:8000).
 *
 * Credentials, in order:
 *  1. the signed-in user's Supabase JWT (read from the session cookie) — uploads
 *     and private results are then owned by that user (§17);
 *  2. KAMPHEE_API_TOKEN (a `kh_` API key) as a server-wide fallback, if set.
 * Public reads (/v1/entries, /v1/sources, /v1/capabilities) need neither.
 */
import { getUserAccessToken } from "@/lib/supabase/server";

export const DEFAULT_API_BASE = "https://kumpee-be.vercel.app";

export const API_BASE = (process.env.KAMPHEE_API_BASE || DEFAULT_API_BASE).replace(
  /\/+$/,
  ""
);
const API_TOKEN = process.env.KAMPHEE_API_TOKEN || "";

/** The bearer token for this request, or null when anonymous. */
export async function resolveBackendToken(): Promise<string | null> {
  return (await getUserAccessToken()) ?? (API_TOKEN || null);
}

export async function backendHeaders(extra?: HeadersInit): Promise<Headers> {
  const headers = new Headers(extra);
  const token = await resolveBackendToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return headers;
}
