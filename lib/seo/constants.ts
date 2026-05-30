const DEFAULT_SITE_URL = "https://brandcure.in";

import { SOCIAL_PROFILE_URLS } from "@/lib/social-links";

/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in Vercel (with https://). */
export function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    return new URL(href).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "BrandCure";

export const SITE_TAGLINE = "AI-first growth partner";

export const DEFAULT_DESCRIPTION =
  "BrandCure builds websites, AI marketing, business automation, and video creatives for Indian SMBs and growing brands. Based in Chennai. Flexible scope, fast delivery, free digital audit.";

export const DEFAULT_KEYWORDS = [
  "AI marketing agency India",
  "website design Chennai",
  "business automation WhatsApp",
  "AI video ads",
  "digital agency SMB",
  "BrandCure",
] as const;

export const ORGANIZATION = {
  name: SITE_NAME,
  email: "hello@brandcure.in",
  telephone: "+918838924425",
  whatsappDisplay: "+91 88389 24425",
  address: {
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  geo: {
    latitude: 13.0827,
    longitude: 80.2707,
  },
  areaServed: ["India", "IN", "Tamil Nadu", "Chennai"],
  sameAs: SOCIAL_PROFILE_URLS,
} as const;

export const SERVICES_FOR_SCHEMA = [
  "Website design and SEO",
  "AI marketing and content",
  "WhatsApp and business automation",
  "E-commerce growth",
  "AI video and ad creatives",
  "Full-stack growth retainers",
] as const;
