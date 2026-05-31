import { browserNav } from "@/lib/browser-navigator";
import { isOnPortfolioPage } from "@/lib/agent-tour";
import {
  dismissPortfolioSpotlight,
  openPortfolioForTour,
  summarizePortfolioItem,
} from "@/lib/portfolio/run-nav-command";
import { buildProjectNarration } from "@/lib/portfolio/website-showcase-speech";
import { showcaseWebsiteProject } from "@/lib/portfolio/voice-nav-sequence";
import type { AgentSessionState } from "@/types/agent-state";
import type { NavItem } from "@/types/navigator";

const BETWEEN_MS = 600;
const LIVE_SITE_PAINT_MS = 1_100;
const CARD_DWELL_MS = 5_500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

let tourRunning = false;

export function isCuratedTourRunning(): boolean {
  return tourRunning;
}

export type GuidedTourDeps = {
  speak: (text: string) => Promise<void>;
  recordTurn: (
    role: "assistant",
    content: string,
    channel: "voice",
  ) => void;
  getSession: () => AgentSessionState;
};

/**
 * Voice tour: open each pick, narrate that specific project, then move to the next.
 */
export async function runGuidedPortfolioTour(
  catalog: NavItem[],
  items: NavItem[],
  deps: GuidedTourDeps,
): Promise<void> {
  if (items.length === 0 || tourRunning) return;
  tourRunning = true;

  try {
    if (!isOnPortfolioPage()) {
      openPortfolioForTour();
      await delay(900);
    }

    const primarySection = items[0]?.navSection;
    if (primarySection) {
      browserNav.scrollToSection(primarySection);
      await delay(BETWEEN_MS);
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const session = deps.getSession();
      const speech = buildProjectNarration(item, session);

      deps.recordTurn("assistant", speech, "voice");

      if (item.navSection === "websites" && item.websiteUrl) {
        await showcaseWebsiteProject(catalog, item.navId);
        await delay(LIVE_SITE_PAINT_MS);
      } else {
        summarizePortfolioItem(catalog, item.navId);
        if (item.videoUrl) {
          await delay(800);
          browserNav.playVideo(item.navId);
        }
        await delay(500);
      }

      await deps.speak(speech);

      if (i < items.length - 1) {
        dismissPortfolioSpotlight();
        await delay(BETWEEN_MS);
      }
    }
  } finally {
    tourRunning = false;
  }
}

/**
 * Silent visual tour for chat (no TTS).
 */
export async function presentCuratedPortfolioTour(
  catalog: NavItem[],
  items: NavItem[],
): Promise<void> {
  if (items.length === 0 || tourRunning) return;
  tourRunning = true;

  try {
    if (!isOnPortfolioPage()) {
      openPortfolioForTour();
      await delay(900);
    }

    const primarySection = items[0]?.navSection;
    if (primarySection) {
      browserNav.scrollToSection(primarySection);
      await delay(BETWEEN_MS);
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;

      if (item.navSection === "websites" && item.websiteUrl) {
        await showcaseWebsiteProject(catalog, item.navId);
      } else {
        summarizePortfolioItem(catalog, item.navId);
        if (item.videoUrl) {
          await delay(800);
          browserNav.playVideo(item.navId);
        }
      }

      if (i < items.length - 1) {
        await delay(CARD_DWELL_MS);
        dismissPortfolioSpotlight();
        await delay(BETWEEN_MS);
      }
    }
  } finally {
    tourRunning = false;
  }
}
