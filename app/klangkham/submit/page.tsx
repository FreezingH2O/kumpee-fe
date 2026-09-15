import { AppShell } from "@/components/shell/AppShell";
import { SubmitForm } from "@/components/klangkham/SubmitForm";

/** เสนอคำ (§5). Community submission + review pipeline. The reviewer panel is
 *  staff-only and gated out of the public build (see lib/config). */
export default function SubmitPage() {
  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span>{" "}
            <a href="/klangkham" className="hover:text-primary-600">
              คลังคำ
            </a>{" "}
            <span className="mx-1">›</span>{" "}
            <span className="text-primary-600">เสนอคำใหม่</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">ร่วมเติมคำให้คำภีร์</h1>
          <p className="mt-1 text-sm text-ink-600">
            คำใหม่ หรือความหมายใหม่ของคำเดิม ก็เสนอได้
          </p>
        </div>
      </div>
      <SubmitForm />
    </AppShell>
  );
}
