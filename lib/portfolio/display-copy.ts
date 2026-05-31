/** Shorten noisy CMS titles (e.g. AI breakdown blobs) for the detail page. */
export function portfolioDisplayTitle(raw: string): string {
  const t = raw.trim();
  if (!t) return "Portfolio project";
  if (t.length <= 72) return t;

  const campaign = t.match(
    /(?:Ad\s*\/\s*campaign name|campaign name)\s+(.+)$/i,
  );
  if (campaign?.[1]) {
    const name = campaign[1].trim();
    if (name.length <= 100) return name;
  }

  const quoted = t.match(/['']([^'']{4,90})['']/);
  if (quoted?.[1]) return quoted[1].trim();

  return `${t.slice(0, 69)}…`;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isNearDuplicate(
  a?: string | null,
  b?: string | null,
): boolean {
  const na = normalize(a ?? "");
  const nb = normalize(b ?? "");
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length > 24 && nb.length > 24) {
    return na.includes(nb) || nb.includes(na);
  }
  return false;
}

export function isAiBreakdownBlob(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("complete portfolio breakdown") ||
    t.includes("based on the file") && t.includes("here is the")
  );
}

export function portfolioDetailSubtitle(
  title: string,
  subtitle: string,
): string | null {
  const sub = subtitle.trim();
  if (!sub || isAiBreakdownBlob(sub)) return null;
  if (isNearDuplicate(sub, title)) return null;
  if (isNearDuplicate(sub, portfolioDisplayTitle(title))) return null;
  return sub;
}
