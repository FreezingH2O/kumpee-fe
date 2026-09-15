import { AppShell } from "@/components/shell/AppShell";
import { RewriteForm } from "@/components/rewrite/RewriteForm";

/** ปรับข้อความ (§5). Reached from the sentence view / Live exits with ?text=. */
export default async function RewritePage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string }>;
}) {
  const { text } = await searchParams;
  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span> คำแปล{" "}
            <span className="mx-1">›</span>{" "}
            <span className="text-primary-600">ปรับข้อความ</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">ปรับข้อความ</h1>
          <p className="mt-1 text-sm text-ink-600">
            ปรับถ้อยคำให้เหมาะกับผู้รับและสถานการณ์
          </p>
        </div>
      </div>
      <RewriteForm initialText={text ?? ""} />
    </AppShell>
  );
}
