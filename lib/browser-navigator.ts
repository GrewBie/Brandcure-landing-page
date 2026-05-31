import type { NavigatorSection } from "@/types/navigator";

type PlayHandlers = {
  play: () => void;
  pause: () => void;
};

const HIGHLIGHT_CLASS = "nav-highlighted";
const SUMMARY_PULSE_CLASS = "nav-summary-pulse";
const HIGHLIGHT_MS = 18_000;
const SUMMARY_PULSE_MS = 5_000;
const SPOTLIGHT_PAD = 14;

function buildSpotlightClipPath(rect: DOMRect, pad: number): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x1 = Math.max(0, rect.left - pad);
  const y1 = Math.max(0, rect.top - pad);
  const x2 = Math.min(vw, rect.right + pad);
  const y2 = Math.min(vh, rect.bottom + pad);
  return `polygon(evenodd, 0px 0px, ${vw}px 0px, ${vw}px ${vh}px, 0px ${vh}px, 0px 0px, ${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px, ${x1}px ${y1}px)`;
}

/**
 * Client-side DOM driver for the voice/chat agent. A singleton so global
 * widgets (chat, voice orb) and page cards share one source of truth.
 *
 * Video playback uses a registry: cards register play/pause handlers keyed by
 * navId, so YouTube/Vimeo (lightbox) and native <video> (.mp4) are all handled
 * without the navigator needing to know the underlying element type.
 */
class BrowserNavigator {
  private players = new Map<string, PlayHandlers>();
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;
  private summaryPulseTimer: ReturnType<typeof setTimeout> | null = null;
  private currentHighlight: string | null = null;
  private spotlightTarget: HTMLElement | null = null;
  private backdropEl: HTMLDivElement | null = null;
  private ringEl: HTMLDivElement | null = null;
  private spotlightListenersBound = false;

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  registerPlayer(navId: string, handlers: PlayHandlers): () => void {
    this.players.set(navId, handlers);
    return () => {
      if (this.players.get(navId) === handlers) {
        this.players.delete(navId);
      }
    };
  }

  private sectionEl(section: NavigatorSection): HTMLElement | null {
    if (!this.isBrowser()) return null;
    return document.querySelector<HTMLElement>(
      `[data-nav-section="${section}"]`,
    );
  }

  private itemEl(navId: string): HTMLElement | null {
    if (!this.isBrowser()) return null;
    return document.querySelector<HTMLElement>(`[data-nav-id="${navId}"]`);
  }

  scrollToSection(section: NavigatorSection): boolean {
    const el = this.sectionEl(section);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  scrollToItem(navId: string): boolean {
    const el = this.itemEl(navId);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }

  private ensureSpotlightLayer(): void {
    if (!this.isBrowser() || this.backdropEl) return;

    const backdrop = document.createElement("div");
    backdrop.className = "nav-spotlight-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", () => this.clearHighlight());
    document.body.appendChild(backdrop);
    this.backdropEl = backdrop;

    const ring = document.createElement("div");
    ring.className = "nav-spotlight-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    this.ringEl = ring;
  }

  private bindSpotlightListeners(): void {
    if (!this.isBrowser() || this.spotlightListenersBound) return;
    this.spotlightListenersBound = true;

    const refresh = () => this.positionSpotlight();
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
  }

  private positionSpotlight(): void {
    const el = this.spotlightTarget;
    if (!el || !this.backdropEl || !this.ringEl) return;

    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    this.backdropEl.style.clipPath = buildSpotlightClipPath(
      rect,
      SPOTLIGHT_PAD,
    );
    const pad = SPOTLIGHT_PAD;
    this.ringEl.style.top = `${rect.top - pad}px`;
    this.ringEl.style.left = `${rect.left - pad}px`;
    this.ringEl.style.width = `${rect.width + pad * 2}px`;
    this.ringEl.style.height = `${rect.height + pad * 2}px`;
  }

  private showSpotlight(el: HTMLElement): void {
    this.ensureSpotlightLayer();
    this.bindSpotlightListeners();
    this.spotlightTarget = el;
    document.body.classList.add("nav-spotlight-active");
    this.backdropEl?.classList.add("is-visible");
    this.ringEl?.classList.add("is-visible");
    this.positionSpotlight();
  }

  private hideSpotlight(): void {
    this.spotlightTarget = null;
    document.body.classList.remove("nav-spotlight-active");
    this.backdropEl?.classList.remove("is-visible");
    this.ringEl?.classList.remove("is-visible");
    if (this.backdropEl) this.backdropEl.style.clipPath = "";
  }

  private resetHighlightTimer(): void {
    if (this.highlightTimer) clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(() => {
      this.clearHighlight();
    }, HIGHLIGHT_MS);
  }

