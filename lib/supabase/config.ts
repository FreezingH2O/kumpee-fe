/**
 * Supabase project the backend trusts (thai-dic KAMPHEE_AUTH_ISSUER). The anon /
 * publishable key is safe to expose in the browser — it only allows what Row
 * Level Security permits; the backend verifies the user's JWT itself.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywbvftgqxttodiybvhvs.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const supabaseConfigured = SUPABASE_ANON_KEY.length > 0;

/** Public address used in auth emails (confirmation / sign-in links), so a link
 *  never points at localhost even when the request came from a dev machine.
 *  Order: NEXT_PUBLIC_SITE_URL → the Vercel project's production domain
 *  (NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL, set automatically on Vercel
 *  builds, host only) → the current origin. */
const vercelProductionHost = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || "";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionHost ? `https://${vercelProductionHost}` : "")
).replace(/\/+$/, "");
