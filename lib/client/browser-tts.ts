"use client";

export function cancelBrowserTts(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/** Browser speech when ElevenLabs is unavailable or fails. */
export function speakWithBrowserTts(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    cancelBrowserTts();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
