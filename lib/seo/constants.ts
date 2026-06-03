/** Production canonical host (apex 307s to www on Vercel). */
const DEFAULT_SITE_URL = "https://www.brandcure.in";

import { HOME_META_DESCRIPTION } from "@/lib/seo/descriptions";
import { SOCIAL_PROFILE_URLS } from "@/lib/social-links";

/** Apex domains that must canonicalize to www in production. */
const APEX_TO_WWW: Record<string, string> = {
  "brandcure.in": "https://www.brandcure.in",
};

function normalizeCanonicalOrigin(origin: string): string {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:" && protocol !== "http:") return DEFAULT_SITE_URL;
    const canonical = APEX_TO_WWW[hostname];
    if (canonical) return canonical;
    if (hostname.startsWith("www.")) return origin;
    return origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in Vercel (with https://). */
export function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    return normalizeCanonicalOrigin(new URL(href).origin);
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "BrandCure";

export const SITE_TAGLINE = "Your AI-native digital partner";

/** Default meta description (home + sitewide fallback). */
export const DEFAULT_DESCRIPTION = HOME_META_DESCRIPTION;

export const DEFAULT_KEYWORDS = [
  "AI marketing agency India",
  "website design India",
  "business automation WhatsApp",
  "AI video ads",
  "digital agency SMB",
  "BrandCure",
] as const;

export const ORGANIZATION = {
  name: SITE_NAME,
  email: "contact@grewbie.com",
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
  "Website development",
  "Search Engine Optimization (SEO)",
  "Answer Engine Optimization (AEO)",
  "Generative Engine Optimization (GEO)",
  "AI ad creatives and video",
  "AI automation",
] as const;
