/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://brandcure.in";

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
  sameAs: [] as string[],
} as const;

export const SERVICES_FOR_SCHEMA = [
  "Website design and SEO",
  "AI marketing and content",
  "WhatsApp and business automation",
  "E-commerce growth",
  "AI video and ad creatives",
  "Full-stack growth retainers",
] as const;
