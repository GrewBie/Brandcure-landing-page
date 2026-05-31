import { browserNav } from "@/lib/browser-navigator";
import { CONTACT_NAV_EVENT } from "@/lib/portfolio/voice-nav-events";

export const CONTACT_FOCUS_KEY = "brandcure-focus-contact-form";

const NAV_OFFSET = 76;
const SCROLL_SETTLE_MS = 850;
const SPOTLIGHT_SETTLE_MS = 450;

/** Spoken after the contact form is highlighted on the page (not inside chat). */
export const CONTACT_CLOSING_SPEECH =
  "It was lovely speaking with you! I've brought you to our free audit form on the page — see the highlighted box. Please fill in your name, email, and business right there, not in our chat. Our team will get back to you within 24 hours.";

export function markContactFormFocus(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONTACT_FOCUS_KEY, "1");
}

export function consumeContactFormFocus(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(CONTACT_FOCUS_KEY) !== "1") return false;
  sessionStorage.removeItem(CONTACT_FOCUS_KEY);
  return true;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitForContactSection(timeoutMs = 10_000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById("contact");
    if (existing) {
      resolve(existing);
      return;
    }

    const started = Date.now();
    const tick = () => {
      const el = document.getElementById("contact");
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

function scrollContactSection(section: HTMLElement): void {
  const top =
    section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function applyContactHighlight(): void {
  if (!browserNav.highlightContactForm()) {
    const formPanel = document.querySelector<HTMLElement>(
      "#contact [data-contact-audit-form]",
    );
    formPanel?.classList.add("contact-form-neha-focus");
    window.setTimeout(
      () => formPanel?.classList.remove("contact-form-neha-focus"),
      12_000,
    );
  }
}

/**
 * Close overlays, navigate to /#contact, scroll, then spotlight the audit form.
 * Call TTS only after this resolves so users see the form before the greeting.
 */
export async function runContactHandoffSequence(
  onCloseOverlays?: () => void,
): Promise<void> {
  if (typeof window === "undefined") return;

  onCloseOverlays?.();
  markContactFormFocus();
  browserNav.clearHighlight();

  let section = document.getElementById("contact");
  if (!section) {
    window.dispatchEvent(new CustomEvent(CONTACT_NAV_EVENT));
    section = await waitForContactSection();
  }

  if (section) {
    if (window.location.pathname !== "/") {
      await delay(400);
    }
    scrollContactSection(section);
    await delay(SCROLL_SETTLE_MS);
    applyContactHighlight();
    await delay(SPOTLIGHT_SETTLE_MS);
    return;
  }

  window.dispatchEvent(new CustomEvent(CONTACT_NAV_EVENT));
}

/** @deprecated Prefer runContactHandoffSequence for ordered highlight → greet. */
export function navigateToContactForm(): void {
  void runContactHandoffSequence();
}
