import { DEFAULT_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { buildChatSystemPrompt } from "@/lib/agent-prompts";
import { createDefaultSession } from "@/lib/agent-state";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { AgentMessage, AgentSessionState, AgentStatePatch } from "@/types/agent-state";
import type { NavItem } from "@/types/navigator";
import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };
type RequestBody = {
  messages?: ChatMessage[];
  catalog?: NavItem[];
  session?: AgentSessionState;
};

const FALLBACK_CONTENT =
  "Thanks for reaching out! Our AI advisor needs a quick setup to go live. In the meantime, request a free audit via the contact form or WhatsApp us at +91 88389 24425.";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`chat:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        content:
          "You're sending messages quickly — give me a few seconds and try again.",
      },
      { status: 429 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const catalog = Array.isArray(body.catalog) ? body.catalog : [];
  const session = body.session
    ? { ...createDefaultSession(), ...body.session }
    : createDefaultSession();

  if (messages.length === 0) {
    return NextResponse.json({ content: FALLBACK_CONTENT });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ content: FALLBACK_CONTENT });
  }

  try {
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 700,
      system: buildChatSystemPrompt(
        catalog,
        session,
        messages.map((m) => ({
          ...m,
          channel: "chat" as const,
          at: new Date().toISOString(),
        })) as AgentMessage[],
      ),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const raw = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    const stateUpdate = extractStateUpdate(raw);
    const content =
      stripStateTag(raw).trim() || FALLBACK_CONTENT;

    return NextResponse.json({
      content,
      stateUpdate: stateUpdate as AgentStatePatch,
    });
  } catch (error) {
    console.error("[chat] Anthropic error:", error);
    return NextResponse.json({ content: FALLBACK_CONTENT });
  }
}

function extractStateUpdate(raw: string): AgentStatePatch {
  const match = raw.match(/\[STATE:([^\]]+)\]/);
  if (!match?.[1]) return {};
  try {
    const parsed = JSON.parse(match[1]) as AgentStatePatch;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function stripStateTag(raw: string): string {
  return raw.replace(/\[STATE:[^\]]+\]/g, "").trim();
}
