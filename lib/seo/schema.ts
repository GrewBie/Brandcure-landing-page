import { HOME_META_DESCRIPTION } from "@/lib/seo/descriptions";
import { BRANDCURE_FAQ } from "@/lib/seo/faq";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/seo/constants";

const ORG_ID = `${SITE_URL}/#organization`;
const CONTACT_URL = `${SITE_URL}/#contact`;

/** 1a — Organization (exact fields per SEO spec). */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brandcure-bc.svg`,
    description:
      "AI-first digital growth partner for Indian SMBs, startups, and global brands. Services include website design, AI marketing, WhatsApp automation, and e-commerce growth.",
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality: ORGANIZATION.address.addressLocality,
      addressRegion: ORGANIZATION.address.addressRegion,
      addressCountry: ORGANIZATION.address.addressCountry,
    },
    sameAs: [...ORGANIZATION.sameAs],
  };
}

/** 1b — LocalBusiness. */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    image: `${SITE_URL}/og-card.png`,
    url: SITE_URL,
    telephone: ORGANIZATION.telephone,
    email: ORGANIZATION.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: ORGANIZATION.address.addressLocality,
      addressRegion: ORGANIZATION.address.addressRegion,
      postalCode: "600001",
      addressCountry: ORGANIZATION.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORGANIZATION.geo.latitude,
      longitude: ORGANIZATION.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    areaServed: ["Chennai", "Bangalore", "Mumbai", "India"],
  };
}

/** 1c — FAQPage from existing homepage FAQ copy. */
export function faqPageSchema() {
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

const SERVICE_DEFINITIONS = [
  {
    name: "Digital Presence",
    serviceType: "Digital Presence (website, SEO, social)",
  },
  {
    name: "AI Marketing",
    serviceType: "AI Marketing (content, ads, email)",
  },
  {
    name: "Business Automation",
    serviceType: "Business Automation (WhatsApp, CRM, ops)",
  },
  { name: "Full-Stack Growth", serviceType: "Full-Stack Growth" },
  { name: "E-commerce Growth", serviceType: "E-commerce Growth" },
  {
    name: "AI Creatives & Video",
    serviceType: "AI Creatives & Video",
  },
] as const;

/** 1d — One Service block per offering. */
export function serviceSchemas() {
  return SERVICE_DEFINITIONS.map((service, index) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service-${index + 1}`,
    name: service.name,
    serviceType: service.serviceType,
    provider: { "@id": ORG_ID },
    areaServed: "India",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: CONTACT_URL,
      servicePhone: ORGANIZATION.telephone,
    },
  }));
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

export function homeWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    name: `${SITE_NAME} — Home`,
    description: HOME_META_DESCRIPTION,
    url: `${SITE_URL}/`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

/** Shared @graph for layout <head> on every page. */
export function globalSchemaGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      localBusinessSchema(),
      websiteSchema(),
      homeWebPageSchema(),
      faqPageSchema(),
      ...serviceSchemas(),
    ],
  };
}
