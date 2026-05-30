import type { SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  contactEmail: "hello@brandcure.in",
  whatsappNumber: "918838924425",
  whatsappDisplay: "+91 88389 24425",
};

export const services = [
  {
    sym: "◻",
    title: "Digital Presence",
    sub: "Website · SEO · Social",
    description:
      "Professional website, local SEO, and social media — built and managed end to end. Live in 30 days.",
  },
  {
    sym: "◈",
    title: "AI Marketing",
    sub: "Content · Ads · Email",
    description:
      "Done-for-you marketing engine. AI produces content, ads, and email campaigns managed by our team.",
  },
  {
    sym: "⟳",
    title: "Business Automation",
    sub: "WhatsApp · CRM · Ops",
    description:
      "Automate lead follow-up, invoicing, social posting, and all repetitive business operations.",
  },
  {
    sym: "▣",
    title: "Full-Stack Growth",
    sub: "Everything. One contract.",
    description:
      "Website + marketing + automation under one retainer. One team, one contact, full accountability.",
  },
  {
    sym: "◇",
    title: "E-commerce Growth",
    sub: "Store · ROAS · Creative",
    description:
      "Shopify / WooCommerce builds, AI ad creative at scale, and full-funnel performance management.",
  },
  {
    sym: "▷",
    title: "AI Creatives & Video",
    sub: "Reels · Ads · Brand film",
    description:
      "AI-powered video ads, short-form reels, and campaign creative — scripted, produced, and ready to run across Meta, YouTube, and WhatsApp.",
  },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Free Audit",
    description:
      "We analyze your website, SEO, competitors, and missed automation opportunities. You receive a clear report — what's working, what's costing you customers, what to fix first. No pitch. Just data.",
    time: "24–48 hrs",
  },
  {
    step: "02",
    title: "Strategy & Proposal",
    description:
      "Based on your audit, we map a precise 90-day growth plan with deliverables, timelines, and expected outcomes. You know exactly what you're getting before you sign anything.",
    time: "3–5 days",
  },
  {
    step: "03",
    title: "Build & Launch",
    description:
      "We execute. Website live, content flowing, ads running, automations active. Your AI-powered digital team is operational — and you start seeing leads from day one.",
    time: "14–30 days",
  },
] as const;

export const whyPoints = [
  {
    title: "AI-Native Speed",
    description:
      "AI handles content, briefs, and reporting. Humans do strategy. Delivery is 3× faster than any traditional setup — and we have the case studies to prove it.",
  },
  {
    title: "Full-Stack Ownership",
    description:
      "Website, marketing, automation — one team, one contract. No fragmented vendors. No missed deadlines. One person to call when things need to move.",
  },
  {
    title: "Global Mindset",
    description:
      "We build with a worldwide outlook — clear positioning, professional polish, and digital systems that work wherever your customers find you. Growth-ready, not geography-limited.",
  },
] as const;

export const auditChecklist = [
  "Website performance & speed score",
  "Local SEO gap analysis",
  "Top 3 automation opportunities",
  "Head-to-head competitor comparison",
] as const;

export const marqueeItems = [
  "AI-First Agency",
  "3× Faster Delivery",
  "Flexible Pricing",
  "Website in 30 Days",
  "WhatsApp Automation",
  "AI Video & Creatives",
  "Full-Stack Growth",
  "Chennai · Bangalore · Mumbai",
  "Free Digital Audit",
];
