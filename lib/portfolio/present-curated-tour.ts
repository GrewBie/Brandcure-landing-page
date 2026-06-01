import {
  cancellableDelay,
  getAgentActivityGeneration,
  isActivityCancelledError,
  isAgentActivityActive,
} from "@/lib/agent-activity";
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
  /** Generation from cancelAgentPresentation — tour exits when stale. */
  workGen?: number;
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
  const workGen = deps.workGen ?? getAgentActivityGeneration();
  tourRunning = true;

  try {
    if (!isOnPortfolioPage()) {
      openPortfolioForTour();
      await cancellableDelay(900, workGen);
    }

    const primarySection = items[0]?.navSection;
    if (primarySection) {
      browserNav.scrollToSection(primarySection);
      await cancellableDelay(BETWEEN_MS, workGen);
    }

    for (let i = 0; i < items.length; i++) {
      if (!isAgentActivityActive(workGen)) break;

      const item = items[i]!;
      const session = deps.getSession();
      const speech = buildProjectNarration(item, session);

      deps.recordTurn("assistant", speech, "voice");

      if (item.navSection === "websites" && item.websiteUrl) {
        await showcaseWebsiteProject(catalog, item.navId, workGen);
        await cancellableDelay(LIVE_SITE_PAINT_MS, workGen);
      } else {
        summarizePortfolioItem(catalog, item.navId);
        if (item.videoUrl) {
          await cancellableDelay(800, workGen);
          if (!isAgentActivityActive(workGen)) break;
          browserNav.playVideo(item.navId);
        }
        await cancellableDelay(500, workGen);
      }

      if (!isAgentActivityActive(workGen)) break;

      await deps.speak(speech);

      if (!isAgentActivityActive(workGen)) break;

      if (i < items.length - 1) {
        dismissPortfolioSpotlight();
        await cancellableDelay(BETWEEN_MS, workGen);
      }
    }
  } catch (error) {
    if (!isActivityCancelledError(error)) throw error;
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
  workGen?: number,
): Promise<void> {
  if (items.length === 0 || tourRunning) return;
  const gen = workGen ?? getAgentActivityGeneration();
  tourRunning = true;

  try {
    if (!isOnPortfolioPage()) {
      openPortfolioForTour();
      await cancellableDelay(900, gen);
    }

    const primarySection = items[0]?.navSection;
    if (primarySection) {
      browserNav.scrollToSection(primarySection);
      await cancellableDelay(BETWEEN_MS, gen);
    }

    for (let i = 0; i < items.length; i++) {
      if (!isAgentActivityActive(gen)) break;

      const item = items[i]!;

      if (item.navSection === "websites" && item.websiteUrl) {
        await showcaseWebsiteProject(catalog, item.navId, gen);
      } else {
        summarizePortfolioItem(catalog, item.navId);
        if (item.videoUrl) {
          await cancellableDelay(800, gen);
          if (!isAgentActivityActive(gen)) break;
          browserNav.playVideo(item.navId);
        }
      }

      if (!isAgentActivityActive(gen)) break;

      if (i < items.length - 1) {
        await cancellableDelay(CARD_DWELL_MS, gen);
        dismissPortfolioSpotlight();
        await cancellableDelay(BETWEEN_MS, gen);
      }
    }
  } catch (error) {
    if (!isActivityCancelledError(error)) throw error;
  } finally {
    tourRunning = false;
  }
}
