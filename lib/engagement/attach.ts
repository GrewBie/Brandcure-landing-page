import { fetchEngagementStats } from "./server";
import { rankByEngagement } from "./rank";
import type { ContentType } from "./types";

type WithId = { _id: string; publishedAt?: string; createdAt?: string };

export async function attachEngagementAndRank<T extends WithId>(
  contentType: ContentType,
  items: T[],
): Promise<(T & { likeCount: number; commentCount: number })[]> {
  if (items.length === 0) return [];

  const stats = await fetchEngagementStats(
    contentType,
    items.map((i) => i._id),
  );

  const withStats = items.map((item) => ({
    ...item,
    likeCount: stats[item._id]?.likeCount ?? 0,
    commentCount: stats[item._id]?.commentCount ?? 0,
  }));

  return rankByEngagement(withStats);
}
