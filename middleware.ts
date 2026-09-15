import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

const GUEST_COOKIE = "kp_guest"; // keep in sync with lib/guest/quota.ts

/**
 * 1. Gives every visitor a random guest id cookie, used to count their free AI
 *    searches while signed out (lib/guest/quota.ts).
 * 2. Refreshes the Supabase session cookie so server components and the API
 *    proxy always see a valid access token.
 */
export async function middleware(request: NextRequest) {
  const newGuestId = request.cookies.get(GUEST_COOKIE) ? null : crypto.randomUUID();
  // Make a new id visible to this same request's server code.
  if (newGuestId) request.cookies.set(GUEST_COOKIE, newGuestId);

  let response = NextResponse.next({ request });

  if (supabaseConfigured) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    });
    // Validates and, if needed, refreshes the token (writes cookies via setAll).
    await supabase.auth.getUser();
  }

  if (newGuestId) {
    response.cookies.set(GUEST_COOKIE, newGuestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
