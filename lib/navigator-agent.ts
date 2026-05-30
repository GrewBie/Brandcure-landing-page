import type {
  AgentSessionState,
  AgentStatePatch,
} from "@/types/agent-state";
import type {
  NavItem,
  NavigatorCommand,
  NavigatorMessage,
} from "@/types/navigator";
import { toApiMessages } from "@/lib/agent-state";
import type { AgentMessage } from "@/types/agent-state";

/** Compact catalog sent to the API (drops keywords to keep payload small). */
function compactCatalog(catalog: NavItem[]): NavItem[] {
  return catalog.map((item) => ({ ...item, keywords: [] }));
}

const FALLBACK: NavigatorCommand = {
  command: "speak_only",
  speech: "I couldn't reach the navigator just now — please try again.",
};

export async function classifyAndCommand(
  messages: AgentMessage[] | NavigatorMessage[],
  session: AgentSessionState,
  catalog: NavItem[],
): Promise<NavigatorCommand> {
  try {
    const res = await fetch("/api/navigator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: toApiMessages(messages as AgentMessage[]),
        session,
        catalog: compactCatalog(catalog),
      }),
    });

    const data = (await res.json()) as Partial<NavigatorCommand>;
    if (!data || typeof data.command !== "string" || !data.speech) {
      return FALLBACK;
    }
    return data as NavigatorCommand;
  } catch {
    return FALLBACK;
  }
}

export type ChatApiResponse = {
  content?: string;
  stateUpdate?: AgentStatePatch;
};

export async function sendChatMessage(
  messages: AgentMessage[],
  session: AgentSessionState,
  catalog: NavItem[],
): Promise<ChatApiResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: toApiMessages(messages),
        session,
        catalog: compactCatalog(catalog),
      }),
    });
    if (!res.ok) throw new Error("API error");
    return (await res.json()) as ChatApiResponse;
  } catch {
    return {
      content:
        "Connection issue — WhatsApp us or request a free audit via the contact form.",
    };
  }
}
