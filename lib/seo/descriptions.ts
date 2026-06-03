/** Target ~150–155 characters — fits most Google SERP snippets without truncation. */
export const META_DESC_MAX = 155;

/** Collapse whitespace and trim to SERP-friendly length. */
export function metaDescription(text: string, max = META_DESC_MAX): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

/** Site-wide default — used in root layout and as fallback. */
export const HOME_META_TITLE =
  "AI Marketing Agency India | WhatsApp Automation | BrandCure";

export const HOME_META_DESCRIPTION = metaDescription(
  "Stop losing leads you already paid for. BrandCure builds your website, runs AI marketing & automates WhatsApp follow-up. Free audit in 24–48 hrs.",
);

export const BLOG_INDEX_META_DESCRIPTION = metaDescription(
  "Guides on AI marketing, WhatsApp automation, and website SEO for Indian SMBs and startups. Practical growth insights from BrandCure.",
);

/** SERP title — benefit-first, ~60 chars visible in Google. */
export const PORTFOLIO_INDEX_META_TITLE =
  "Your Digital Partner — Go AI-First & AI-Native | BrandCure";

export const PORTFOLIO_INDEX_META_DESCRIPTION = metaDescription(
  "Make your business AI-native—websites, AI video ads & automation from your digital partner. Real client work. Browse case studies. Free audit.",
);
