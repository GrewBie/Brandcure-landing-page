import { fetchEngagementStats } from "@/lib/engagement/server";
import type { ContentType } from "@/lib/engagement/types";
import { contentTypeSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  type: contentTypeSchema,
  ids: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    type: searchParams.get("type"),
    ids: searchParams.get("ids"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const ids = parsed.data.ids.split(",").filter(Boolean).slice(0, 100);
  const stats = await fetchEngagementStats(
    parsed.data.type as ContentType,
    ids,
  );

  return NextResponse.json({ stats });
}
