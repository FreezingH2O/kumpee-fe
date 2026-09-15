import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Landing point for Supabase email links (sign-up confirmation, password
 *  reset): exchanges the one-time code for a session cookie, then redirects. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/search";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/search";

  const supabase = await getSupabaseServer();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  const reason = searchParams.get("error_description") ?? "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
}
