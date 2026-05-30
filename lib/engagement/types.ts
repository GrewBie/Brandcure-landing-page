export type ContentType = "blog" | "portfolio";

export type EngagementStats = {
  likeCount: number;
  commentCount: number;
};

export type EngagementStatsMap = Record<string, EngagementStats>;

export type RankableContent = {
  _id: string;
  publishedAt?: string;
  createdAt?: string;
  likeCount: number;
  commentCount: number;
};
