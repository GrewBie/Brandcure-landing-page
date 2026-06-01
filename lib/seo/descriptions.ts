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
export const HOME_META_DESCRIPTION = metaDescription(
  "Chennai AI agency: websites, SEO, WhatsApp automation, AI marketing and video ads for Indian SMBs and startups. Free digital audit in 24–48 hours.",
);

export const BLOG_INDEX_META_DESCRIPTION = metaDescription(
  "Guides on AI marketing, WhatsApp automation, and website SEO for Indian SMBs and startups. Practical growth insights from BrandCure, Chennai.",
);

export const PORTFOLIO_INDEX_META_DESCRIPTION = metaDescription(
  "Case studies: websites, AI video ads, and business automation for SMBs, startups, and D2C brands. Browse work or explore with our AI guide Neha.",
);
