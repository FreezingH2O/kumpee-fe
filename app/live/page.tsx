import { AppShell } from "@/components/shell/AppShell";
import { SubNav } from "@/components/shell/SubNav";
import { LiveEditor } from "@/components/live/LiveEditor";

/**
 * คำแปล Live (§7). An editor with a selection-driven help rail. This is an
 * extension INSIDE คำแปล, reached from the ค้นหา / Live submenu.
 */
export default function LivePage() {
  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 pt-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span> คำแปล{" "}
            <span className="mx-1">›</span>{" "}
            <span className="text-primary-600">Live</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">คำแปล</h1>
          <p className="mt-1 text-sm text-ink-600">
            เขียนหรือวางข้อความยาว ๆ แล้วเลือกเฉพาะส่วนที่อยากแปล
          </p>
        </div>
        <SubNav hint="เขียนยาว ๆ แล้วเลือกเฉพาะส่วนที่อยากให้ช่วย" />
      </div>

      <LiveEditor />
    </AppShell>
  );
}
