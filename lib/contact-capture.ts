import { browserNav } from "@/lib/browser-navigator";
import { CONTACT_NAV_EVENT } from "@/lib/portfolio/voice-nav-events";

export const CONTACT_FOCUS_KEY = "brandcure-focus-contact-form";

/** Spoken when Neha hands off to the contact form (voice + chat). */
export const CONTACT_CLOSING_SPEECH =
  "It was lovely speaking with you! I've opened our contact form below — please add your name, email, and a line about your business. Our team will get back to you within 24 hours. I'll step back now so you can fill it in comfortably.";

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

function focusContactFields(contact: HTMLElement): void {
  window.setTimeout(() => {
    const nameInput = contact.querySelector<HTMLInputElement>("#name, input[name='name']");
    nameInput?.focus({ preventScroll: true });
    contact.classList.add("contact-form-neha-focus");
    window.setTimeout(
      () => contact.classList.remove("contact-form-neha-focus"),
      4_000,
    );
  }, 500);
}

function scrollToContactOnPage(): boolean {
  const contact = document.getElementById("contact");
  if (!contact) return false;

  browserNav.clearHighlight();
  const top =
    contact.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  focusContactFields(contact);
  return true;
}

/** Navigate to homepage contact form and focus the audit fields (keeps voice session alive). */
export function navigateToContactForm(): void {
  if (typeof window === "undefined") return;

  markContactFormFocus();
  browserNav.clearHighlight();

  if (scrollToContactOnPage()) return;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONTACT_NAV_EVENT));
  }
}
