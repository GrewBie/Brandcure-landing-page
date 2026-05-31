import type { NavItem, NavigatorCommand, NavigatorSection } from "@/types/navigator";

const SECTIONS: NavigatorSection[] = ["creatives", "automations", "websites"];

const ALLOWED_COMMANDS = new Set<NavigatorCommand["command"]>([
  "scroll_to",
  "highlight",
  "play_video",
  "next_item",
  "prev_item",
  "show_all",
  "filter_industry",
  "speak_only",
  "open_portfolio",
  "dismiss_spotlight",
  "capture_lead",
  "open_audit",
  "open_detail",
  "open_website",
  "summarize_card",
]);

/** Resolve navId to a catalog slug (exact, then fuzzy). */
export function resolveNavId(
  navId: string | undefined,
  catalog: NavItem[],
): string | undefined {
  if (!navId?.trim() || catalog.length === 0) return undefined;
  const needle = navId.trim().toLowerCase();
  const exact = catalog.find((i) => i.navId.toLowerCase() === needle);
  if (exact) return exact.navId;
  const partial = catalog.find(
    (i) =>
      i.navId.toLowerCase().includes(needle) ||
      needle.includes(i.navId.toLowerCase()),
  );
  if (partial) return partial.navId;
  const byTitle = catalog.find((i) =>
    i.title.toLowerCase().includes(needle),
  );
  return byTitle?.navId;
}

export function findNavItemByUserText(
  text: string,
  catalog: NavItem[],
): NavItem | undefined {
  const lower = text.toLowerCase();
  const scored = catalog
    .map((item) => {
      let score = 0;
      if (lower.includes(item.navId.replace(/-/g, " "))) score += 8;
      if (lower.includes(item.title.toLowerCase())) score += 10;
      for (const kw of item.keywords) {
        if (kw.length > 3 && lower.includes(kw)) score += 2;
      }
      if (lower.includes(item.industry.toLowerCase())) score += 1;
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.item;
}

/** Clamp AI/voice commands to real catalog data — never run invalid navIds. */
export function sanitizeNavigatorCommand(
  raw: Partial<NavigatorCommand>,
  catalog: NavItem[],
  fallbackSpeech = "I'm not sure which project you mean — say the name or pick websites, automations, or AI ads.",
): NavigatorCommand {
  const command = ALLOWED_COMMANDS.has(raw.command as NavigatorCommand["command"])
    ? (raw.command as NavigatorCommand["command"])
    : "speak_only";

  let speech =
    typeof raw.speech === "string" && raw.speech.trim()
      ? raw.speech.trim().slice(0, 900)
      : fallbackSpeech;

  let section =
    raw.section && SECTIONS.includes(raw.section) ? raw.section : undefined;

  let navId = resolveNavId(raw.navId, catalog);
  const industry =
    typeof raw.industry === "string" && raw.industry.trim()
      ? raw.industry.trim().slice(0, 64)
      : undefined;

  const needsNavId = new Set<NavigatorCommand["command"]>([
    "highlight",
    "play_video",
    "open_detail",
    "open_website",
    "summarize_card",
  ]);

  if (needsNavId.has(command) && !navId) {
    return {
      command: "speak_only",
      speech:
        catalog.length === 0
          ? "Our portfolio is loading — try again in a moment."
          : fallbackSpeech,
      stateUpdate: raw.stateUpdate,
    };
  }

  if (command === "open_website" && navId) {
    const item = catalog.find((i) => i.navId === navId);
    if (!item?.websiteUrl) {
      return {
        command: "open_detail",
        navId,
        section: item?.navSection,
        speech: speech.includes("website")
          ? speech
          : `I'll open the ${item?.title ?? "project"} page — we can view the live site from there.`,
        stateUpdate: raw.stateUpdate,
      };
    }
  }

  if (command === "play_video" && navId) {
    const item = catalog.find((i) => i.navId === navId);
    if (!item?.videoUrl) {
      return {
        command: "summarize_card",
        navId,
        section: item?.navSection ?? section,
        speech: speech,
        stateUpdate: raw.stateUpdate,
      };
    }
  }

  if (!section && navId) {
    section = catalog.find((i) => i.navId === navId)?.navSection;
  }

  if (speech.length > 900) speech = `${speech.slice(0, 897)}…`;

  return {
    command,
    section,
    navId,
    industry,
    speech,
    stateUpdate: raw.stateUpdate,
  };
}
