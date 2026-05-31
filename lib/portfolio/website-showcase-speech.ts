import type { AgentSessionState } from "@/types/agent-state";
import type { NavItem } from "@/types/navigator";

function usesAiSpeech(aiSpeech: string | undefined, item: NavItem): boolean {
  if (!aiSpeech?.trim() || aiSpeech.trim().length < 60) return false;
  const titleWord = item.title.split(/\s+/)[0]?.toLowerCase();
  if (titleWord && titleWord.length > 2) {
    return aiSpeech.toLowerCase().includes(titleWord);
  }
  return aiSpeech.trim().length >= 100;
}

/** Spoken narration for one portfolio pick (website, video, or automation). */
export function buildProjectNarration(
  item: NavItem,
  session: AgentSessionState,
  aiSpeech?: string,
): string {
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
