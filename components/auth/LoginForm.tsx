"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Field, controlClass } from "@/components/form/Field";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/supabase/config";

type Mode = "signin" | "signup" | "magic";

/** Translate the common Supabase auth errors; fall back to the raw message. */
function authError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("email not confirmed")) return "กรุณายืนยันอีเมลก่อน — ตรวจสอบกล่องจดหมายของคุณ";
  if (m.includes("already registered")) return "อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน";
  if (m.includes("password should be")) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  if (m.includes("rate limit")) return "ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่";
  if (m.includes("invalid api key")) return "NEXT_PUBLIC_SUPABASE_ANON_KEY ไม่ถูกต้อง";
  return message;
}

export function LoginForm({ next, initialError }: { next: string; initialError: string | null }) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  if (!supabase) {
    return (
      <div className="rounded-card border border-amber-700/30 bg-amber-50 p-5 text-sm text-amber-700">
        <p className="font-semibold">ยังไม่ได้ตั้งค่าการเข้าสู่ระบบ</p>
        <p className="mt-2">
          เพิ่ม <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ใน <code>.env.local</code> (ดูได้จาก
          Supabase → Project Settings → API Keys) แล้วรีสตาร์ต dev server
        </p>
      </div>
    );
  }

  const callbackUrl = () =>
    `${SITE_URL || window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(authError(error.message));
        router.replace(next);
        router.refresh(); // re-render server components with the new session
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callbackUrl() },
        });
        if (error) return setError(authError(error.message));
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setNotice("สมัครสมาชิกแล้ว — กรุณายืนยันอีเมลจากลิงก์ที่ส่งไปให้ แล้วกลับมาเข้าสู่ระบบ");
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: callbackUrl(), shouldCreateUser: false },
        });
        if (error) return setError(authError(error.message));
        setNotice("ส่งลิงก์สำหรับเข้าสู่ระบบไปที่อีเมลแล้ว");
      }
    } catch {
      setError("เชื่อมต่อระบบยืนยันตัวตนไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signin" ? "เข้าสู่ระบบ" : mode === "signup" ? "สมัครสมาชิก" : "เข้าสู่ระบบด้วยลิงก์ทางอีเมล";

  return (
    <section className="rounded-card border border-line bg-surface p-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-600">
          <BookOpenIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-bold text-ink-900">{title}</h1>
        <p className="mt-1 text-sm text-ink-600">
          เพื่อใช้ AI ช่วยอธิบาย แปล และปรับข้อความ
        </p>
      </div>

      {mode !== "magic" ? (
        <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-control bg-slate100 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
                setNotice(null);
              }}
              className={`rounded-control px-3 py-1.5 text-sm font-medium ${
                mode === m ? "bg-surface text-primary-600 shadow-sm" : "text-ink-600"
              }`}
            >
              {m === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-4">
        <Field label="อีเมล" required>
          {(p) => (
            <input
              {...p}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={controlClass}
              placeholder="you@example.com"
            />
          )}
        </Field>

        {mode !== "magic" ? (
          <Field
            label="รหัสผ่าน"
            required
            helper={mode === "signup" ? "อย่างน้อย 6 ตัวอักษร" : undefined}
          >
            {(p) => (
              <input
                {...p}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={controlClass}
              />
            )}
          </Field>
        ) : null}

        {error ? (
          <p role="alert" className="flex items-start gap-1.5 rounded-control bg-red-50 px-3 py-2 text-sm text-red-700">
            <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        ) : null}
        {notice ? (
          <p className="flex items-start gap-1.5 rounded-control bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-control bg-primary-500 py-3 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {busy ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : null}
          {mode === "signin" ? "เข้าสู่ระบบ" : mode === "signup" ? "สมัครสมาชิก" : "ส่งลิงก์"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {mode === "magic" ? (
          <button type="button" onClick={() => setMode("signin")} className="text-primary-600 hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        ) : mode === "signin" ? (
          <button type="button" onClick={() => setMode("magic")} className="text-primary-600 hover:underline">
            ลืมรหัสผ่าน? เข้าสู่ระบบด้วยลิงก์ทางอีเมล
          </button>
        ) : null}
      </p>
    </section>
  );
}
