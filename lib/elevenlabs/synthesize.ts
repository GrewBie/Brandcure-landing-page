import { getElevenLabsConfig } from "@/lib/elevenlabs/config";

const MAX_CHARS = 800;

export type SynthesizeResult =
  | { ok: true; audio: ArrayBuffer; contentType: string }
  | { ok: false; status: number; message: string };

/**
 * Calls ElevenLabs Text-to-Speech REST API (server-side only).
 * @see https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export async function synthesizeElevenLabsSpeech(
  text: string,
): Promise<SynthesizeResult> {
  const { apiKey, voiceId, modelId, outputFormat } = getElevenLabsConfig();

  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      message: "ELEVENLABS_API_KEY is not set",
    };
  }

  const trimmed = text.trim().slice(0, MAX_CHARS);
  if (!trimmed) {
    return { ok: false, status: 400, message: "Missing text" };
  }

  const url = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  );
  url.searchParams.set("output_format", outputFormat);

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: modelId,
        language_code: "en",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        "[elevenlabs] TTS error:",
        res.status,
        detail.slice(0, 300),
      );
      return {
        ok: false,
        status: res.status === 401 ? 401 : 502,
        message: "ElevenLabs TTS request failed",
      };
    }

    const audio = await res.arrayBuffer();
    if (!audio.byteLength) {
      return {
        ok: false,
        status: 502,
        message: "ElevenLabs returned empty audio",
      };
    }

    return {
      ok: true,
      audio,
      contentType: res.headers.get("Content-Type") || "audio/mpeg",
    };
  } catch (error) {
    console.error("[elevenlabs] TTS request failed:", error);
    return {
      ok: false,
      status: 502,
      message: "ElevenLabs TTS request failed",
    };
  }
}
