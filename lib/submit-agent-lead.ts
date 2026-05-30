import type { AgentMessage, AgentSessionState } from "@/types/agent-state";

const LEAD_ID_KEY = "brandcure-lead-id";

function conversationSummary(messages: AgentMessage[], max = 12): string {
  return messages
    .slice(-max)
    .map((m) => `${m.role === "user" ? "Visitor" : "Neha"}: ${m.content}`)
    .join("\n");
}

function buildPayload(
  session: AgentSessionState,
  messages: AgentMessage[],
  source: "voice" | "chat",
) {
  return {
    source,
    name: session.name?.trim() || "Portfolio visitor",
    whatsapp: session.phone?.trim() || undefined,
    email: "",
    business:
      session.business?.trim() ||
      (source === "voice"
        ? "Enquiry via AI portfolio tour (Neha)"
        : "Enquiry via AI chat"),
    city: session.city?.trim(),
    challenge: session.challenge?.trim(),
    interest: session.interest,
    transcriptSummary: conversationSummary(messages),
    lastProjectTitle: session.lastProjectTitle,
  };
}

/** Fingerprint for deduping rapid session updates. */
export function leadSyncFingerprint(session: AgentSessionState): string {
  return [
    session.name ?? "",
    session.phone ?? "",
    session.business ?? "",
    session.city ?? "",
    session.challenge ?? "",
    session.leadStage ?? "",
    String(session.turnCount),
  ].join("|");
}

/** Enough dialogue to store anything meaningful. */
export function shouldSyncAgentLead(
  session: AgentSessionState,
  messages: AgentMessage[],
): boolean {
  if (typeof window === "undefined") return false;
  if (!messages.some((m) => m.role === "user")) return false;

  const hasContact = Boolean(session.name?.trim() || session.phone?.trim());
  const hasBusiness = Boolean(session.business?.trim());
  const hasQualifying =
    session.leadStage === "qualifying" ||
    session.leadStage === "ready" ||
    session.leadStage === "captured";

  return hasContact || hasBusiness || hasQualifying || session.turnCount >= 2;
}

/** Name, business, or phone captured — notify team right away. */
export function shouldSyncAgentLeadImmediately(
  session: AgentSessionState,
  messages: AgentMessage[],
): boolean {
  if (!shouldSyncAgentLead(session, messages)) return false;
  return (
    Boolean(session.business?.trim()) ||
    Boolean(session.name?.trim()) ||
    Boolean(session.phone?.trim())
  );
}

export async function submitAgentLead(
  session: AgentSessionState,
  messages: AgentMessage[],
  source: "voice" | "chat",
): Promise<boolean> {
  if (!shouldSyncAgentLead(session, messages)) return false;

  const existingId =
    typeof window !== "undefined"
      ? sessionStorage.getItem(LEAD_ID_KEY)
      : null;

  const payload = buildPayload(session, messages, source);

  const res = await fetch("/api/leads", {
    method: existingId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      existingId ? { id: existingId, ...payload } : payload,
    ),
  });

  if (!res.ok) return false;

  const data = (await res.json()) as { id?: string };
  if (typeof window !== "undefined" && data.id) {
    sessionStorage.setItem(LEAD_ID_KEY, data.id);
  }
  return true;
}
