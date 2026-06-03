import type { SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  contactEmail: "contact@grewbie.com",
  whatsappNumber: "918838924425",
  whatsappDisplay: "+91 88389 24425",
};

export const services = [
  {
    sym: "▣",
    title: "Website Development",
    sub: "Design · Build · Convert",
    description:
      "Fast, beautiful websites that turn visitors into booked calls — live in 30 days. Engineered to load instantly, rank on Google, and sell while you sleep.",
  },
  {
    sym: "◇",
    title: "SEO",
    sub: "Search Engine Optimization",
    description:
      "Rank page one for the keywords your buyers actually search. Technical, content, and local SEO that makes Google your highest-performing salesperson.",
  },
  {
    sym: "◈",
    title: "AEO",
    sub: "Answer Engine Optimization",
    description:
      "Own the direct answer. We structure your content so Google snippets, voice search, and assistants quote you first — winning the click before rivals appear.",
  },
  {
    sym: "◻",
    title: "GEO",
    sub: "Generative Engine Optimization",
    description:
      "Get recommended by AI. We make your brand the source ChatGPT, Gemini, and Perplexity cite when buyers ask — the new front page of the internet.",
  },
  {
    sym: "▷",
    title: "AI Ad Creatives",
    sub: "Reels · Ads · UGC",
    description:
      "Scroll-stopping video ads produced by AI at a fraction of studio cost — scripted, shot, and optimized for Meta, YouTube, and WhatsApp to drive real ROAS.",
  },
  {
    sym: "⟳",
    title: "AI Automation",
    sub: "WhatsApp · CRM · Workflows",
    description:
      "Put follow-ups, bookings, invoicing, and lead nurture on autopilot. AI agents work 24/7 so you never lose another customer to a slow reply.",
  },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Free Audit",
    description:
      "We review your website, SEO, and where enquiries leak — then send a plain report: what's working, what's costing you customers, what to fix first. No pitch.",
    time: "24–48 hrs",
  },
  {
    step: "02",
    title: "Strategy & Proposal",
    description:
      "We map a 90-day plan with deliverables, timelines, and the outcomes you should expect. You see exactly what you're getting — and what it costs — before you pay anything.",
    time: "3–5 days",
  },
  {
    step: "03",
    title: "Build & Launch",
    description:
      "We build. Site live, content flowing, ads running, WhatsApp follow-up active — so leads start getting answered from day one.",
    time: "14–30 days",
  },
] as const;

export const whyPoints = [
  {
    title: "AI-native speed",
    description:
      "AI drafts content, briefs, and reports; the founders own strategy and QA personally. That's how a new website goes live in about 30 days and campaigns launch in weeks, not quarters — without cutting corners on quality.",
  },
  {
    title: "Founder-led ownership",
    description:
      "You work directly with the founders doing the work — no hand-offs, no account-manager telephone. One small team owns your website, marketing, and automation, and one person picks up when you call.",
  },
  {
    title: "Built for India and beyond",
    description:
      "WhatsApp-first, INR-friendly, and fluent in how Indian SMBs actually buy. For clients abroad: clear English, async Loom and Slack/WhatsApp updates, and working hours that overlap your timezone.",
  },
] as const;

export const auditChecklist = [
  "Where your website is leaking enquiries",
  "Local SEO & Google visibility gaps",
  "Top 3 follow-up / automation wins",
  "How you stack up against 2 competitors",
] as const;

export const marqueeItems = [
  "AI-First Agency",
  "3× Faster Delivery",
  "Website in 30 Days",
  "SEO · AEO · GEO",
  "Rank on ChatGPT & Google",
  "AI Ad Creatives",
  "WhatsApp Automation",
  "Chennai · Bangalore · Mumbai",
  "Free Digital Audit",
];
