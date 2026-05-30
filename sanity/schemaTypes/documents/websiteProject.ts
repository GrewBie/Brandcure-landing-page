import { defineField, defineType } from "sanity";
import {
  portfolioCardBgField,
  portfolioOrderings,
  portfolioSegmentField,
  portfolioSlugField,
  portfolioSortOrderField,
  portfolioTagsField,
  PORTFOLIO_SEGMENTS,
} from "../shared/portfolioShared";

/** Website portfolio — live link + site details only (no video / case study). */
export const websiteProject = defineType({
  name: "websiteProject",
  title: "Website Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    portfolioSlugField,
    portfolioSegmentField,
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "e.g. Restaurant Chain · Chennai",
      validation: (Rule) => Rule.required(),
    }),
    portfolioTagsField,
    defineField({
      name: "websiteUrl",
      title: "Live website URL",
      type: "url",
      description: "The live site Neha can send visitors to.",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "websiteDetails",
      title: "Website details",
      type: "text",
      rows: 4,
      description:
        "What the site does, key features, and outcomes — used on cards and by the AI tour guide.",
      validation: (Rule) => Rule.required().min(20),
    }),
    defineField({
      name: "heroImage",
      title: "Preview image",
      type: "image",
      options: { hotspot: true },
      description: "Screenshot or mockup shown on portfolio cards.",
      validation: (Rule) => Rule.required(),
    }),
    portfolioCardBgField,
    portfolioSortOrderField,
  ],
  orderings: portfolioOrderings,
  preview: {
    select: {
      title: "title",
      segment: "segment",
      media: "heroImage",
    },
    prepare({ title, segment, media }) {
      const segLabel =
        PORTFOLIO_SEGMENTS.find((s) => s.value === segment)?.title ?? segment;
      return {
        title,
        subtitle: `Website · ${segLabel ?? ""}`,
        media,
      };
    },
  },
});
