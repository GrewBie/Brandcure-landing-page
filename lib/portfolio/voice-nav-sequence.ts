import {
  cancellableDelay,
  getAgentActivityGeneration,
  isActivityCancelledError,
  isAgentActivityActive,
} from "@/lib/agent-activity";
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

function waitForHighlight(navId: string, workGen: number): Promise<void> {
  return cancellableDelay(450, workGen).then(() => {
    if (!isAgentActivityActive(workGen)) return;
    browserNav.highlightItem(navId);
  });
}

/** Highlight card on list/home, then client-navigate to detail (voice call stays active). */
export async function showcaseWebsiteProject(
  catalog: NavItem[],
  navId: string,
  workGen: number = getAgentActivityGeneration(),
): Promise<void> {
  const item = catalog.find((i) => i.navId === navId);
  if (!item || !isAgentActivityActive(workGen)) return;

  const detailPath = `/portfolio/${navId}`;
  if (window.location.pathname === detailPath) {
    markScrollLivePreview();
    document
      .getElementById("live-website-preview")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const runHighlight = async () => {
    try {
      if (isOnPortfolioPage() || hasItemInDom(navId)) {
        if (isOnPortfolioPage()) {
          browserNav.scrollToSection(item.navSection);
          await cancellableDelay(STEP_GAP_MS, workGen);
          browserNav.scrollToItem(navId);
        } else {
          summarizePortfolioItem(catalog, navId);
          await cancellableDelay(600, workGen);
        }
        await waitForHighlight(navId, workGen);
        if (!isAgentActivityActive(workGen)) return;
        browserNav.emphasizeItemSummary(navId);
        await cancellableDelay(HIGHLIGHT_DWELL_MS, workGen);
        dismissPortfolioSpotlight();
        await cancellableDelay(STEP_GAP_MS, workGen);
      }
      if (!isAgentActivityActive(workGen)) return;
      markScrollLivePreview();
      dispatchVoiceNav({ type: "open_detail", navId, scrollLivePreview: true });
    } catch (error) {
      if (!isActivityCancelledError(error)) throw error;
    }
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
  workGen: number = getAgentActivityGeneration(),
): Promise<void> {
  if (!isAgentActivityActive(workGen)) return;

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
    if (command.navId) {
      await showcaseWebsiteProject(catalog, command.navId, workGen);
    }
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
    await waitForHighlight(command.navId, workGen);
    return;
  }

  if (command.command === "summarize_card" && command.navId) {
    summarizePortfolioItem(catalog, command.navId);
    await cancellableDelay(500, workGen);
    return;
  }

  if (command.command === "play_video" && command.navId) {
    focusPortfolioItem(catalog, command.navId, true);
    await cancellableDelay(PORTFOLIO_PLAY_DELAY, workGen);
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
