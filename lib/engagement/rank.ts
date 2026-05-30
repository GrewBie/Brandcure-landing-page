import type { RankableContent } from "./types";

/** Days after publish when a post still gets a "new" ranking boost */
const NEW_CONTENT_DAYS = 14;
const NEW_BOOST_MAX = 12;
const LIKE_WEIGHT = 2;
const COMMENT_WEIGHT = 3;

function daysSince(iso: string | undefined): number {
  if (!iso) return 999;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function engagementScore(item: RankableContent): number {
  const engagement =
    item.likeCount * LIKE_WEIGHT + item.commentCount * COMMENT_WEIGHT;
  const date = item.publishedAt ?? item.createdAt;
  const age = daysSince(date);
  const newBoost =
    age <= NEW_CONTENT_DAYS ? Math.max(0, NEW_BOOST_MAX - age) : 0;
  return engagement + newBoost;
}

export function rankByEngagement<T extends RankableContent>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const scoreDiff = engagementScore(b) - engagementScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    const dateA = a.publishedAt ?? a.createdAt ?? "";
    const dateB = b.publishedAt ?? b.createdAt ?? "";
    return dateB.localeCompare(dateA);
  });
}

export function isNewContent(iso: string | undefined): boolean {
  return daysSince(iso) <= NEW_CONTENT_DAYS;
}
