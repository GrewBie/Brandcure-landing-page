import { isElevenLabsConfigured } from "@/lib/elevenlabs/config";
import { synthesizeElevenLabsSpeech } from "@/lib/elevenlabs/synthesize";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

type RequestBody = { text?: string };

export async function GET() {
  return NextResponse.json({
    provider: "elevenlabs",
    configured: isElevenLabsConfigured(),
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`tts:${ip}`, 40, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      {
        error: "ElevenLabs TTS not configured",
        hint: "Set ELEVENLABS_API_KEY in .env.local",
      },
      { status: 503 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await synthesizeElevenLabsSpeech(body.text ?? "");
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  return new Response(result.audio, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "no-store",
      "X-TTS-Provider": "elevenlabs",
    },
  });
}
