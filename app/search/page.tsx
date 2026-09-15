import { AppShell } from "@/components/shell/AppShell";
import { SubNav } from "@/components/shell/SubNav";
import { SearchBar } from "@/components/shell/SearchBar";
import { WordingResult } from "@/components/wording/WordingResult";
import { SentenceResult } from "@/components/wording/SentenceResult";
import { ErrorNotice } from "@/components/ErrorNotice";
import { searchServer } from "@/lib/api/server";
import { errorMessage, isApiError } from "@/lib/api/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * คำแปล result route. Data comes from the backend (lib/api/server.ts); the
 * rendered view is chosen from the RESPONSE SHAPE — data.view (word vs sentence,
 * classified by the backend, §8.2) and searchStateFor() for the three word
 * states — not from separate routes (§2).
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const outcome = query ? await searchServer(query) : null;

  return (
    <AppShell>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 pt-6 lg:px-8">
          <nav aria-label="breadcrumb" className="text-sm text-ink-400">
            <span>หน้าแรก</span> <span className="mx-1">›</span>{" "}
            <span className="text-ink-600">คำแปล</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">คำแปล</h1>
          <p className="mt-1 text-sm text-ink-600">
            ค้นคำหรือประโยคเดียว แล้วดูความหมายจากทุกแหล่งที่เชื่อมต่อ
            พร้อมคำแปลและคำอธิบาย
          </p>
        </div>
        <SubNav hint="ค้นคำหรือประโยคเดียว" />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pt-6 lg:px-8">
        <SearchBar key={query} initial={query} />
      </div>

      {!outcome ? (
        <p className="mx-auto max-w-[1280px] px-4 py-10 text-center text-sm text-ink-400 lg:px-8">
          พิมพ์คำหรือประโยคที่อยากเข้าใจ แล้วกดค้นหา
        </p>
      ) : isApiError(outcome.response) ? (
        <ErrorNotice
          className="mx-auto mt-6 max-w-[1280px] px-4 lg:px-8"
          message={errorMessage(outcome.response.error)}
          requestId={outcome.response.request_id}
        />
      ) : outcome.response.data.view === "sentence" ? (
        <SentenceResult response={outcome.response} />
      ) : (
        <WordingResult response={outcome.response} aiAvailable={outcome.aiAvailable} />
      )}
    </AppShell>
  );
}
