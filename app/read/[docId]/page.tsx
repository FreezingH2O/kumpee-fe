import { AppShell } from "@/components/shell/AppShell";
import { DocumentReader } from "@/components/read/DocumentReader";

/** คำอ่าน — reader (§5). Loads the uploaded document from the backend;
 *  `/read/demo` is a labelled sample. */
export default async function ReaderPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span>{" "}
            <a href="/read" className="hover:text-primary-600">
              คำอ่าน
            </a>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">คำอ่าน</h1>
          <p className="mt-1 text-sm text-ink-600">
            ลากเลือกข้อความบนเอกสาร เพื่อดูคำแปลและคำอธิบายโดยที่ยังเห็นต้นฉบับอยู่
          </p>
        </div>
      </div>
      <DocumentReader docId={docId} />
    </AppShell>
  );
}
