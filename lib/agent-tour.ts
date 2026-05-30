import {
  PORTFOLIO_AGENT_NAV_EVENT,
  type PortfolioEntryParam,
} from "@/lib/portfolio/portfolio-entry";
import type { AgentSessionState } from "@/types/agent-state";

/** After this many projects shown, Neha should move toward contact / lead capture. */
export const TOUR_LEAD_CAPTURE_AFTER_PROJECTS = 2;

/** User turns before suggesting the contact form (voice + chat combined). */
export const TOUR_LEAD_CAPTURE_AFTER_TURNS = 4;

export function shouldSteerToLeadCapture(session: AgentSessionState): boolean {
  const presented = session.projectsPresentedCount ?? 0;
  return (
    presented >= TOUR_LEAD_CAPTURE_AFTER_PROJECTS ||
    session.turnCount >= TOUR_LEAD_CAPTURE_AFTER_TURNS ||
    session.leadStage === "ready" ||
    session.leadStage === "captured"
  );
}

export function isOnPortfolioPage(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/portfolio");
}

export function goToPortfolioPage(entry: PortfolioEntryParam = "see-work"): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/portfolio")) return;

  if (entry === "agent") {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_AGENT_NAV_EVENT));
    return;
  }

  window.location.assign(`/portfolio?entry=${entry}`);
}
