import type {
  AgentMessage,
  AgentSessionState,
  AgentStatePatch,
} from "@/types/agent-state";
import type { NavigatorCommand, NavigatorSection } from "@/types/navigator";

const STORAGE_KEY = "brandcure-agent-session";
const MESSAGES_KEY = "brandcure-agent-messages";
const MAX_MESSAGES = 24;

export function createDefaultSession(): AgentSessionState {
  return {
    leadStage: "browsing",
    interest: "unknown",
    currentItemIndex: 0,
    turnCount: 0,
    lastActiveAt: new Date().toISOString(),
  };
}

export function mergeSessionState(
  current: AgentSessionState,
  patch: AgentStatePatch | undefined,
): AgentSessionState {
  if (!patch || Object.keys(patch).length === 0) return current;
  return {
    ...current,
    ...patch,
    turnCount: current.turnCount,
    lastActiveAt: current.lastActiveAt,
  };
}

/** Apply navigation side-effects and inferred memory from a voice command. */
export function sessionFromNavigatorCommand(
  session: AgentSessionState,
  command: NavigatorCommand,
  catalogTitle?: string,
): AgentSessionState {
  const next: AgentSessionState = { ...session };

  if (command.section) next.currentSection = command.section;
  if (command.navId) {
    next.lastProjectNavId = command.navId;
    if (catalogTitle) next.lastProjectTitle = catalogTitle;
  }
  if (command.industry) next.activeIndustryFilter = command.industry;
  if (command.command === "capture_lead") next.leadStage = "ready";
  if (command.command === "open_audit") {
    next.leadStage = next.leadStage === "captured" ? "captured" : "ready";
  }
  if (
    command.command === "scroll_to" ||
    command.command === "highlight" ||
    command.command === "play_video"
  ) {
    if (next.leadStage === "browsing") next.leadStage = "exploring";
  }

  if (
    command.navId &&
    (command.command === "highlight" || command.command === "play_video")
  ) {
    const presented = new Set(next.presentedNavIds ?? []);
    if (!presented.has(command.navId)) {
      presented.add(command.navId);
      next.presentedNavIds = Array.from(presented);
      next.projectsPresentedCount = (next.projectsPresentedCount ?? 0) + 1;
    }
  }

  return next;
}

export function bumpTurn(session: AgentSessionState): AgentSessionState {
  return {
    ...session,
    turnCount: session.turnCount + 1,
    lastActiveAt: new Date().toISOString(),
  };
}

/** Compact block injected into Anthropic system prompts. */
export function sessionToPromptBlock(session: AgentSessionState): string {
  const lines: string[] = [
    "SESSION MEMORY (use naturally — never re-ask what you already know):",
    `- Lead stage: ${session.leadStage}`,
    `- Turn count: ${session.turnCount}`,
  ];

  if (session.name) lines.push(`- Name: ${session.name}`);
  if (session.phone) lines.push(`- Phone/WhatsApp: ${session.phone}`);
  if (session.business) lines.push(`- Business: ${session.business}`);
  if (session.city) lines.push(`- City: ${session.city}`);
  if (session.challenge) lines.push(`- Challenge/goal: ${session.challenge}`);
  if (session.interest && session.interest !== "unknown") {
    lines.push(`- Primary interest: ${session.interest}`);
  }
  if (session.lastProjectTitle) {
    lines.push(`- Last project discussed: ${session.lastProjectTitle} (${session.lastProjectNavId})`);
  }
  if (session.projectsPresentedCount) {
    lines.push(`- Case studies shown this session: ${session.projectsPresentedCount}`);
  }
  if (session.presentedNavIds?.length) {
    lines.push(`- Already presented navIds: ${session.presentedNavIds.join(", ")}`);
  }
  if (session.currentSection) {
    lines.push(`- Currently viewing section: ${session.currentSection} (item index ${session.currentItemIndex})`);
  }
  if (session.activeIndustryFilter) {
    lines.push(`- Website filter: ${session.activeIndustryFilter}`);
  }

  lines.push(
    "",
    "Conversation style:",
    "- Sound like a sharp, warm human advisor — not a bot.",
    "- Reference earlier details naturally (e.g. \"Since you run a D2C brand in Chennai…\").",
    "- Never repeat a question the user already answered.",
    "- One follow-up question at a time when qualifying.",
    "- Short sentences; 2–4 sentences max unless explaining a case study.",
  );

  return lines.join("\n");
}

