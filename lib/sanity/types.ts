import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";

export type SanityPortfolioRaw = {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: string;
  serviceType: string;
  automationSubtype?: string | null;
  segment: string;
  subtitle: string;
  tags?: string[] | null;
  resultHeadline: string;
  resultDetail: string;
  cardBg?: string | null;
  heroImage?: SanityImageSource | null;
  websiteUrl?: string | null;
  demoVideoUrl?: string | null;
  adVideos?:
    | {
        title?: string | null;
        videoUrl?: string | null;
        thumbnail?: SanityImageSource | null;
      }[]
    | null;
  body?: PortableTextBlock[] | null;
};

export type SanityBlogRaw = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: number;
  publishedAt: string;
  coverImage?: SanityImageSource | null;
  body?: PortableTextBlock[] | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageSource | null;
  } | null;
};
