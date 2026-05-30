/** Server-only ElevenLabs settings (read from env in API routes). */
export function getElevenLabsConfig() {
  return {
    apiKey: process.env.ELEVENLABS_API_KEY?.trim() ?? "",
    /** Sarah — warm, natural female (override via ELEVENLABS_VOICE_ID). */
    voiceId:
      process.env.ELEVENLABS_VOICE_ID?.trim() || "EXAVITQu4vr4xnSDxMaL",
    /** Low-latency model for voice-agent / call mode. */
    modelId:
      process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_flash_v2_5",
    outputFormat: "mp3_44100_128" as const,
  };
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(getElevenLabsConfig().apiKey);
}
