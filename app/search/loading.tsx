import { AppShell } from "@/components/shell/AppShell";

/** Shown while the backend works — generated explanations can take several seconds. */
export default function SearchLoading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1280px] px-4 py-10 lg:px-8" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 rounded-control bg-slate100" />
          <div className="h-4 w-80 max-w-full rounded-control bg-slate100" />
          <div className="grid gap-4 lg:grid-cols-[1fr_500px]">
            <div className="h-64 rounded-card bg-slate100" />
            <div className="h-64 rounded-card bg-slate100" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-400">
          กำลังค้นหาในพจนานุกรมและวิเคราะห์ข้อความ…
        </p>
      </div>
    </AppShell>
  );
}
