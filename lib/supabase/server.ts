import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

/** Server Supabase client bound to the request cookies (server components,
 *  route handlers). Null when Supabase is not configured. */
export async function getSupabaseServer() {
  if (!supabaseConfigured) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server components can't write cookies; middleware refreshes the session.
        }
      },
    },
  });
}

/** The signed-in user's Supabase access token, if any. The backend verifies it
 *  against the project's JWKS, so it is only forwarded, never trusted here. */
export async function getUserAccessToken(): Promise<string | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
