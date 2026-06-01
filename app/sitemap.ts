import { SITE_URL } from "@/lib/seo/constants";
import { getBlogSlugs, getPortfolioSlugs } from "@/lib/sanity/fetch";
import type { MetadataRoute } from "next";

/** Refresh sitemap when CMS content changes (see /api/revalidate). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let blogSlugs: string[] = [];
  let portfolioSlugs: string[] = [];

  try {
    [blogSlugs, portfolioSlugs] = await Promise.all([
      getBlogSlugs(),
      getPortfolioSlugs(),
    ]);
  } catch (error) {
    console.error("[sitemap] CMS slug fetch failed:", error);
    return staticPages;
  }

  const portfolioPages: MetadataRoute.Sitemap = portfolioSlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...portfolioPages, ...blogPages];
}
