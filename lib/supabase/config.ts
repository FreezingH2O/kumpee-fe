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
