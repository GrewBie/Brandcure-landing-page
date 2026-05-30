"use client";

export type PlayElevenLabsResult = "played" | "failed" | "not_configured";

type PlayOptions = {
  /** Abort in-flight fetch / playback (e.g. end call). */
  signal?: AbortSignal;
  onAudioElement?: (audio: HTMLAudioElement) => void;
};

/**
 * Fetches MP3 audio from `/api/tts` (ElevenLabs proxy) and plays it.
 * Does not use browser SpeechSynthesis.
 */
export async function playElevenLabsTts(
  text: string,
  options: PlayOptions = {},
): Promise<PlayElevenLabsResult> {
  const trimmed = text.trim();
  if (!trimmed) return "failed";

  if (options.signal?.aborted) return "failed";

  let res: Response;
  try {
    res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
      signal: options.signal,
    });
  } catch {
    return "failed";
  }

  if (res.status === 503) return "not_configured";
  if (!res.ok) return "failed";

  const blob = await res.blob();
  if (!blob.size) return "failed";

  return playAudioBlob(blob, options);
}

async function playAudioBlob(
  blob: Blob,
  options: PlayOptions,
): Promise<PlayElevenLabsResult> {
  if (options.signal?.aborted) return "failed";

  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.preload = "auto";
    options.onAudioElement?.(audio);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.onended = null;
      audio.onerror = null;
    };

    const finish = (result: PlayElevenLabsResult) => {
      cleanup();
      resolve(result);
    };

    if (options.signal) {
      const onAbort = () => {
        audio.pause();
        finish("failed");
      };
      if (options.signal.aborted) {
        onAbort();
        return;
      }
      options.signal.addEventListener("abort", onAbort, { once: true });
      audio.onended = () => {
        options.signal?.removeEventListener("abort", onAbort);
        finish("played");
      };
      audio.onerror = () => {
        options.signal?.removeEventListener("abort", onAbort);
        finish("failed");
      };
    } else {
      audio.onended = () => finish("played");
      audio.onerror = () => finish("failed");
    }

    void audio.play().catch(() => finish("failed"));
  });
}
