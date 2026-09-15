"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpTrayIcon,
  DocumentIcon,
  CameraIcon,
  ClockIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { uploadDocument } from "@/lib/api/client";
import { errorMessage, isApiError } from "@/lib/api/types";

const ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";
const RECENT_KEY = "kp.recentDocs";

type Recent = { id: string; name: string };

function loadRecent(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveRecent(list: Recent[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => setRecent(loadRecent()), []);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const res = await uploadDocument(file);
      if (isApiError(res)) {
        setError(errorMessage(res.error));
        return;
      }
      const id = res.data.document.id;
      const next = [{ id, name: file.name }, ...loadRecent().filter((r) => r.id !== id)];
      saveRecent(next);
      router.push(`/read/${encodeURIComponent(id)}`);
    } catch {
      setError("อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-card border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-primary-500 bg-primary-50" : "border-line bg-surface"
        }`}
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-50 text-primary-600">
          <ArrowUpTrayIcon className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mt-4 text-xl font-bold text-ink-900">
          {busy ? "กำลังอัปโหลด…" : "ลากไฟล์มาวางที่นี่"}
        </p>
        <p className="mt-1 text-sm text-ink-400">
          รองรับรูปถ่าย ภาพหน้าจอ เอกสารสแกน และไฟล์ PDF · PNG, JPEG, WebP, PDF
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-control bg-primary-500 shadow-button px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
          >
            <DocumentIcon className="h-5 w-5" /> เลือกไฟล์
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-control border border-line px-5 py-2.5 text-sm font-medium text-ink-600 hover:border-primary-500 disabled:opacity-60"
          >
            <CameraIcon className="h-5 w-5" /> ถ่ายรูป
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={onInput}
        />
        {error ? (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-control bg-red-50 px-3 py-2 text-sm text-red-700">
            <ExclamationCircleIcon className="h-4 w-4" /> {error}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface shadow-card p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
            <ClockIcon className="h-5 w-5 text-ink-400" /> เอกสารล่าสุด
          </h2>
          {recent.length ? (
            <ul className="space-y-2">
              {recent.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/read/${encodeURIComponent(d.id)}`}
                    className="flex items-center justify-between rounded-control border border-line px-4 py-3 hover:border-primary-500"
                  >
                    <span className="flex items-center gap-3">
                      <DocumentIcon className="h-5 w-5 text-ink-400" />
                      <span className="text-sm text-ink-900">{d.name}</span>
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-ink-400" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-400">
              ยังไม่มีเอกสาร — อัปโหลดไฟล์แรกของคุณ หรือดู{" "}
              <Link href="/read/demo" className="text-primary-600 underline">
                เอกสารตัวอย่าง
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-card border border-line bg-surface shadow-card p-4">
          <h2 className="mb-2 font-semibold text-ink-900">เอกสารของคุณ</h2>
          <p className="text-sm text-ink-600">
            ไฟล์ที่อัปโหลดจะถูกเก็บไว้ในบัญชีของคุณเท่านั้น
            และไม่ถูกนำไปเผยแพร่ในคลังคำสาธารณะโดยอัตโนมัติ การลบเอกสารจะลบข้อมูลที่ประมวลผลไว้ด้วย
          </p>
        </section>
      </div>
    </div>
  );
}
