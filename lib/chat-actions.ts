import type { AgentStatePatch } from "@/types/agent-state";

export type ChatActionType =
  | "scroll_to"
  | "highlight"
  | "play_video"
  | "suggest_video"
  | "open_portfolio"
  | "dismiss_spotlight"
  | "open_voice"
  | "open_audit"
  | "capture_lead"
  | "prefill_whatsapp"
  | "open_detail"
  | "open_website"
  | "summarize_card";

export type ChatAction = {
  type: ChatActionType;
  arg?: string;
};

const KNOWN: ChatActionType[] = [
  "scroll_to",
  "highlight",
  "play_video",
  "suggest_video",
  "open_portfolio",
  "dismiss_spotlight",
  "open_voice",
  "open_audit",
  "capture_lead",
  "prefill_whatsapp",
  "open_detail",
  "open_website",
  "summarize_card",
];

const ACTION_RE = /\[ACTION:([^\]]+)\]/g;
const STATE_RE = /\[STATE:([^\]]+)\]/g;

/** Extracts [ACTION:...] and [STATE:...] tags; returns clean user-facing text. */
export function parseAgentResponse(raw: string): {
  clean: string;
  actions: ChatAction[];
  stateUpdate: AgentStatePatch;
} {
  const { clean: afterActions, actions } = parseActions(raw);
  const stateUpdate = parseStateTags(afterActions);
  const clean = afterActions.replace(STATE_RE, "").replace(/[ \t]+\n/g, "\n").trim();
  return { clean, actions, stateUpdate };
}

function parseStateTags(raw: string): AgentStatePatch {
  const match = STATE_RE.exec(raw);
  STATE_RE.lastIndex = 0;
  if (!match?.[1]) return {};
  try {
    const parsed = JSON.parse(match[1]) as AgentStatePatch;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** @deprecated use parseAgentResponse */
export function parseActions(raw: string): {
  clean: string;
  actions: ChatAction[];
} {
  const actions: ChatAction[] = [];
  let match: RegExpExecArray | null;

  ACTION_RE.lastIndex = 0;
  while ((match = ACTION_RE.exec(raw)) !== null) {
    const payload = match[1]?.trim() ?? "";
    const sep = payload.indexOf(":");
    const type = (sep === -1 ? payload : payload.slice(0, sep)).trim();
    const arg = sep === -1 ? undefined : payload.slice(sep + 1).trim();
    if (KNOWN.includes(type as ChatActionType)) {
      actions.push({ type: type as ChatActionType, arg: arg || undefined });
    }
  }

  const clean = raw.replace(ACTION_RE, "").replace(/[ \t]+\n/g, "\n").trim();
  return { clean, actions };
}
