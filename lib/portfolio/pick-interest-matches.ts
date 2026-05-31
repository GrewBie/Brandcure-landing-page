import { inferInterestFromText } from "@/lib/agent-state";
import { getSectionFromConversation } from "@/lib/video-suggester";
import type { AgentMessage, AgentSessionState } from "@/types/agent-state";
import type { NavItem, NavigatorSection } from "@/types/navigator";

export const CURATED_PICK_MIN = 2;
export const CURATED_PICK_MAX = 3;

function conversationBlob(
  session: AgentSessionState,
  messages: AgentMessage[],
): string {
  const parts = [
    session.business ?? "",
    session.challenge ?? "",
    session.city ?? "",
    session.name ?? "",
    ...messages.slice(-8).map((m) => m.content),
  ];
  return parts.join(" ").toLowerCase();
}

function scoreItem(
  item: NavItem,
  text: string,
  session: AgentSessionState,
  sectionBias: NavigatorSection | null,
): number {
  let score = 0;

  for (const kw of item.keywords) {
    if (kw.length > 2 && text.includes(kw)) score += 2;
  }
  if (text.includes(item.title.toLowerCase())) score += 4;
  if (text.includes(item.industry.toLowerCase())) score += 3;
  if (item.agentSummary && text.includes(item.agentSummary.slice(0, 40).toLowerCase())) {
    score += 1;
  }

  const interest =
    session.interest && session.interest !== "unknown"
      ? session.interest
      : null;
  if (interest && item.navSection === interest) score += 5;
  if (sectionBias && item.navSection === sectionBias) score += 4;

  if (session.business) {
    const biz = session.business.toLowerCase();
    if (item.industry.toLowerCase().split(/\s+/).some((w) => biz.includes(w))) {
      score += 3;
    }
  }

  if (/medtech|health|clinic|hospital/.test(text) && /med|health|clinic/i.test(item.title + item.keywords.join(" "))) {
    score += 4;
  }
  if (/d2c|ecommerce|shop|store|brand/.test(text) && /d2c|ecom|retail|brand/i.test(item.title + item.industry)) {
    score += 3;
  }
  if (/real estate|builder|property/.test(text) && /builder|estate|property/i.test(item.title + item.keywords.join(" "))) {
    score += 4;
  }
  if (/restaurant|food|cafe|f&b/.test(text) && /food|restaurant|cafe|f&b/i.test(item.title + item.keywords.join(" "))) {
    score += 3;
  }

  if (item.videoUrl) score += 1;

  return score;
}

/** True once the visitor has shared enough for a tailored portfolio tour. */
export function shouldCuratePortfolioTour(session: AgentSessionState): boolean {
  if (session.curatedTourShown) return false;
  if (session.turnCount < 1) return false;
  if ((session.projectsPresentedCount ?? 0) >= CURATED_PICK_MAX) return false;

  return (
    Boolean(session.business?.trim()) ||
    Boolean(session.challenge?.trim()) ||
    Boolean(session.name?.trim()) ||
    Boolean(session.interest && session.interest !== "unknown")
  );
}

/**
 * Rank catalog items and return 2–3 best matches for this visitor.
 * Prefers diversity across sections unless interest is explicit.
 */
export function pickInterestPortfolio(
  catalog: NavItem[],
  session: AgentSessionState,
  messages: AgentMessage[],
  limit = CURATED_PICK_MAX,
): NavItem[] {
  if (catalog.length === 0) return [];

  const text = conversationBlob(session, messages);
  const presented = new Set(session.presentedNavIds ?? []);
  const pool = catalog.filter((i) => !presented.has(i.navId));
  const candidates = pool.length >= CURATED_PICK_MIN ? pool : catalog;

  const sectionBias =
    (session.interest && session.interest !== "unknown"
      ? session.interest
      : null) ??
    getSectionFromConversation(text) ??
    inferInterestFromText(text) ??
    null;

  const ranked = candidates
    .map((item) => ({
      item,
      score: scoreItem(item, text, session, sectionBias),
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return [];

  const picked: NavItem[] = [];
  const usedSections = new Set<NavigatorSection>();

  const push = (item: NavItem) => {
    if (picked.some((p) => p.navId === item.navId)) return;
    picked.push(item);
    usedSections.add(item.navSection);
  };

  push(ranked[0]!.item);

  const lockSection =
    sectionBias &&
    ranked.filter((r) => r.item.navSection === sectionBias).length >= CURATED_PICK_MIN;

  for (const { item, score } of ranked.slice(1)) {
    if (picked.length >= limit) break;
    if (lockSection && item.navSection !== sectionBias) continue;
    if (!lockSection && usedSections.has(item.navSection) && score < ranked[0]!.score * 0.6) {
      continue;
    }
    push(item);
  }

  for (const { item } of ranked) {
    if (picked.length >= limit) break;
    push(item);
  }

  return picked.slice(0, limit);
}

/** Prompt block listing the curated navIds for Anthropic. */
export function curatedPicksPromptBlock(
  picks: NavItem[],
  session: AgentSessionState,
): string {
  if (picks.length === 0) return "";
  const lines = picks.map(
    (p, i) =>
      `${i + 1}. navId="${p.navId}" | ${p.navSection} | "${p.title}" (${p.industry}) — ${p.result}`,
  );
  return [
    "CURATED PORTFOLIO PICKS for this visitor (show ONLY these 2–3, in order — do not pick random other navIds):",
    ...lines,
    session.business ? `Tailor narration to their business: ${session.business}.` : "",
    session.challenge ? `Their goal: ${session.challenge}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
