import { defineField, defineType } from "sanity";
import { bodyContentMembers } from "../blocks/bodyContent";
import {
  AUTOMATION_SUBTYPES,
  portfolioCardBgField,
  portfolioOrderings,
  portfolioSegmentField,
  portfolioSlugField,
  portfolioSortOrderField,
  portfolioTagsField,
  PORTFOLIO_SEGMENTS,
} from "../shared/portfolioShared";

/** AI / agentic automation — demo video, ROI, and case study. */
export const automationProject = defineType({
  name: "automationProject",
  title: "Automation Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    portfolioSlugField,
    defineField({
      name: "automationSubtype",
      title: "Automation type",
      type: "string",
      options: { list: [...AUTOMATION_SUBTYPES], layout: "radio" },
    }),
    portfolioSegmentField,
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "e.g. D2C brand · WhatsApp + CRM",
      validation: (Rule) => Rule.required(),
    }),
    portfolioTagsField,
    defineField({
      name: "demoVideoUrl",
      title: "Demo video URL",
      type: "url",
      description:
        "Walkthrough of the automation — YouTube, Vimeo, or direct .mp4. Neha can play this in the tour.",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "resultHeadline",
      title: "ROI headline",
      type: "string",
      description: 'Short metric, e.g. "40 hrs/week saved"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "resultDetail",
      title: "ROI detail",
      type: "text",
      rows: 3,
      description: "One or two lines on business impact — spoken by Neha and shown on cards.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Preview image",
      type: "image",
      options: { hotspot: true },
      description: "Poster frame before the demo video plays.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Case study",
      type: "array",
      description: "Full story — problem, agentic system built, and results.",
      of: bodyContentMembers,
    }),
    portfolioCardBgField,
    portfolioSortOrderField,
  ],
  orderings: portfolioOrderings,
  preview: {
    select: {
      title: "title",
      segment: "segment",
      automationSubtype: "automationSubtype",
      media: "heroImage",
    },
    prepare({ title, segment, automationSubtype, media }) {
      const segLabel =
        PORTFOLIO_SEGMENTS.find((s) => s.value === segment)?.title ?? segment;
      const typeLabel =
        AUTOMATION_SUBTYPES.find((t) => t.value === automationSubtype)?.title ??
        "Automation";
      return {
        title,
        subtitle: `${typeLabel} · ${segLabel ?? ""}`,
        media,
      };
    },
  },
});
