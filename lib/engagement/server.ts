import { createLeadsClient } from "@/lib/supabase/leads-client";
import type { ContentType, EngagementStatsMap } from "./types";

export async function fetchEngagementStats(
  contentType: ContentType,
  contentIds: string[],
): Promise<EngagementStatsMap> {
  const empty: EngagementStatsMap = {};
  if (contentIds.length === 0) return empty;

  for (const id of contentIds) {
    empty[id] = { likeCount: 0, commentCount: 0 };
  }

  try {
    const supabase = createLeadsClient();

    const [likesRes, commentsRes] = await Promise.all([
      supabase
        .from("content_likes")
        .select("content_id")
        .eq("content_type", contentType)
        .in("content_id", contentIds),
      supabase
        .from("content_comments")
        .select("content_id")
        .eq("content_type", contentType)
        .in("content_id", contentIds),
    ]);

    if (likesRes.error) {
      console.error("[engagement] likes:", likesRes.error.message);
    } else {
      for (const row of likesRes.data ?? []) {
        const id = row.content_id as string;
        if (empty[id]) empty[id].likeCount += 1;
      }
    }

    if (commentsRes.error) {
      console.error("[engagement] comments:", commentsRes.error.message);
    } else {
      for (const row of commentsRes.data ?? []) {
        const id = row.content_id as string;
        if (empty[id]) empty[id].commentCount += 1;
      }
    }

    return empty;
  } catch (error) {
    console.error("[engagement] fetchEngagementStats:", error);
    return empty;
  }
}

export async function visitorHasLiked(
  contentType: ContentType,
  contentId: string,
  visitorId: string,
): Promise<boolean> {
  const supabase = createLeadsClient();
  const { data } = await supabase
    .from("content_likes")
    .select("id")
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("visitor_id", visitorId)
    .maybeSingle();
  return Boolean(data);
}
