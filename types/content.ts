/** Shapes aligned with Sanity schemas — ready for GROQ swap-in. */

export type BlogCategory =
  | "Insights"
  | "Automation"
  | "Case Study"
  | "Strategy"
  | "AI & Tech";

/** Primary portfolio pillar (CMS: serviceType) */
export type PortfolioServiceType = "automation" | "websites" | "ai-ads";

/** Optional refinement when serviceType is automation */
export type PortfolioAutomationSubtype =
  | "ai-automation"
  | "agentic-automation";

/** Client segment (CMS: segment) */
export type PortfolioSegment = "smb" | "startup" | "d2c" | "global";

export interface ContentEngagement {
  likeCount: number;
  commentCount: number;
}

export interface BlogPost extends ContentEngagement {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  readTime: number;
  publishedAt: string;
  coverImageUrl: string;
}

export interface PortfolioProject extends ContentEngagement {
  _id: string;
  title: string;
  slug: string;
  /** ISO date from Sanity _createdAt — used for “new” ranking */
  createdAt?: string;
  serviceType: PortfolioServiceType;
  serviceTypeLabel: string;
  automationSubtype?: PortfolioAutomationSubtype;
  automationSubtypeLabel?: string;
  segment: PortfolioSegment;
  segmentLabel: string;
  subtitle: string;
  tags: string[];
  resultHeadline: string;
  resultDetail: string;
  heroImageUrl: string;
  cardBg: string;
  /** Live site URL (websites projects). */
  websiteUrl?: string;
  /** Site description (websiteProject CMS type). */
  websiteDetails?: string;
  /** Single demo video URL (automation projects). */
  demoVideoUrl?: string;
  /** Ad copy (creativeProject CMS type). */
  adDescription?: string;
  /** Ad creatives (ai-ads projects). */
  adVideos?: PortfolioAdVideo[];
  /** Best preview video URL across the project's media, if any. */
  previewVideoUrl?: string;
  previewVideoType?: import("@/lib/video/embed").VideoProvider;
}

export interface PortfolioAdVideo {
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface SiteSettings {
  contactEmail: string;
  whatsappNumber: string;
  whatsappDisplay: string;
}
