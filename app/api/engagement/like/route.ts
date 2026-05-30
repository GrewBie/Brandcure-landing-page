import { visitorHasLiked } from "@/lib/engagement/server";
import { createLeadsClient } from "@/lib/supabase/leads-client";
import { contentTypeSchema, likeBodySchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { z } from "zod";

const getQuerySchema = z.object({
  type: contentTypeSchema,
  contentId: z.string().min(1),
  visitorId: z.string().min(8).max(128),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = getQuerySchema.safeParse({
    type: searchParams.get("type"),
    contentId: searchParams.get("contentId"),
    visitorId: searchParams.get("visitorId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const liked = await visitorHasLiked(
    parsed.data.type,
    parsed.data.contentId,
    parsed.data.visitorId,
  );

  return NextResponse.json({ liked });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = likeBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { contentType, contentId, visitorId } = parsed.data;
    const supabase = createLeadsClient();

    const alreadyLiked = await visitorHasLiked(
      contentType,
      contentId,
      visitorId,
    );

    if (alreadyLiked) {
      const { error } = await supabase
        .from("content_likes")
        .delete()
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .eq("visitor_id", visitorId);

      if (error) {
        console.error("[engagement] unlike:", error.message);
        return NextResponse.json({ error: "Could not unlike" }, { status: 500 });
      }

      return NextResponse.json({ liked: false });
    }

    const { error } = await supabase.from("content_likes").insert({
      content_type: contentType,
      content_id: contentId,
      visitor_id: visitorId,
    });

    if (error) {
      console.error("[engagement] like:", error.message);
      return NextResponse.json({ error: "Could not like" }, { status: 500 });
    }

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("[engagement] like route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
