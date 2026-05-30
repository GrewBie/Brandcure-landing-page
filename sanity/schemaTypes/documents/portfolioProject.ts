import { defineField, defineType } from "sanity";
import { bodyContentMembers } from "../blocks/bodyContent";

const serviceTypes = [
  { title: "AI & Agentic Automation", value: "automation" },
  { title: "Websites", value: "websites" },
  { title: "AI Ads (Video)", value: "ai-ads" },
];

const automationSubtypes = [
  { title: "AI Automation", value: "ai-automation" },
  { title: "Agentic Automation", value: "agentic-automation" },
];

const segments = [
  { title: "Indian SMB", value: "smb" },
  { title: "Startup", value: "startup" },
  { title: "D2C", value: "d2c" },
  { title: "Global", value: "global" },
];

export const portfolioProject = defineType({
  name: "portfolioProject",
  title: "Portfolio Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "serviceType",
      title: "Work type",
      type: "string",
      description: "Primary category: automation, websites, or AI video ads.",
      options: { list: serviceTypes, layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "automationSubtype",
      title: "Automation type",
      type: "string",
      options: { list: automationSubtypes, layout: "radio" },
      description: "Only for AI & Agentic Automation projects.",
      hidden: ({ parent }) => parent?.serviceType !== "automation",
    }),
    defineField({
      name: "segment",
      title: "Client segment",
      type: "string",
      options: { list: segments, layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "e.g. Restaurant Chain · Chennai",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional chips on the card, e.g. WhatsApp, SEO, UGC.",
    }),
    defineField({
      name: "resultHeadline",
      title: "Result headline",
      type: "string",
      description: 'e.g. "3× bookings"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "resultDetail",
      title: "Result detail",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "websiteUrl",
      title: "Live website URL",
      type: "url",
      description: "For Website projects — the live site to preview / visit.",
      hidden: ({ parent }) => parent?.serviceType !== "websites",
    }),
    defineField({
      name: "demoVideoUrl",
      title: "Demo video URL",
      type: "url",
      description:
        "For Automation projects — YouTube, Vimeo, or direct .mp4 walkthrough.",
      hidden: ({ parent }) => parent?.serviceType !== "automation",
    }),
    defineField({
      name: "adVideos",
      title: "Ad videos",
      type: "array",
      description: "For AI Ads — one or more video creatives.",
      hidden: ({ parent }) => parent?.serviceType !== "ai-ads",
      of: [
        {
          type: "object",
          name: "adVideo",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "videoUrl",
              title: "Video URL",
              type: "url",
              description: "YouTube, Vimeo, or direct .mp4 URL.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "thumbnail",
              title: "Thumbnail",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: "title", media: "thumbnail" } },
        },
      ],
    }),
    defineField({
      name: "cardBg",
      title: "Card background",
      type: "string",
      description: "Hex colour for card footer area, e.g. #F5F0E8",
      initialValue: "#F5F0E8",
    }),
    defineField({
      name: "body",
      title: "Case study body",
      type: "array",
      description: "Use + to add images between sections.",
      of: bodyContentMembers,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      serviceType: "serviceType",
      segment: "segment",
      media: "heroImage",
    },
    prepare({ title, serviceType, segment, media }) {
      const typeLabel =
        serviceTypes.find((t) => t.value === serviceType)?.title ?? serviceType;
      const segLabel =
        segments.find((s) => s.value === segment)?.title ?? segment;
      return {
        title,
        subtitle: [typeLabel, segLabel].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
