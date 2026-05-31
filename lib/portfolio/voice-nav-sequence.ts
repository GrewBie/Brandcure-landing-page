import { browserNav } from "@/lib/browser-navigator";
import { isOnPortfolioPage, goToPortfolioPage } from "@/lib/agent-tour";
import {
  dismissPortfolioSpotlight,
  focusPortfolioItem,
  summarizePortfolioItem,
} from "@/lib/portfolio/run-nav-command";
import {
  hasItemInDom,
  setPendingNav,
  type PendingNavAction,
} from "@/lib/portfolio/pending-nav";
import {
  dispatchVoiceNav,
  markScrollLivePreview,
} from "@/lib/portfolio/voice-nav-events";
import type { NavItem, NavigatorCommand } from "@/types/navigator";

const HIGHLIGHT_DWELL_MS = 1_600;
const STEP_GAP_MS = 400;
const PORTFOLIO_PLAY_DELAY = 700;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitForHighlight(navId: string): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      browserNav.highlightItem(navId);
      resolve();
    }, 450);
  });
}

/** Highlight card on list/home, then client-navigate to detail (voice call stays active). */
export async function showcaseWebsiteProject(
  catalog: NavItem[],
  navId: string,
): Promise<void> {
  const item = catalog.find((i) => i.navId === navId);
  if (!item) return;

  const detailPath = `/portfolio/${navId}`;
  if (window.location.pathname === detailPath) {
    markScrollLivePreview();
    document
      .getElementById("live-website-preview")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const runHighlight = async () => {
    if (isOnPortfolioPage() || hasItemInDom(navId)) {
      if (isOnPortfolioPage()) {
        browserNav.scrollToSection(item.navSection);
        await delay(STEP_GAP_MS);
        browserNav.scrollToItem(navId);
      } else {
        summarizePortfolioItem(catalog, navId);
        await delay(600);
      }
      await waitForHighlight(navId);
      browserNav.emphasizeItemSummary(navId);
      await delay(HIGHLIGHT_DWELL_MS);
      dismissPortfolioSpotlight();
      await delay(STEP_GAP_MS);
    }
    markScrollLivePreview();
    dispatchVoiceNav({ type: "open_detail", navId, scrollLivePreview: true });
  };

  if (!isOnPortfolioPage() && !hasItemInDom(navId)) {
    setPendingNav({ type: "highlight_then_detail", navId });
    goToPortfolioPage("agent");
    return;
  }

  await runHighlight();
}

export async function executeVoiceNavCommand(
  catalog: NavItem[],
  command: NavigatorCommand,
): Promise<void> {
  const item = command.navId
    ? catalog.find((i) => i.navId === command.navId)
    : undefined;

  if (
    command.command === "show_website" ||
    (command.command === "open_website" && item?.websiteUrl) ||
    (command.command === "open_detail" &&
      item &&
      (item.navSection === "websites" || item.websiteUrl))
  ) {
    if (command.navId) await showcaseWebsiteProject(catalog, command.navId);
    return;
  }

  if (command.command === "open_detail" && command.navId) {
    markScrollLivePreview();
    dispatchVoiceNav({
      type: "open_detail",
      navId: command.navId,
      scrollLivePreview: true,
    });
    return;
  }

  if (command.command === "highlight" && command.navId) {
    focusPortfolioItem(catalog, command.navId, false);
    await waitForHighlight(command.navId);
    return;
  }

  if (command.command === "summarize_card" && command.navId) {
    summarizePortfolioItem(catalog, command.navId);
    await delay(500);
    return;
  }

  if (command.command === "play_video" && command.navId) {
    focusPortfolioItem(catalog, command.navId, true);
    await delay(PORTFOLIO_PLAY_DELAY);
    return;
  }

  // Immediate commands (scroll, open portfolio, dismiss, etc.)
  const { applyAgentNavCommand } = await import(
    "@/lib/portfolio/apply-agent-command"
  );
  applyAgentNavCommand(catalog, command);
}

export async function applyPendingHighlightThenDetail(
  catalog: NavItem[],
  action: PendingNavAction,
): Promise<void> {
  if (action.type !== "highlight_then_detail" || !action.navId) return;
  await showcaseWebsiteProject(catalog, action.navId);
}
