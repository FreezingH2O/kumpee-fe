import { CheckCircleIcon } from "@heroicons/react/24/solid";
import type { LanguageResult } from "@/lib/api/types";
import { AudioButton } from "@/components/AudioButton";

/**
 * Word header for the คำแปล result — headword, a verified chip when the word
 * is in a connected dictionary, POS, and pronunciation with the audio button
 * (§6).
 */
export function WordHeader({ result }: { result: LanguageResult }) {
  const pron = result.pronunciations?.[0];
  const inDictionary = (result.dictionary_results?.length ?? 0) > 0;

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold leading-heading tracking-tight text-ink-900 sm:text-5xl">
          {result.headword}
        </h1>
        {inDictionary ? (
          <span className="inline-flex items-center gap-1 rounded-chip bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
            มีในพจนานุกรม
          </span>
        ) : null}
        {result.part_of_speech ? (
          <span className="rounded-chip bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
            {result.part_of_speech}
          </span>
        ) : null}
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
        <p className="mt-4 text-[17px] leading-body text-ink-900">{result.gloss}</p>
      ) : null}
    </div>
  );
}
