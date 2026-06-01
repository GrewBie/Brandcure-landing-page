import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/constants";

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

function resolveImageUrl(image?: string): string {
  if (!image) return `${SITE_URL}/brandcure-bc.svg`;
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
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

  const url = `${SITE_URL}${path}`;
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
  title: {
    default: `${SITE_NAME} | AI-First Website, Marketing & Automation`,
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
    title: `${SITE_NAME} | Cure your brand. 3× faster.`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/brandcure-bc.svg", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | AI-First Growth Partner`,
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};
