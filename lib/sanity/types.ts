import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";

export type SanityPortfolioDocumentType =
  | "websiteProject"
  | "automationProject"
  | "creativeProject"
  | "portfolioProject";

export type SanityPortfolioRaw = {
  _type?: SanityPortfolioDocumentType | string;
  _id: string;
  _createdAt?: string;
  title: string;
  slug: string;
  serviceType: string;
  automationSubtype?: string | null;
  segment: string;
  subtitle: string;
  tags?: string[] | null;
  resultHeadline?: string | null;
  resultDetail?: string | null;
  cardBg?: string | null;
  heroImage?: SanityImageSource | null;
  thumbnail?: SanityImageSource | null;
  websiteUrl?: string | null;
  websiteDetails?: string | null;
  demoVideoUrl?: string | null;
  videoUrl?: string | null;
  adDescription?: string | null;
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
