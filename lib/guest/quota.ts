/**
 * Free AI trial for signed-out visitors (server-only).
 *
 * Guests' AI calls use one server-side `kh_` key (KAMPHEE_GUEST_API_TOKEN,
 * scope language:use). Each successful call is counted per day in Upstash
 * Redis under two identities:
 *   - the guest cookie (kp_guest, set by middleware) — limit GUEST_DAILY_LIMIT;
 *   - the client IP (hashed) — a higher limit, so clearing cookies or opening an
 *     incognito window doesn't reset the trial, while people sharing one office
 *     or campus network aren't blocked by each other.
 * Days roll over at midnight Thailand time (UTC+7).
 *
 * Fails CLOSED in production: without Redis there is no guest AI, so the shared
 * key can never be used without a limit. In development an in-memory counter is
 * used instead.
 */
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";

export const GUEST_COOKIE = "kp_guest";

const GUEST_TOKEN = process.env.KAMPHEE_GUEST_API_TOKEN || "";
export const GUEST_DAILY_LIMIT = Math.max(0, Number(process.env.KAMPHEE_GUEST_DAILY_LIMIT ?? 3) || 0);
const IP_MULTIPLIER = 5;

// Upstash via the Vercel Marketplace exposes either naming scheme.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const redisConfigured = !!REDIS_URL && !!REDIS_TOKEN;
const isProduction = process.env.NODE_ENV === "production";

/** Paths guests may call with the guest key (POST only). Documents, Live,
 *  audio, and API keys stay sign-in only: with a shared key, guests would
 *  otherwise share private data. */
const METERED_PATHS = new Set(["v1/search", "v1/lookup", "v1/analyze", "v1/translate", "v1/rewrite"]);

export function isGuestMeteredPath(method: string, path: string[]): boolean {
  return method === "POST" && METERED_PATHS.has(path.join("/"));
}

export const guestTrialEnabled = () =>
  GUEST_TOKEN.length > 0 && GUEST_DAILY_LIMIT > 0 && (redisConfigured || !isProduction);

export const guestToken = () => GUEST_TOKEN;

export interface GuestQuota {
  limit: number;
  used: number;
  remaining: number;
}

/* ------------------------------------------------------------ storage */

// Dev-only fallback. Kept on globalThis so route handlers and pages (bundled
// separately) share one counter within the process.
const globalStore = globalThis as unknown as {
  __kpGuestMemory?: Map<string, { value: number; expires: number }>;
};
const memory = (globalStore.__kpGuestMemory ??= new Map());

async function redis(commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${REDIS_URL.replace(/\/+$/, "")}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${REDIS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

async function readCounts(keys: string[]): Promise<number[]> {
  if (redisConfigured) {
    const [values] = (await redis([["MGET", ...keys]])) as [(string | null)[]];
    return values.map((v) => Number(v ?? 0));
  }
  const now = Date.now();
  return keys.map((k) => {
    const hit = memory.get(k);
    return hit && hit.expires > now ? hit.value : 0;
  });
}

async function increment(keys: string[], ttlSeconds: number): Promise<void> {
  if (redisConfigured) {
    await redis(keys.flatMap((k) => [["INCR", k], ["EXPIRE", k, ttlSeconds]]));
    return;
  }
  const now = Date.now();
  for (const k of keys) {
    const hit = memory.get(k);
    const value = hit && hit.expires > now ? hit.value + 1 : 1;
    memory.set(k, { value, expires: now + ttlSeconds * 1000 });
  }
}

/* ------------------------------------------------------------ identity */

function thaiDay(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
}

const hash = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 32);

async function identityKeys(): Promise<{ keys: string[]; limits: number[] }> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const guestId = cookieStore.get(GUEST_COOKIE)?.value || "no-cookie";
  const ip =
    headerStore.get("x-real-ip") ||
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-ip";
  const day = thaiDay();
  return {
    keys: [`kamphee:guest:c:${hash(guestId)}:${day}`, `kamphee:guest:ip:${hash(ip)}:${day}`],
    limits: [GUEST_DAILY_LIMIT, GUEST_DAILY_LIMIT * IP_MULTIPLIER],
  };
}

/* ------------------------------------------------------------ public API */

/** Current usage for this guest, or null when the trial is unavailable
 *  (disabled, or Redis unreachable — treated as no trial, never as unlimited). */
export async function getGuestQuota(): Promise<GuestQuota | null> {
  if (!guestTrialEnabled()) return null;
  try {
    const { keys, limits } = await identityKeys();
    const counts = await readCounts(keys);
    // Scale the IP count onto the per-guest limit so both are reported as one number.
    const used = Math.max(counts[0], Math.ceil(counts[1] / (limits[1] / limits[0])));
    const clamped = Math.min(used, GUEST_DAILY_LIMIT);
    return { limit: GUEST_DAILY_LIMIT, used: clamped, remaining: GUEST_DAILY_LIMIT - clamped };
  } catch (e) {
    console.error("guest quota read failed", e);
    return null;
  }
}

/** Record one successful guest AI call. Returns the updated quota. */
export async function consumeGuestQuota(): Promise<GuestQuota | null> {
  if (!guestTrialEnabled()) return null;
  try {
    const { keys } = await identityKeys();
    await increment(keys, 36 * 3600);
  } catch (e) {
    console.error("guest quota write failed", e);
  }
  return getGuestQuota();
}

export function guestLimitError() {
  return {
    request_id: "guest",
    error: {
      code: "GUEST_LIMIT_REACHED",
      message: `ใช้ AI ฟรีครบ ${GUEST_DAILY_LIMIT} ครั้งสำหรับวันนี้แล้ว`,
      retryable: false,
      details: { limit: GUEST_DAILY_LIMIT },
    },
  };
}
