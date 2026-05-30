import { browserNav } from "@/lib/browser-navigator";
import { goToPortfolioPage, isOnPortfolioPage } from "@/lib/agent-tour";
import type { NavItem, NavigatorSection } from "@/types/navigator";

export function focusPortfolioItem(
  catalog: NavItem[],
  navId: string,
  playVideo: boolean,
): void {
  if (!isOnPortfolioPage()) {
    goToPortfolioPage("agent");
    return;
  }

  const item = catalog.find((i) => i.navId === navId);
  if (!item) return;

  browserNav.scrollToSection(item.navSection);
  window.setTimeout(() => {
    browserNav.scrollToItem(navId);
    browserNav.highlightItem(navId);
    if (playVideo && item.videoUrl) {
      window.setTimeout(() => browserNav.playVideo(navId), 700);
    }
  }, 400);
}

export function scrollPortfolioSection(section: NavigatorSection): void {
  if (!isOnPortfolioPage()) {
    goToPortfolioPage("agent");
    return;
  }
  browserNav.scrollToSection(section);
}

export function openPortfolioForTour(): void {
  goToPortfolioPage("agent");
}

export function dismissPortfolioSpotlight(): void {
  browserNav.clearHighlight();
}
