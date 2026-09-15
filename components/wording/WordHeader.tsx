import { BookOpenIcon } from "@heroicons/react/24/outline";
import type { LanguageResult } from "@/lib/api/types";
import { AudioButton } from "@/components/AudioButton";

/**
 * Word header for the คำแปล result — headword, POS, pronunciation (phonetic +
 * reading) with the audio button (§6), and the one-line gloss. On the not-found
 * state the gloss is the "ยังไม่พบ…" message instead.
 */
export function WordHeader({ result }: { result: LanguageResult }) {
  const pron = result.pronunciations?.[0];

  return (
    <div className="border-b border-line pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold leading-heading text-primary-600">
            {result.headword}
          </h1>
          {result.part_of_speech ? (
            <span className="rounded-chip bg-slate100 px-2.5 py-1 text-sm font-medium text-ink-600">
              {result.part_of_speech}
            </span>
          ) : null}
        </div>
        <BookOpenIcon
          className="mt-2 h-5 w-5 shrink-0 text-ink-400"
          aria-hidden="true"
        />
      </div>

      {pron ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-600">คำอ่าน</span>
          <span className="rounded-control bg-slate100 px-3 py-1.5 font-mono text-sm text-ink-900">
            {pron.phonetic}
            {pron.written_reading ? (
              <span className={`${pron.phonetic ? "ml-2 " : ""}font-sans text-ink-600`}>
                {pron.written_reading}
              </span>
            ) : null}
          </span>
          <AudioButton pronunciation={pron} />
        </div>
      ) : null}

      {result.gloss ? (
        <p className="mt-4 text-[17px] leading-body text-ink-900">
          {result.gloss}
        </p>
      ) : null}
    </div>
  );
}
