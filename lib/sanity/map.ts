import {
  AUTOMATION_SUBTYPE_LABEL,
  SEGMENT_LABEL,
  SERVICE_TYPE_LABEL,
} from "@/lib/content/portfolio-labels";
import { imageUrl } from "@/lib/sanity/image";
import type { SanityBlogRaw, SanityPortfolioRaw } from "@/lib/sanity/types";
import { getVideoProvider } from "@/lib/video/embed";
import type {
  BlogCategory,
  BlogPost,
  PortfolioAdVideo,
  PortfolioAutomationSubtype,
  PortfolioProject,
  PortfolioSegment,
  PortfolioServiceType,
} from "@/types/content";

const SERVICE_TYPES: PortfolioServiceType[] = [
  "automation",
  "websites",
  "ai-ads",
];
const SEGMENTS: PortfolioSegment[] = ["smb", "startup", "d2c", "global"];
const AUTOMATION_SUBTYPES: PortfolioAutomationSubtype[] = [
  "ai-automation",
  "agentic-automation",
];

const BLOG_CATEGORIES: BlogCategory[] = [
  "Insights",
  "Automation",
  "Case Study",
  "Strategy",
  "AI & Tech",
];

function resolveServiceType(raw: SanityPortfolioRaw): PortfolioServiceType | null {
  if (SERVICE_TYPES.includes(raw.serviceType as PortfolioServiceType)) {
    return raw.serviceType as PortfolioServiceType;
  }
  return null;
}

function resolveHeroImageUrl(raw: SanityPortfolioRaw): string | null {
  return (
    imageUrl(raw.heroImage, 800) ||
    imageUrl(raw.thumbnail, 800) ||
    null
  );
}

function normalizeCopy(
  raw: SanityPortfolioRaw,
  serviceType: PortfolioServiceType,
): { resultHeadline: string; resultDetail: string } {
  const websiteDetails = raw.websiteDetails?.trim();
  const adDescription = raw.adDescription?.trim();
  const resultHeadline = raw.resultHeadline?.trim();
  const resultDetail = raw.resultDetail?.trim();

  if (serviceType === "websites") {
    return {
      resultHeadline: resultHeadline || raw.subtitle?.trim() || "Live website",
      resultDetail: websiteDetails || resultDetail || "",
    };
  }

  if (serviceType === "ai-ads") {
    return {
      resultHeadline: resultHeadline || raw.title?.trim() || "AI video ad",
      resultDetail: adDescription || resultDetail || "",
    };
  }

  return {
    resultHeadline: resultHeadline || raw.title?.trim() || "Automation",
    resultDetail: resultDetail || "",
  };
}

export function mapPortfolio(
  raw: SanityPortfolioRaw,
): PortfolioProject | null {
  const serviceType = resolveServiceType(raw);
  if (!serviceType) return null;
  if (!SEGMENTS.includes(raw.segment as PortfolioSegment)) return null;

  const heroImageUrl = resolveHeroImageUrl(raw);
  if (!heroImageUrl) return null;

  const segment = raw.segment as PortfolioSegment;
  const automationSubtype = AUTOMATION_SUBTYPES.includes(
    raw.automationSubtype as PortfolioAutomationSubtype,
  )
    ? (raw.automationSubtype as PortfolioAutomationSubtype)
    : undefined;

  const tags = (raw.tags ?? []).map((t) => t.trim()).filter(Boolean);
  const adVideos = mapAdVideos(raw, serviceType);
  const websiteUrl = raw.websiteUrl?.trim() || undefined;
  const demoVideoUrl = raw.demoVideoUrl?.trim() || undefined;
  const websiteDetails = raw.websiteDetails?.trim() || undefined;
  const adDescription = raw.adDescription?.trim() || undefined;

  const { resultHeadline, resultDetail } = normalizeCopy(raw, serviceType);

  const previewVideoUrl =
    serviceType === "ai-ads"
      ? raw.videoUrl?.trim() || adVideos[0]?.videoUrl
      : serviceType === "automation"
        ? demoVideoUrl
        : undefined;

  return {
    _id: raw._id,
    createdAt: raw._createdAt,
    likeCount: 0,
    commentCount: 0,
    title: raw.title,
    slug: raw.slug,
    serviceType,
    serviceTypeLabel: SERVICE_TYPE_LABEL[serviceType],
    automationSubtype:
      serviceType === "automation" ? automationSubtype : undefined,
    automationSubtypeLabel:
      serviceType === "automation" && automationSubtype
        ? AUTOMATION_SUBTYPE_LABEL[automationSubtype]
        : undefined,
    segment,
    segmentLabel: SEGMENT_LABEL[segment],
    subtitle: raw.subtitle,
    tags,
    resultHeadline,
    resultDetail,
    cardBg: raw.cardBg?.trim() || "#F5F0E8",
    heroImageUrl,
    websiteUrl,
    websiteDetails,
    demoVideoUrl,
    adDescription,
    adVideos: adVideos.length > 0 ? adVideos : undefined,
    previewVideoUrl,
    previewVideoType: previewVideoUrl
      ? getVideoProvider(previewVideoUrl)
      : undefined,
  };
}

function mapAdVideos(
  raw: SanityPortfolioRaw,
  serviceType: PortfolioServiceType,
): PortfolioAdVideo[] {
  if (serviceType === "ai-ads" && raw._type === "creativeProject") {
    const videoUrl = raw.videoUrl?.trim();
    if (!videoUrl) return [];
    return [
      {
        title: raw.title?.trim() || "Ad creative",
        videoUrl,
        thumbnailUrl: imageUrl(raw.thumbnail, 800) || undefined,
      },
    ];
  }

  if (!raw.adVideos?.length) return [];
  const result: PortfolioAdVideo[] = [];
  for (const item of raw.adVideos) {
    const videoUrl = item?.videoUrl?.trim();
    const title = item?.title?.trim();
    if (!videoUrl) continue;
    result.push({
      title: title || "Ad creative",
      videoUrl,
      thumbnailUrl: imageUrl(item?.thumbnail, 800) || undefined,
    });
  }
  return result;
}

export function mapBlogPost(raw: SanityBlogRaw): BlogPost | null {
  const coverImageUrl = imageUrl(raw.coverImage, 1200);
  if (!coverImageUrl) return null;

  const category = BLOG_CATEGORIES.includes(raw.category as BlogCategory)
    ? (raw.category as BlogCategory)
    : "Insights";

  return {
    _id: raw._id,
    likeCount: 0,
    commentCount: 0,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    category,
    readTime: raw.readTime,
    publishedAt: raw.publishedAt,
    coverImageUrl,
  };
}

export type BlogPostDetail = BlogPost & {
  body: SanityBlogRaw["body"];
};

export type PortfolioDetail = PortfolioProject & {
  body: SanityPortfolioRaw["body"];
};

export function mapBlogDetail(raw: SanityBlogRaw): BlogPostDetail | null {
  const post = mapBlogPost(raw);
  if (!post) return null;
  return { ...post, body: raw.body ?? [] };
}

export function mapPortfolioDetail(
  raw: SanityPortfolioRaw,
): PortfolioDetail | null {
  const project = mapPortfolio(raw);
  if (!project) return null;
  return { ...project, body: raw.body ?? [] };
}
