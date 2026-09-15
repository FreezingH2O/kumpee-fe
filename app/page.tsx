import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { SearchBar } from "@/components/shell/SearchBar";

/**
 * Minimal home. The full หน้าแรก design (node 31:26) is a later screen; this is
 * a navigable entry point so the app works end-to-end while step (b) is the
 * คำแปล route. One input takes a word or a sentence — no mode picker (§1).
 */
const CHIPS = ["ความคิด", "จึ้ง", "ตะมุตะมิ", "ภาษาทางการ"];

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold leading-heading text-ink-900">
          ทุกคำมีความหมาย
          <br />
          <span className="text-primary-600">เข้าใจได้ทุกวัน</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-600">
          ค้นคำ เข้าใจบริบท สื่อสารได้ตรงใจ — ค้นได้ทันที ไม่ต้องเลือกโหมด
        </p>

        <div className="mx-auto mt-8 max-w-2xl text-left">
          <SearchBar autoFocus />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {CHIPS.map((c) => (
            <Link
              key={c}
              href={`/search?q=${encodeURIComponent(c)}`}
              className="rounded-chip border border-line bg-surface px-3 py-1.5 text-sm text-ink-600 hover:border-primary-500 hover:text-primary-600"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
