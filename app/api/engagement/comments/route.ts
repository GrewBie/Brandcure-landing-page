import { createLeadsClient } from "@/lib/supabase/leads-client";
import { commentBodySchema, contentTypeSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { z } from "zod";

const listQuerySchema = z.object({
  type: contentTypeSchema,
  contentId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    type: searchParams.get("type"),
    contentId: searchParams.get("contentId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const supabase = createLeadsClient();
  const { data, error } = await supabase
    .from("content_comments")
    .select("id, author_name, body, created_at")
    .eq("content_type", parsed.data.type)
    .eq("content_id", parsed.data.contentId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[engagement] list comments:", error.message);
    return NextResponse.json({ error: "Could not load comments" }, { status: 500 });
  }

  return NextResponse.json({
    comments: (data ?? []).map((row) => ({
      id: row.id,
      authorName: row.author_name,
      body: row.body,
      createdAt: row.created_at,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = commentBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid comment", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { contentType, contentId, authorName, body: text } = parsed.data;
    const supabase = createLeadsClient();

    const { data, error } = await supabase
      .from("content_comments")
      .insert({
        content_type: contentType,
        content_id: contentId,
        author_name: authorName.trim(),
        body: text.trim(),
      })
      .select("id, author_name, body, created_at")
      .single();

    if (error) {
      console.error("[engagement] post comment:", error.message);
      return NextResponse.json({ error: "Could not post comment" }, { status: 500 });
    }

    return NextResponse.json({
      comment: {
        id: data.id,
        authorName: data.author_name,
        body: data.body,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("[engagement] comments POST:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
