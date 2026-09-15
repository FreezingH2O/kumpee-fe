import {
  ArrowUpTrayIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { AppShell } from "@/components/shell/AppShell";
import { UploadZone } from "@/components/read/UploadZone";

/**
 * คำอ่าน — upload (§5). Live: uploads go to POST /v1/documents via the
 * server-side proxy (§14). No size limit is stated in the UI unless
 * /capabilities returns one (§5) — the backend enforces limits and returns 413.
 */
const FEATURES = [
  {
    Icon: ArrowUpTrayIcon,
    title: "อัปโหลดเอกสาร",
    body: "รูปถ่าย ภาพหน้าจอ เอกสารสแกน หรือ PDF ที่อ่านยาก",
  },
  {
    Icon: DocumentIcon,
    title: "ลากเลือกข้อความ",
    body: "เลือกเฉพาะบรรทัดหรือประโยคที่ไม่เข้าใจ",
  },
  {
    Icon: PhotoIcon,
    title: "อ่านคำอธิบายข้าง ๆ",
    body: "ความหมาย คำยาก และคำแปล โดยยังเห็นต้นฉบับอยู่",
  },
];

export default function ReadUploadPage() {
  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span>{" "}
            <span className="text-primary-600">คำอ่าน</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">คำอ่าน</h1>
          <p className="mt-1 text-sm text-ink-600">
            อัปโหลดรูปหรือไฟล์ PDF แล้วลากเลือกข้อความบนเอกสาร
            เพื่อดูคำแปลและคำอธิบายโดยที่ยังเห็นต้นฉบับอยู่
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 lg:px-8">
        <UploadZone />

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-card border border-line bg-surface p-4">
              <span className="grid h-10 w-10 place-items-center rounded-control bg-canvas text-primary-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-semibold text-ink-900">{title}</h2>
              <p className="mt-1 text-sm text-ink-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