export function inferInterestFromText(
  text: string,
): NavigatorSection | undefined {
  const t = text.toLowerCase();
  if (/website|landing|ecommerce|web design|site/.test(t)) return "websites";
  if (/automat|agent|workflow|whatsapp bot|crm|integration/.test(t)) {
    return "automations";
  }
  if (/video ad|creative|reel|ugc|commercial|ai ad/.test(t)) return "creatives";
  return undefined;
}

export function patchFromUserText(text: string): AgentStatePatch {
  const patch: AgentStatePatch = {};
  const interest = inferInterestFromText(text);
  if (interest) patch.interest = interest;

  const cityMatch = text.match(
    /\b(?:in|from|based in|located in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
  );
  if (cityMatch?.[1]) patch.city = cityMatch[1];

  const nameMatch = text.match(
    /\b(?:i am|i'm|my name is|this is|call me)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)?)/i,
  );
  if (nameMatch?.[1]) patch.name = nameMatch[1].trim();

  const phoneMatch = text.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{10}\b|whatsapp[\s:]*([+\d\s-]{10,})/i,
  );
  if (phoneMatch) {
    const raw = (phoneMatch[1] ?? phoneMatch[0]).replace(/[^\d+]/g, "");
    if (raw.length >= 10) patch.phone = raw.startsWith("+") ? raw : `+91${raw.slice(-10)}`;
  }

  const bizPhrase = text.match(
    /\b(?:i(?:'m| am)|we(?:'re| are)|my business is|we run|i run|i own|we own|we have a|i have a|it's a|it is a)\s+(?:a |an |the )?([^.,!?]{3,72})/i,
  );
  if (bizPhrase?.[1]) {
    patch.business = bizPhrase[1].trim();
  } else if (/restaurant|cafe|salon|clinic|d2c|startup|ecommerce|shop|store|brand|agency|clinic|hospital|gym|studio/i.test(text)) {
    const biz = text.match(
      /\b([\w\s]{0,30}(?:restaurant|cafe|salon|clinic|d2c|startup|ecommerce|shop|store|brand|agency|clinic|hospital|gym|studio)[\w\s]{0,20})/i,
    );
    if (biz?.[1]) patch.business = biz[1].trim().slice(0, 80);
  }

  if (patch.business || patch.name || patch.phone) {
    patch.leadStage = "qualifying";
  } else if (sessionLooksQualifying(text)) {
    patch.leadStage = "qualifying";
  }

  return patch;
}

function sessionLooksQualifying(text: string): boolean {
  return /business|company|brand|run a|we are|i am a|looking for|need help|want to/i.test(
    text,
  );
}

export function loadSession(): AgentSessionState {
  if (typeof window === "undefined") return createDefaultSession();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSession();
    const parsed = JSON.parse(raw) as AgentSessionState;
    return { ...createDefaultSession(), ...parsed };
  } catch {
    return createDefaultSession();
  }
}

export function saveSession(session: AgentSessionState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* quota / private mode */
  }
}

export function loadMessages(): AgentMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AgentMessage[];
  } catch {
    return [];
  }
}

export function saveMessages(messages: AgentMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      MESSAGES_KEY,
      JSON.stringify(messages.slice(-MAX_MESSAGES)),
    );
  } catch {
    /* ignore */
  }
}

export function toApiMessages(
  messages: AgentMessage[],
): { role: "user" | "assistant"; content: string }[] {
  return messages.map(({ role, content }) => ({ role, content }));
}
