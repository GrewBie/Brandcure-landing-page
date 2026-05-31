export const VOICE_NAV_EVENT = "brandcure:voice-nav";

/** Client navigation to /#contact without full page reload. */
export const CONTACT_NAV_EVENT = "brandcure:navigate-contact";

export type VoiceNavDetail = {
  type: "open_detail" | "open_portfolio";
  navId?: string;
  scrollLivePreview?: boolean;
};

export function dispatchVoiceNav(detail: VoiceNavDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VOICE_NAV_EVENT, { detail }));
}

export const LIVE_PREVIEW_SCROLL_KEY = "brandcure-scroll-live-preview";

export function markScrollLivePreview(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LIVE_PREVIEW_SCROLL_KEY, "1");
}

export function consumeScrollLivePreview(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(LIVE_PREVIEW_SCROLL_KEY) !== "1") return false;
  sessionStorage.removeItem(LIVE_PREVIEW_SCROLL_KEY);
  return true;
}
