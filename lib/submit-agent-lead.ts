import type { AgentMessage, AgentSessionState } from "@/types/agent-state";

const LEAD_ID_KEY = "brandcure-lead-id";

function conversationSummary(messages: AgentMessage[], max = 8): string {
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

export function shouldSyncAgentLead(
  session: AgentSessionState,
  messages: AgentMessage[],
): boolean {
  if (typeof window === "undefined") return false;

  const hasContact = Boolean(session.name?.trim() || session.phone?.trim());
  const hasQualifying =
    session.leadStage === "qualifying" ||
    session.leadStage === "ready" ||
    session.leadStage === "captured";
  const hasBusinessContext =
    Boolean(session.business?.trim()) && session.turnCount >= 2;
  const hasEnoughDialogue = session.turnCount >= 4;

  return (
    hasContact ||
    hasQualifying ||
    hasBusinessContext ||
    hasEnoughDialogue
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
