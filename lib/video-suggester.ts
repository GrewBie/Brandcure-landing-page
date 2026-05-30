import type { NavItem, NavigatorSection } from "@/types/navigator";

/** Keyword hints that map free conversation text to a portfolio section. */
const SECTION_HINTS: Record<NavigatorSection, string[]> = {
  creatives: [
    "ad",
    "ads",
    "video",
    "creative",
    "reel",
    "ugc",
    "commercial",
    "content",
    "campaign",
  ],
  automations: [
    "automat",
    "agent",
    "workflow",
    "bot",
    "chatbot",
    "whatsapp",
    "crm",
    "lead",
    "ai system",
    "integration",
  ],
  websites: [
    "website",
    "site",
    "landing",
    "web",
    "ecommerce",
    "store",
    "shopify",
    "page",
    "redesign",
  ],
};

function normalize(text: string): string {
  return text.toLowerCase();
}

/** Best-guess section from conversation text, or null if unclear. */
export function getSectionFromConversation(
  text: string,
): NavigatorSection | null {
  const t = normalize(text);
  let bestSection: NavigatorSection | null = null;
  let bestScore = 0;

  for (const section of Object.keys(SECTION_HINTS) as NavigatorSection[]) {
    const score = SECTION_HINTS[section].reduce(
      (acc, hint) => (t.includes(hint) ? acc + 1 : acc),
      0,
    );
    if (score > 0 && score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestSection;
}

function scoreItem(item: NavItem, text: string): number {
  const t = normalize(text);
  let score = 0;
  for (const kw of item.keywords) {
    if (kw.length > 2 && t.includes(kw)) score += 1;
  }
  if (t.includes(item.title.toLowerCase())) score += 3;
  if (t.includes(item.industry.toLowerCase())) score += 1;
  return score;
}

/**
 * Recommends a portfolio video from the (CMS-derived) catalog based on the
 * conversation. Only returns items that actually have a video. `seen` lets the
 * caller avoid re-suggesting the same items.
 */
export function suggestVideo(
  text: string,
  catalog: NavItem[],
  seen: string[] = [],
): NavItem | null {
  const candidates = catalog.filter(
    (item) => item.videoUrl && !seen.includes(item.navId),
  );
  if (candidates.length === 0) return null;

  const section = getSectionFromConversation(text);

  const ranked = candidates
    .map((item) => {
      let score = scoreItem(item, text);
      if (section && item.navSection === section) score += 2;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  if (!top) return null;

  // Require some signal; otherwise only suggest if the user clearly asked.
  if (top.score <= 0) {
    return section ? top.item : null;
  }
  return top.item;
}
