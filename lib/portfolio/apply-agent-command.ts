import { browserNav } from "@/lib/browser-navigator";
import {
  dismissPortfolioSpotlight,
  focusPortfolioItem,
  openPortfolioDetail,
  openPortfolioForTour,
  openProjectWebsite,
  scrollPortfolioSection,
  summarizePortfolioItem,
} from "@/lib/portfolio/run-nav-command";
import type { NavItem, NavigatorCommand } from "@/types/navigator";

const NAV_EVENTS = {
  filterIndustry: "nav:filter-industry",
  showAll: "nav:show-all",
} as const;

/** Run a guarded navigator command in the browser (voice + chat). */
export function applyAgentNavCommand(
  catalog: NavItem[],
  command: NavigatorCommand,
): void {
  switch (command.command) {
    case "open_portfolio":
      openPortfolioForTour();
      break;
    case "dismiss_spotlight":
      dismissPortfolioSpotlight();
      break;
    case "scroll_to":
      if (command.section) scrollPortfolioSection(command.section);
      break;
    case "highlight":
      if (command.navId) focusPortfolioItem(catalog, command.navId, false);
      break;
    case "play_video":
      if (command.navId) focusPortfolioItem(catalog, command.navId, true);
      break;
    case "summarize_card":
      if (command.navId) summarizePortfolioItem(catalog, command.navId);
      break;
    case "open_detail":
      if (command.navId) openPortfolioDetail(command.navId);
      break;
    case "open_website":
      if (command.navId) {
        const opened = openProjectWebsite(catalog, command.navId);
        if (!opened && command.navId) openPortfolioDetail(command.navId);
      }
      break;
    case "show_all":
      if (command.section) {
        window.dispatchEvent(
          new CustomEvent(NAV_EVENTS.showAll, {
            detail: { section: command.section },
          }),
        );
        browserNav.scrollToSection(command.section);
      }
      break;
    case "filter_industry":
      if (command.industry) {
        window.dispatchEvent(
          new CustomEvent(NAV_EVENTS.filterIndustry, {
            detail: { industry: command.industry },
          }),
        );
        browserNav.scrollToSection("websites");
      }
      break;
    default:
      break;
  }
}
