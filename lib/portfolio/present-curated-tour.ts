import { browserNav } from "@/lib/browser-navigator";
import { isOnPortfolioPage } from "@/lib/agent-tour";
import {
  dismissPortfolioSpotlight,
  openPortfolioForTour,
  summarizePortfolioItem,
} from "@/lib/portfolio/run-nav-command";
import { showcaseWebsiteProject } from "@/lib/portfolio/voice-nav-sequence";
import type { NavItem } from "@/types/navigator";

const CARD_DWELL_MS = 5_500;
const BETWEEN_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

let tourRunning = false;

export function isCuratedTourRunning(): boolean {
  return tourRunning;
}

/**
 * Spotlight 2–3 portfolio cards in sequence after Neha learns the visitor's interest.
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
