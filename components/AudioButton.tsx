"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import type { Pronunciation, AudioButtonState } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { getAudio, proxied, requestPronunciationAudio } from "@/lib/api/client";

const POLL_MS = 1500;
const MAX_POLLS = 40;

/**
 * Vocabulary audio button (§6 / §27.8). The visible state is DERIVED from the
 * pronunciation's `audio_availability` — never hardcoded enabled.
 *
 * Synthesis is requested ONLY on click (never on load or selection, never
 * autoplay): POST /v1/pronunciations/{id}/audio with the pronunciation revision,
 * then poll GET /v1/audio/{id} while it is preparing, and play the signed
 * playback URL through the proxy.
 */
export function AudioButton({
  pronunciation,
  label = "ฟังเสียง",
}: {
  pronunciation: Pronunciation;
  label?: string;
}) {
  const initial: AudioButtonState =
    pronunciation.audio_availability === "supported"
      ? "idle_supported"
      : pronunciation.audio_availability === "unavailable"
        ? "provider_unavailable"
        : "unsupported";

  const [state, setState] = useState<AudioButtonState>(initial);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const disabled = state !== "idle_supported" && state !== "ready";

  const message =
    state === "unsupported"
      ? "ยังไม่พร้อมให้บริการเสียงอ่าน"
      : state === "provider_unavailable"
        ? "บริการเสียงอ่านไม่พร้อมใช้งานชั่วคราว"
        : state === "preparing"
          ? "กำลังสร้างเสียง…"
          : state === "error"
            ? "สร้างเสียงไม่สำเร็จ"
            : label;

  async function play(url: string) {
    try {
      await new Audio(proxied(url)).play();
      setState("ready");
    } catch {
      setState("error");
    }
  }

  async function onClick() {
    if (disabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState("preparing");
    try {
      const res = await requestPronunciationAudio(
        pronunciation.id,
        pronunciation.revision,
        controller.signal
      );
      if (isApiError(res)) {
        setState(
          res.error.code === "AUDIO_PROVIDER_UNAVAILABLE" || res.error.code === "ISAN_TTS_UNAVAILABLE"
            ? "provider_unavailable"
            : "error"
        );
        return;
      }
      if (res.data.status === "unsupported") {
        setState("unsupported");
        return;
      }
      let audio = res.data.audio;
      for (let i = 0; audio && audio.status === "preparing" && i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (controller.signal.aborted) return;
        const poll = await getAudio(audio.id, controller.signal);
        if (isApiError(poll)) break;
        audio = poll.data;
      }
      if (audio?.status === "ready" && audio.playback_url) await play(audio.playback_url);
      else setState("error");
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") setState("error");
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-pron-id={pronunciation.id}
        data-pron-rev={pronunciation.revision}
        aria-label={`${label} — ${message}`}
        className={`inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-sm ${
          disabled
            ? "cursor-not-allowed border-line bg-slate100 text-ink-400"
            : "border-primary-100 bg-primary-50 text-primary-600 hover:bg-primary-100"
        }`}
      >
        <SpeakerWaveIcon className="h-4 w-4" aria-hidden="true" />
        {state === "idle_supported" || state === "ready" ? label : message}
      </button>
      {state === "error" ? (
        <span className="text-xs text-ink-400">ลองใหม่ภายหลัง</span>
      ) : null}
    </span>
  );
}
