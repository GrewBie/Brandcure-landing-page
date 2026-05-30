import { defineField } from "sanity";

export const PORTFOLIO_SEGMENTS = [
  { title: "Indian SMB", value: "smb" },
  { title: "Startup", value: "startup" },
  { title: "D2C", value: "d2c" },
  { title: "Global", value: "global" },
] as const;

export const AUTOMATION_SUBTYPES = [
  { title: "AI Automation", value: "ai-automation" },
  { title: "Agentic Automation", value: "agentic-automation" },
] as const;

export const portfolioSlugField = defineField({
  name: "slug",
  title: "Slug",
  type: "slug",
  options: { source: "title", maxLength: 96 },
  validation: (Rule) => Rule.required(),
});

export const portfolioSegmentField = defineField({
  name: "segment",
  title: "Client segment",
  type: "string",
  options: { list: [...PORTFOLIO_SEGMENTS], layout: "radio" },
  validation: (Rule) => Rule.required(),
});

export const portfolioSortOrderField = defineField({
  name: "sortOrder",
  title: "Sort order",
  type: "number",
  description: "Lower numbers appear first.",
  initialValue: 0,
});

export const portfolioCardBgField = defineField({
  name: "cardBg",
  title: "Card background",
  type: "string",
  description: "Hex colour for card footer area, e.g. #F5F0E8",
  initialValue: "#F5F0E8",
});

export const portfolioTagsField = defineField({
  name: "tags",
  title: "Tags",
  type: "array",
  of: [{ type: "string" }],
  description: "Optional chips on the card, e.g. WhatsApp, SEO, UGC.",
});

export const portfolioOrderings = [
  {
    title: "Sort order",
    name: "sortOrderAsc",
    by: [{ field: "sortOrder", direction: "asc" as const }],
  },
];
