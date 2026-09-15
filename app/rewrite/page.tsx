import { AppShell } from "@/components/shell/AppShell";
import { RewriteForm } from "@/components/rewrite/RewriteForm";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";

/** ปรับข้อความ (§5). Reached from the sentence view / Live exits with ?text=. */
export default async function RewritePage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string }>;
}) {
  const { text } = await searchParams;
  return (
    <AppShell>
      <div className="border-b border-white/70 bg-white/60 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span> คำแปล{" "}
            <span className="mx-1">›</span>{" "}
            <span className="text-primary-600">ปรับข้อความ</span>
          </nav>
          <div className="mt-3 flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-500 text-white shadow-[0_6px_16px_-6px_rgba(20,179,168,0.6)]">
              <ChatBubbleLeftEllipsisIcon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                ปรับข้อความให้เหมาะกับผู้ฟัง
              </h1>
              <p className="mt-1 text-sm text-ink-600">สื่อสารได้ตรงใจ ในทุกสถานการณ์</p>
            </div>
          </div>
        </div>
      </div>
      <RewriteForm initialText={text ?? ""} />
    </AppShell>
  );
}
