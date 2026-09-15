import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/70 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-3 px-4 py-6 sm:flex-row sm:items-center lg:px-8">
        <span className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-sm text-ink-400">พจนานุกรมยุคใหม่ เข้าใจภาษาไทยในทุกบริบท</span>
        </span>
        <p className="flex items-center gap-2 text-sm text-ink-400">
          <span className="h-[3px] w-5 rounded-chip bg-amber-400" aria-hidden />
          ค้นให้ลึก คิดให้กว้าง สื่อสารได้ตรงใจ
        </p>
      </div>
    </footer>
  );
}
