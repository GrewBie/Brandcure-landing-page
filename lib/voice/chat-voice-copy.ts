import type { VoiceState } from "@/hooks/useVoiceNavigator";

export const VOICE_HOW_IT_WORKS = [
  "Tap the gold microphone to start a voice call",
  "Allow microphone access when your browser asks",
  "Speak naturally — pause for a moment when you're done",
  "Neha replies out loud and can show portfolio work on screen",
  "Tap the red microphone to end the call anytime",
] as const;

export function voiceHeaderSubtitle(inCall: boolean): string {
  if (inCall) return "Voice call active — you can still type";
  return "Chat here, or tap the mic to talk by voice";
}

export function voiceStatusMessage(
  state: VoiceState,
  inCall: boolean,
  elevenLabsReady: boolean,
): string {
  if (!inCall) return "";

  const ttsNote = !elevenLabsReady
    ? " (Voice replies need server setup — you can still speak and type.)"
    : "";

  switch (state) {
    case "listening":
      return `Your turn — speak now. Pause briefly when you're finished.${ttsNote}`;
    case "thinking":
      return "Neha is thinking…";
    case "speaking":
      return `Neha is speaking — listen, then talk again when you see "Your turn".${ttsNote}`;
    case "denied":
      return "Microphone blocked — click the lock icon in your browser's address bar, allow the mic, then tap the gold mic again. Or type your message below.";
    default:
      return `Voice call connected — tap the red mic to hang up.${ttsNote}`;
  }
}

export function micButtonLabel(inCall: boolean): string {
  return inCall ? "End call" : "Talk";
}

export function micButtonTitle(inCall: boolean, voiceSupported: boolean): string {
  if (!voiceSupported) {
    return "Voice is not supported in this browser — please type your message";
  }
  if (inCall) {
    return "End the voice call and return to text-only chat";
  }
  return "Start a voice call with Neha — speak instead of typing";
}
