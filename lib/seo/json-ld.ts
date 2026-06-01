import { HOME_META_DESCRIPTION } from "@/lib/seo/descriptions";
import { globalSchemaGraph } from "@/lib/seo/schema";
import { SITE_NAME, SITE_URL } from "@/lib/seo/constants";
import type { BlogPost, PortfolioProject } from "@/types/content";

type JsonLd = Record<string, unknown>;

export { globalSchemaGraph } from "@/lib/seo/schema";

export function webPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function blogPostingJsonLd(post: BlogPost, slug: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: post.coverImageUrl,
    url: `${SITE_URL}/blog/${slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    articleSection: post.category,
    inLanguage: "en-IN",
  };
}

export function creativeWorkJsonLd(
  project: PortfolioProject,
  slug: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.resultDetail || project.subtitle,
    image: project.heroImageUrl,
    url: `${SITE_URL}/portfolio/${slug}`,
    creator: { "@id": `${SITE_URL}/#organization` },
    keywords: project.tags.join(", "),
    inLanguage: "en-IN",
  };
}

/** Homepage graph — global schema + home WebPage. */
export function homePageJsonLdGraph(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...(globalSchemaGraph()["@graph"] as JsonLd[]),
      webPageJsonLd({
        name: `${SITE_NAME} — Home`,
        description: HOME_META_DESCRIPTION,
        path: "/",
      }),
    ],
  };
}
