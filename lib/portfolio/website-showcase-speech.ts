import { SECTION_LABEL } from "@/lib/portfolio-nav";
import type { AgentSessionState } from "@/types/agent-state";
import type { NavItem } from "@/types/navigator";

function usesAiSpeech(aiSpeech: string | undefined, item: NavItem): boolean {
  if (item.navSection === "creatives") return false;
  if (!aiSpeech?.trim() || aiSpeech.trim().length < 60) return false;
  const titleWord = item.title.split(/\s+/)[0]?.toLowerCase();
  if (titleWord && titleWord.length > 2) {
    return aiSpeech.toLowerCase().includes(titleWord);
  }
  return aiSpeech.trim().length >= 100;
}

export function isCreativesItem(item: NavItem): boolean {
  return item.navSection === "creatives";
}

/** Spoken before a curated portfolio walk — names what the visitor is about to see. */
export function buildPortfolioTourIntro(
  items: NavItem[],
  session: AgentSessionState,
): string {
  if (items.length === 0) return "";

  const sectionLabels = [
    ...new Set(items.map((i) => SECTION_LABEL[i.navSection])),
  ];
  const names = items.map((p) => p.title).join(", ");
  const tailored = session.business?.trim()
    ? ` picked for ${session.business}`
    : " matched to what you shared";

  return [
    `I'm going to show you our BrandCure portfolio${tailored} — real client work, not stock examples.`,
    `You'll see ${items.length} project${items.length > 1 ? "s" : ""} from ${sectionLabels.join(" and ")}: ${names}.`,
  ].join(" ");
}

/**
 * AI video ads: significance only (result/metric + fit) — never read adDescription aloud.
 * Client plays the video right after this line.
 */
export function buildAiAdPrePlaySpeech(
  item: NavItem,
  session: AgentSessionState,
): string {
  const parts: string[] = [
    `From our AI video ads portfolio — ${item.title}.`,
  ];

  const significance = item.result?.trim();
  if (significance) {
    parts.push(`What makes this one worth watching: ${significance}.`);
  }

  const business = session.business?.trim();
  if (business) {
    parts.push(
      `For ${business}, this is a strong reference for the kind of hook and offer we could build for you.`,
    );
  }

  parts.push("I'll play the ad now — watch the creative.");
  return parts.join(" ");
}

/** Spoken narration for one portfolio pick (website, automation, or AI ad). */
export function buildProjectNarration(
  item: NavItem,
  session: AgentSessionState,
  aiSpeech?: string,
): string {
  if (isCreativesItem(item)) {
    return buildAiAdPrePlaySpeech(item, session);
  }

  if (usesAiSpeech(aiSpeech, item)) return aiSpeech!.trim();

  const parts: string[] = [`Here's ${item.title}.`];

  const detail = item.agentSummary?.trim() || item.result?.trim();
  if (detail) parts.push(detail);

  const business = session.business?.trim();
  if (business) {
    parts.push(`For ${business}, this is a relevant example of what we could do for you.`);
  }

  if (item.websiteUrl || item.navSection === "websites") {
    parts.push("I'm opening the live site on screen now.");
  } else if (item.videoUrl) {
    parts.push("Let me play the showcase video.");
  }

  return parts.join(" ");
}

export function isWebsiteShowcaseCommand(
  command: string,
  item?: NavItem,
): boolean {
  if (command === "show_website") return true;
  if (command === "open_website" && item?.websiteUrl) return true;
  if (
    command === "open_detail" &&
    item &&
    (item.navSection === "websites" || item.websiteUrl)
  ) {
    return true;
  }
  return false;
}

export function isAiAdPlayCommand(
  command: string,
  item?: NavItem,
): boolean {
  return command === "play_video" && Boolean(item && isCreativesItem(item));
}
