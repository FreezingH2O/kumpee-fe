/**
 * Build/role flags.
 *
 * The เสนอคำ reviewer panel is staff-only and MUST NOT render in the public
 * build (§5). It is gated here; the public build ships with this false. A real
 * deployment would derive this from the authenticated principal's role
 * (reviewer/admin) — never from client-provided data.
 */
export const SHOW_REVIEWER_PANEL =
  process.env.NEXT_PUBLIC_ENABLE_REVIEWER_PANEL === "1";
