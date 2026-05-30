import { browserNav } from "@/lib/browser-navigator";
import { goToPortfolioPage, isOnPortfolioPage } from "@/lib/agent-tour";
import {
  consumePendingNav,
  hasItemInDom,
  scrollToHomePortfolio,
  setPendingNav,
  type PendingNavAction,
} from "@/lib/portfolio/pending-nav";
import type { NavItem, NavigatorSection } from "@/types/navigator";

const PORTFOLIO_FOCUS_DELAY_MS = 450;
const PORTFOLIO_PLAY_DELAY_MS = 700;

function runOnPortfolioPage(
  navId: string,
  playVideo: boolean,
  catalog: NavItem[],
): void {
  const item = catalog.find((i) => i.navId === navId);
  if (!item) return;

  browserNav.scrollToSection(item.navSection);
  window.setTimeout(() => {
    browserNav.scrollToItem(navId);
    browserNav.highlightItem(navId);
    if (playVideo && item.videoUrl) {
      window.setTimeout(() => browserNav.playVideo(navId), PORTFOLIO_PLAY_DELAY_MS);
    }
  }, PORTFOLIO_FOCUS_DELAY_MS);
}

function runOnHomepagePreview(
  navId: string,
  section: NavigatorSection,
): void {
  scrollToHomePortfolio();
  window.setTimeout(() => {
    browserNav.scrollToSection(section);
    window.setTimeout(() => {
      browserNav.scrollToItem(navId);
      browserNav.highlightItem(navId);
    }, PORTFOLIO_FOCUS_DELAY_MS);
  }, 350);
}

export function focusPortfolioItem(
  catalog: NavItem[],
  navId: string,
  playVideo: boolean,
): void {
  const item = catalog.find((i) => i.navId === navId);
  if (!item) return;

  if (isOnPortfolioPage()) {
    runOnPortfolioPage(navId, playVideo, catalog);
    return;
  }

  const onHomePreview = hasItemInDom(navId);

  if (onHomePreview && !playVideo) {
    runOnHomepagePreview(navId, item.navSection);
    return;
  }

  setPendingNav({
    type: playVideo ? "play_video" : "highlight",
    navId,
  });
  goToPortfolioPage("agent");
}

export function scrollPortfolioSection(section: NavigatorSection): void {
  if (isOnPortfolioPage()) {
    browserNav.scrollToSection(section);
    return;
  }

  const homeSection = document.querySelector(
    `#portfolio [data-nav-section="${section}"]`,
  );
  if (homeSection) {
    scrollToHomePortfolio();
    window.setTimeout(() => browserNav.scrollToSection(section), 350);
    return;
  }

  setPendingNav({ type: "scroll_to", section });
  goToPortfolioPage("agent");
}

export function openPortfolioForTour(): void {
  goToPortfolioPage("agent");
}

export function dismissPortfolioSpotlight(): void {
  browserNav.clearHighlight();
}

/** Run a stored action after client navigation to /portfolio (voice call stays alive). */
export function applyPendingNavAction(
  catalog: NavItem[],
  action: PendingNavAction,
): void {
  if (action.type === "scroll_to" && action.section) {
    browserNav.scrollToSection(action.section);
    return;
  }

  if (action.navId) {
    const playVideo = action.type === "play_video";
    window.setTimeout(() => {
      runOnPortfolioPage(action.navId!, playVideo, catalog);
    }, 500);
  }
}

export function flushPendingNav(catalog: NavItem[]): void {
  const pending = consumePendingNav();
  if (!pending || !isOnPortfolioPage()) return;
  applyPendingNavAction(catalog, pending);
}
