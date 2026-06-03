import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/constants";
import { HOME_META_TITLE } from "@/lib/seo/descriptions";

type CreateMetadataOptions = {
  title: string;
  description?: string;
  /** Path without domain, e.g. `/blog` or `/portfolio/my-project` */
  path?: string;
  /** Absolute image URL or site-relative path */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  keywords?: string[];
};

const DEFAULT_OG_IMAGE = "/og-card.png";

function resolveImageUrl(image?: string): string {
  if (!image) return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

/** Shared Next.js Metadata for pages — canonical, Open Graph, Twitter, robots. */
export function createMetadata(options: CreateMetadataOptions): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "",
    image,
    imageAlt = SITE_NAME,
    type = "website",
    publishedTime,
    modifiedTime,
    noIndex = false,
    keywords = [...DEFAULT_KEYWORDS],
  } = options;

  const canonicalPath = normalizePath(path);
  const url = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
  const ogImage = resolveImageUrl(image);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type,
      ...(publishedTime && type === "article"
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime }
        : {}),
      images: [
        {
          url: ogImage,
          alt: imageAlt,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  other: {
    language: "en-IN",
    "DC.language": "en-IN",
  },
  title: {
    default: HOME_META_TITLE,
    template: `%s`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS.join(", "),
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Business",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: { "en-IN": `${SITE_URL}/` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Your AI-native digital partner`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Make your business AI-first`,
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon-48.png",
    apple: [{ url: "/logo-512.png", sizes: "180x180", type: "image/png" }],
  },
};
