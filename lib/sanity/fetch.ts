import { attachEngagementAndRank } from "@/lib/engagement/attach";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "./client";
import {
  mapBlogDetail,
  mapBlogPost,
  mapPortfolio,
  mapPortfolioDetail,
} from "./map";
import {
  blogBySlugQuery,
  blogListQuery,
  blogSlugsQuery,
  portfolioBySlugQuery,
  portfolioListQuery,
  portfolioSlugsQuery,
} from "./queries";
import type { SanityBlogRaw, SanityPortfolioRaw } from "./types";
import type { BlogPost, PortfolioProject } from "@/types/content";

/** Production ISR interval; dev always fetches fresh from Sanity */
export const revalidate = 30;

function fetchOptions(tag: string, extraTag?: string) {
  const tags = extraTag ? [tag, extraTag] : [tag];
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" as const };
  }
  return { next: { revalidate, tags } };
}

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  if (!isSanityConfigured) return [];

  try {
    const rows = await sanityClient.fetch<SanityPortfolioRaw[]>(
      portfolioListQuery,
      {},
      fetchOptions("portfolio"),
    );
    if (!rows?.length) return [];
    const mapped = rows
      .map(mapPortfolio)
      .filter((p): p is PortfolioProject => p !== null);
    return attachEngagementAndRank("portfolio", mapped);
  } catch (error) {
    console.error("[sanity] getPortfolioProjects:", error);
    return [];
  }
}

export async function getPortfolioBySlug(slug: string) {
  if (!isSanityConfigured) return null;

  try {
    const raw = await sanityClient.fetch<SanityPortfolioRaw | null>(
      portfolioBySlugQuery,
      { slug },
      fetchOptions("portfolio", `portfolio:${slug}`),
    );
    if (!raw) return null;
    const project = mapPortfolioDetail(raw);
    if (!project) return null;
    const [ranked] = await attachEngagementAndRank("portfolio", [project]);
    return ranked ?? project;
  } catch (error) {
    console.error("[sanity] getPortfolioBySlug:", error);
    return null;
  }
}

export async function getPortfolioSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return [];

  try {
    const slugs = await sanityClient.fetch<string[]>(portfolioSlugsQuery);
    return slugs?.filter(Boolean) ?? [];
  } catch {
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSanityConfigured) {
    console.warn(
      "[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is missing — blog posts will not load.",
    );
    return [];
  }

  try {
    const rows = await sanityClient.fetch<SanityBlogRaw[]>(
      blogListQuery,
      {},
      fetchOptions("blog"),
    );
    if (!rows?.length) return [];
    const mapped = rows
      .map(mapBlogPost)
      .filter((p): p is BlogPost => p !== null);
    return attachEngagementAndRank("blog", mapped);
  } catch (error) {
    console.error("[sanity] getBlogPosts:", error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  if (!isSanityConfigured) return null;

  try {
    const raw = await sanityClient.fetch<SanityBlogRaw | null>(
      blogBySlugQuery,
      { slug },
      fetchOptions("blog", `blog:${slug}`),
    );
    if (!raw) return null;
    const post = mapBlogDetail(raw);
    if (!post) return null;
    const [ranked] = await attachEngagementAndRank("blog", [post]);
    return ranked ?? post;
  } catch (error) {
    console.error("[sanity] getBlogBySlug:", error);
    return null;
  }
}

export async function getBlogSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return [];

  try {
    const slugs = await sanityClient.fetch<string[]>(blogSlugsQuery);
    return slugs?.filter(Boolean) ?? [];
  } catch {
    return [];
  }
}