  highlightItem(navId: string): boolean {
    if (!this.isBrowser()) return false;
    const el = this.itemEl(navId);
    if (!el) return false;

    if (this.currentHighlight && this.currentHighlight !== navId) {
      const prev = this.itemEl(this.currentHighlight);
      prev?.classList.remove(HIGHLIGHT_CLASS);
    }

    el.classList.add(HIGHLIGHT_CLASS);
    this.currentHighlight = navId;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    requestAnimationFrame(() => {
      this.showSpotlight(el);
      requestAnimationFrame(() => this.positionSpotlight());
    });

    this.resetHighlightTimer();
    return true;
  }

  emphasizeItemSummary(navId: string): boolean {
    if (!this.isBrowser()) return false;
    const el = this.itemEl(navId);
    if (!el) return false;

    const nodes = Array.from(
      el.querySelectorAll<HTMLElement>("[data-nav-summary]"),
    );

    for (const node of nodes) {
      node.classList.add(SUMMARY_PULSE_CLASS);
    }

    if (this.summaryPulseTimer) clearTimeout(this.summaryPulseTimer);
    this.summaryPulseTimer = setTimeout(() => {
      for (const node of nodes) {
        node.classList.remove(SUMMARY_PULSE_CLASS);
      }
    }, SUMMARY_PULSE_MS);

    return nodes.length > 0;
  }

  clearHighlight(): void {
    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
      this.highlightTimer = null;
    }
    if (this.summaryPulseTimer) {
      clearTimeout(this.summaryPulseTimer);
      this.summaryPulseTimer = null;
    }
    if (this.currentHighlight && this.isBrowser()) {
      const prev = this.itemEl(this.currentHighlight);
      prev?.classList.remove(HIGHLIGHT_CLASS);
      prev
        ?.querySelectorAll(`.${SUMMARY_PULSE_CLASS}`)
        .forEach((n) => n.classList.remove(SUMMARY_PULSE_CLASS));
    }
    this.currentHighlight = null;
    this.hideSpotlight();
  }

  playVideo(navId: string): boolean {
    this.resetHighlightTimer();

    const handlers = this.players.get(navId);
    if (handlers) {
      handlers.play();
      return true;
    }
    // Fallback: native video element inside the card.
    const video = this.itemEl(navId)?.querySelector("video");
    if (video) {
      void video.play().catch(() => {});
      this.scrollToItem(navId);
      return true;
    }
    return false;
  }

  pauseVideo(navId: string): void {
    const handlers = this.players.get(navId);
    if (handlers) {
      handlers.pause();
      return;
    }
    const video = this.itemEl(navId)?.querySelector("video");
    video?.pause();
  }

  private sectionItems(section: NavigatorSection): HTMLElement[] {
    if (!this.isBrowser()) return [];
    const root = this.sectionEl(section);
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLElement>("[data-nav-id]"),
    ).sort((a, b) => {
      const ai = Number(a.dataset.navIndex ?? "0");
      const bi = Number(b.dataset.navIndex ?? "0");
      return ai - bi;
    });
  }

  getSectionItemCount(section: NavigatorSection): number {
    return this.sectionItems(section).length;
  }

  /** Highlights the item at index within section; wraps around. Returns navId. */
  goToIndex(section: NavigatorSection, index: number): string | null {
    const items = this.sectionItems(section);
    if (items.length === 0) return null;
    const wrapped = ((index % items.length) + items.length) % items.length;
    const target = items[wrapped];
    const navId = target?.dataset.navId ?? null;
    if (navId) this.highlightItem(navId);
    return navId;
  }

  nextItem(section: NavigatorSection, currentIndex: number): string | null {
    return this.goToIndex(section, currentIndex + 1);
  }

  prevItem(section: NavigatorSection, currentIndex: number): string | null {
    return this.goToIndex(section, currentIndex - 1);
  }

  /** The section whose heading is nearest the top of the viewport. */
  getCurrentScrollSection(): NavigatorSection | null {
    if (!this.isBrowser()) return null;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-section]"),
    );
    if (sections.length === 0) return null;

    let best: { section: NavigatorSection; dist: number } | null = null;
    for (const el of sections) {
      const section = el.dataset.navSection as NavigatorSection | undefined;
      if (!section) continue;
      const dist = Math.abs(el.getBoundingClientRect().top - 96);
      if (!best || dist < best.dist) best = { section, dist };
    }
    return best?.section ?? null;
  }

  getItemIndex(navId: string): number {
    const el = this.itemEl(navId);
    if (!el) return 0;
    return Number(el.dataset.navIndex ?? "0");
  }
}

export const browserNav = new BrowserNavigator();
