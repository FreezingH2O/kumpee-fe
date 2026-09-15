import { AppShell } from "@/components/shell/AppShell";
import { LoginForm } from "@/components/auth/LoginForm";

/** เข้าสู่ระบบ — Supabase email/password auth. The session's JWT is what the
 *  backend accepts for language, document, and audio endpoints. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  // Only same-site relative paths, never an open redirect.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/search";

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-10">
        <LoginForm next={safeNext} initialError={error ?? null} />
      </div>
    </AppShell>
  );
}
