/** User chose AI vs manual on the portfolio welcome overlay. */
export const PORTFOLIO_MODE_KEY = "brandcure-portfolio-mode";

/** Welcome overlay already shown this session. */
export const PORTFOLIO_WELCOME_SEEN_KEY = "brandcure-portfolio-welcome-seen";

/** Neha intro speech already played this session (skip on portfolio re-entry). */
export const NEHA_INTRO_PLAYED_KEY = "brandcure-neha-intro-played";

export type PortfolioEntryParam = "see-work" | "agent";

export const PORTFOLIO_AGENT_NAV_EVENT = "brandcure:navigate-portfolio-agent";

export function markPortfolioAgentTour(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PORTFOLIO_WELCOME_SEEN_KEY, "1");
  sessionStorage.setItem(PORTFOLIO_MODE_KEY, "ai");
}

export function hasPlayedNehaIntro(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(NEHA_INTRO_PLAYED_KEY) === "1";
}

export function markNehaIntroPlayed(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NEHA_INTRO_PLAYED_KEY, "1");
}
