import { DEFAULT_MODEL, getAnthropicClient } from "@/lib/anthropic";
import { buildNavigatorSystemPrompt } from "@/lib/agent-prompts";
import { sanitizeNavigatorCommand } from "@/lib/agent-guardrails";
import { createDefaultSession } from "@/lib/agent-state";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { AgentMessage, AgentSessionState, AgentStatePatch } from "@/types/agent-state";
import type {
  NavItem,
  NavigatorCommand,
  NavigatorCommandType,
  NavigatorMessage,
  NavigatorSection,
} from "@/types/navigator";
import { NextResponse } from "next/server";

const COMMAND_TYPES: NavigatorCommandType[] = [
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
];

const SECTIONS: NavigatorSection[] = ["creatives", "automations", "websites"];

type RequestBody = {
  messages?: NavigatorMessage[];
  session?: AgentSessionState;
  catalog?: NavItem[];
};

function safeFallback(speech: string): NavigatorCommand {
  return { command: "speak_only", speech };
}

function parseCommand(text: string): NavigatorCommand | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as Partial<
      NavigatorCommand & { stateUpdate?: AgentStatePatch }
    >;
    if (!obj.command || !COMMAND_TYPES.includes(obj.command)) return null;
    const command: NavigatorCommand = {
      command: obj.command,
      speech:
        typeof obj.speech === "string" && obj.speech.trim()
          ? obj.speech.trim()
          : "Done.",
    };
    if (obj.section && SECTIONS.includes(obj.section)) {
      command.section = obj.section;
    }
    if (typeof obj.navId === "string" && obj.navId.trim()) {
      command.navId = obj.navId.trim();
    }
    if (typeof obj.industry === "string" && obj.industry.trim()) {
      command.industry = obj.industry.trim();
    }
    if (obj.stateUpdate && typeof obj.stateUpdate === "object") {
      command.stateUpdate = obj.stateUpdate;
    }
    return command;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`navigator:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      safeFallback("You're going a bit fast — give me a moment and try again."),
      { status: 429 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(safeFallback("Sorry, I didn't catch that."), {
      status: 400,
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const catalog = Array.isArray(body.catalog) ? body.catalog : [];
  const session: AgentSessionState = body.session
    ? { ...createDefaultSession(), ...body.session }
    : createDefaultSession();

  if (messages.length === 0) {
    return NextResponse.json(
      safeFallback("Tell me what you'd like to see."),
    );
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(
      safeFallback(
        "Voice navigation needs an API key to be configured. You can still browse and use the filters.",
      ),
    );
  }

  try {
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 650,
      system: buildNavigatorSystemPrompt(
        catalog,
        session,
        messages.map((m) => ({
          ...m,
          channel: "chat" as const,
          at: new Date().toISOString(),
        })) as AgentMessage[],
      ),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n");

    const parsed =
      parseCommand(text) ??
      safeFallback("I'm not sure how to help with that — could you rephrase?");

    const command = sanitizeNavigatorCommand(parsed, catalog);

    return NextResponse.json(command);
  } catch (error) {
    console.error("[navigator] Anthropic error:", error);
    return NextResponse.json(
      safeFallback("I hit a snag — please try that again."),
    );
  }
}
