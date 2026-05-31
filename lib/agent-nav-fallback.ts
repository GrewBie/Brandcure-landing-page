import { findNavItemByUserText, sanitizeNavigatorCommand } from "@/lib/agent-guardrails";
import { planCuratedPortfolioTour } from "@/lib/portfolio/maybe-curate-after-turn";
import type { AgentMessage, AgentSessionState } from "@/types/agent-state";
import type { NavItem, NavigatorCommand, NavigatorSection } from "@/types/navigator";

function sectionFromText(text: string): NavigatorSection | undefined {
  const lower = text.toLowerCase();
  if (/\b(website|web design|landing page)\b/.test(lower)) return "websites";
  if (/\b(automation|agentic|workflow|n8n)\b/.test(lower)) return "automations";
  if (/\b(video|creative|ad|ads|reel)\b/.test(lower)) return "creatives";
  return undefined;
}

/** Offline / API-down intent — keeps voice + chat usable without Anthropic. */
export function inferCommandFromText(
  text: string,
  catalog: NavItem[],
  session: AgentSessionState,
): NavigatorCommand {
  const lower = text.toLowerCase().trim();
  const item = findNavItemByUserText(text, catalog);
  const section = sectionFromText(text) ?? item?.navSection;

  if (/\b(next|another|move on|what else)\b/.test(lower)) {
    return sanitizeNavigatorCommand(
      {
        command: "next_item",
        section: session.currentSection ?? section ?? "websites",
        speech: "Sure — here's the next project.",
      },
      catalog,
    );
  }

  if (/\b(previous|back|go back)\b/.test(lower)) {
    return sanitizeNavigatorCommand(
      {
        command: "prev_item",
        section: session.currentSection ?? section ?? "websites",
        speech: "Going back to the previous one.",
      },
      catalog,
    );
  }

  if (/\b(portfolio|case stud|show me work|see work|examples for me)\b/.test(lower)) {
    const plan = planCuratedPortfolioTour(catalog, session, [
      { role: "user", content: text, channel: "chat", at: new Date().toISOString() },
    ] as AgentMessage[]);
    if (plan && plan.picks[0]) {
      const names = plan.picks.map((p) => p.title).join(", ");
      return sanitizeNavigatorCommand(
        {
          command: "summarize_card",
          navId: plan.picks[0].navId,
          section: plan.picks[0].navSection,
          speech: `I'll show you ${plan.picks.length} projects matched to you — ${names}. Starting with ${plan.picks[0].title}.`,
          stateUpdate: plan.sessionPatch,
        },
        catalog,
      );
    }
    return sanitizeNavigatorCommand(
      {
        command: "open_portfolio",
        speech: "Opening our portfolio — tell me your business type and I'll pick the best examples.",
      },
      catalog,
    );
  }

  if (
    item &&
    (/\b(live site|visit site|open website|their website|go inside|show me the site|open the project)\b/.test(
      lower,
    ) ||
      (item.navSection === "websites" &&
        /\b(open|show|see|visit|inside)\b/.test(lower)))
  ) {
    return sanitizeNavigatorCommand(
      {
        command: "show_website",
        navId: item.navId,
        section: item.navSection,
        speech: `I'll highlight ${item.title}, then open the live website for you.`,
      },
      catalog,
    );
  }

  if (/\b(open card|open project|details|detail page)\b/.test(lower) && item) {
    const cmd =
      item.navSection === "websites" ? "show_website" : "open_detail";
    return sanitizeNavigatorCommand(
      {
        command: cmd,
        navId: item.navId,
        section: item.navSection,
        speech: `Opening ${item.title} — one moment.`,
      },
      catalog,
    );
  }

  if (/\b(play|video|watch|demo)\b/.test(lower) && item) {
    return sanitizeNavigatorCommand(
      {
        command: item.videoUrl ? "play_video" : "summarize_card",
        navId: item.navId,
        section: item.navSection,
        speech: item.videoUrl
          ? `Playing the ${item.title} showcase.`
          : `${item.title}: ${item.result}. ${item.agentSummary ?? ""}`.trim(),
      },
      catalog,
    );
  }

  if (/\b(summarize|summary|tell me about|explain|highlight)\b/.test(lower) && item) {
    const summary = [item.result, item.agentSummary].filter(Boolean).join(" ");
    return sanitizeNavigatorCommand(
      {
        command: "summarize_card",
        navId: item.navId,
        section: item.navSection,
        speech: summary || `Here's ${item.title} — ${item.result}.`,
      },
      catalog,
    );
  }

  if (/\b(website section|websites)\b/.test(lower)) {
    return sanitizeNavigatorCommand(
      { command: "scroll_to", section: "websites", speech: "Here are our website projects." },
      catalog,
    );
  }

  if (/\b(audit|contact|quote|get started)\b/.test(lower)) {
    return sanitizeNavigatorCommand(
      {
        command: "open_audit",
        speech: "I'll take you to our free audit form — share your name and WhatsApp.",
      },
      catalog,
    );
  }

  if (item) {
    return sanitizeNavigatorCommand(
      {
        command: "summarize_card",
        navId: item.navId,
        section: item.navSection,
        speech: `${item.title}: ${item.result}. ${item.agentSummary ?? ""}`.trim(),
      },
      catalog,
    );
  }

  if (section) {
    return sanitizeNavigatorCommand(
      {
        command: "scroll_to",
        section,
        speech: `Scrolling to our ${section} work.`,
      },
      catalog,
    );
  }

  return sanitizeNavigatorCommand(
    {
      command: "speak_only",
      speech:
        "I'm having a brief connection hiccup — you can still browse the portfolio, or tell me websites, automations, or AI video ads.",
    },
    catalog,
  );
}
