import { NextRequest, NextResponse } from "next/server";
import { API_BASE, resolveUserToken, withBearer } from "@/lib/api/backend";
import {
  consumeGuestQuota,
  getGuestQuota,
  guestLimitError,
  guestToken,
  isGuestMeteredPath,
} from "@/lib/guest/quota";

/**
 * Server-side proxy to the คัมภีร์ backend.
 *
 * The browser calls `/api/kamphee/v1/...`; this handler forwards to
 * `${KAMPHEE_API_BASE}/v1/...` and attaches `Authorization: Bearer <token>` —
 * the signed-in user's Supabase JWT from the session cookie. Signed-out
 * visitors get the guest key on AI endpoints only, within their daily free
 * limit (lib/guest/quota.ts). No server key ever reaches the browser (§0.4). The raw request body is forwarded verbatim, which
 * preserves both JSON and multipart uploads (file boundaries intact).
 *
 * Only `/v1/*` paths are allowed, so this is not an open proxy.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Generated language results can take a while on the backend's LLM provider.
export const maxDuration = 60;

const FORWARD_REQUEST_HEADERS = ["content-type", "accept", "range"];
// No content-length/encoding: fetch transparently decompresses the upstream body.
const FORWARD_RESPONSE_HEADERS = [
  "content-type",
  "content-range",
  "accept-ranges",
  "cache-control",
  "content-disposition",
  "retry-after",
  "location",
];

async function forward(req: NextRequest, path: string[]) {
  if (path[0] !== "v1") {
    return NextResponse.json(
      {
        request_id: "proxy",
        error: { code: "NOT_FOUND", message: "unknown path", retryable: false, details: {} },
      },
      { status: 404 }
    );
  }

  const target =
    API_BASE + "/" + path.map(encodeURIComponent).join("/") + req.nextUrl.search;

  // Credential: the user, else a metered guest call, else anonymous.
  let token = await resolveUserToken();
  let guest = false;
  if (!token && isGuestMeteredPath(req.method, path)) {
    const quota = await getGuestQuota();
    if (quota && quota.remaining <= 0) {
      return NextResponse.json(guestLimitError(), {
        status: 429,
        headers: { "x-guest-remaining": "0", "x-guest-limit": String(quota.limit) },
      });
    }
    if (quota) {
      token = guestToken();
      guest = true;
    }
  }

  const headers = withBearer(token);
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit = { method: req.method, headers, redirect: "manual" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return NextResponse.json(
      {
        request_id: "proxy",
        error: {
          code: "UPSTREAM_UNREACHABLE",
          message: "เชื่อมต่อ backend ไม่สำเร็จ",
          retryable: true,
          details: {},
        },
      },
      { status: 502 }
    );
  }

  // Pass through body, status, and the headers the client relies on (Retry-After
  // on 429 per §4; range headers so audio playback can seek).
  const resHeaders = new Headers();
  for (const name of FORWARD_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) resHeaders.set(name, value);
  }
  // Only successful guest calls count against the free limit.
  if (guest && upstream.ok) {
    const quota = await consumeGuestQuota();
    if (quota) {
      resHeaders.set("x-guest-remaining", String(quota.remaining));
      resHeaders.set("x-guest-limit", String(quota.limit));
    }
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
