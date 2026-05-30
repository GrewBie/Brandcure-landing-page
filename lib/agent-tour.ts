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

export function goToPortfolioPage(entry = "see-work"): void {
  if (typeof window === "undefined") return;
  const target = `/portfolio?entry=${entry}`;
  if (window.location.pathname.startsWith("/portfolio")) return;
  window.location.assign(target);
}
