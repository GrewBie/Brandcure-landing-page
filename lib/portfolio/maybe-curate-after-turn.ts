import {
  CURATED_PICK_MIN,
  curatedPicksPromptBlock,
  pickInterestPortfolio,
  shouldCuratePortfolioTour,
} from "@/lib/portfolio/pick-interest-matches";
import {
  presentCuratedPortfolioTour,
  type GuidedTourDeps,
  runGuidedPortfolioTour,
} from "@/lib/portfolio/present-curated-tour";
import type { AgentMessage, AgentSessionState, AgentStatePatch } from "@/types/agent-state";
import type { NavItem } from "@/types/navigator";

export type CurateAfterTurnResult = {
  picks: NavItem[];
  promptBlock: string;
  sessionPatch: AgentStatePatch;
};

/** Pick 2–3 matches and build session/prompt updates when the visitor is qualified. */
export function planCuratedPortfolioTour(
  catalog: NavItem[],
  session: AgentSessionState,
  messages: AgentMessage[],
): CurateAfterTurnResult | null {
  if (!shouldCuratePortfolioTour(session)) return null;

  const picks = pickInterestPortfolio(catalog, session, messages);
  if (picks.length < CURATED_PICK_MIN) return null;

  const presented = new Set(session.presentedNavIds ?? []);
  for (const p of picks) presented.add(p.navId);

  return {
    picks,
    promptBlock: curatedPicksPromptBlock(picks, session),
    sessionPatch: {
      curatedTourShown: true,
      presentedNavIds: Array.from(presented),
      projectsPresentedCount: Math.max(
        session.projectsPresentedCount ?? 0,
        picks.length,
      ),
      leadStage:
        session.leadStage === "browsing" ? "exploring" : session.leadStage,
      interest:
        session.interest && session.interest !== "unknown"
          ? session.interest
          : picks[0]?.navSection,
      lastProjectNavId: picks[picks.length - 1]?.navId,
      lastProjectTitle: picks[picks.length - 1]?.title,
    },
  };
}

/** Run the visual tour for chat (no narration). */
export function runCuratedPortfolioTour(
  catalog: NavItem[],
  picks: NavItem[],
): void {
  void presentCuratedPortfolioTour(catalog, picks);
}

/** Voice: narrate each pick, then advance to the next. */
export function runCuratedPortfolioTourWithNarration(
  catalog: NavItem[],
  picks: NavItem[],
  deps: GuidedTourDeps,
): void {
  void runGuidedPortfolioTour(catalog, picks, deps);
}
