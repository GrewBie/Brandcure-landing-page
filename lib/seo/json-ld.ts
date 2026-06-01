import { HOME_META_DESCRIPTION } from "@/lib/seo/descriptions";
import { BRANDCURE_FAQ } from "@/lib/seo/faq";
import {
  ORGANIZATION,
  SERVICES_FOR_SCHEMA,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo/constants";
import type { BlogPost, PortfolioProject } from "@/types/content";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION.name,
    url: SITE_URL,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    description: SITE_TAGLINE,
    address: {
      "@type": "PostalAddress",
      addressLocality: ORGANIZATION.address.addressLocality,
      addressRegion: ORGANIZATION.address.addressRegion,
      addressCountry: ORGANIZATION.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORGANIZATION.geo.latitude,
      longitude: ORGANIZATION.geo.longitude,
    },
    areaServed: ORGANIZATION.areaServed,
    knowsAbout: [...SERVICES_FOR_SCHEMA],
    ...(ORGANIZATION.sameAs.length > 0
      ? { sameAs: ORGANIZATION.sameAs }
      : {}),
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
  };
}

export function faqPageJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: BRANDCURE_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

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

export function homePageJsonLdGraph(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      websiteJsonLd(),
      faqPageJsonLd(),
      webPageJsonLd({
        name: `${SITE_NAME} — Home`,
        description: HOME_META_DESCRIPTION,
        path: "/",
      }),
    ],
  };
}
