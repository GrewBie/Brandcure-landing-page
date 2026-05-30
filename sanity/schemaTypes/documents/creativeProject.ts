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

/** AI video ad — one creative with video link and ad description. */
export const creativeProject = defineType({
  name: "creativeProject",
  title: "AI Video Ad",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Ad / campaign name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    portfolioSlugField,
    portfolioSegmentField,
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "e.g. D2C skincare · Meta Reels",
    }),
    portfolioTagsField,
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description:
        "YouTube, Vimeo, or direct .mp4 — Neha plays this during the AI creatives tour.",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "adDescription",
      title: "Ad description",
      type: "text",
      rows: 4,
      description:
        "What the ad shows, hook, offer, and results — used on cards and by Neha when narrating.",
      validation: (Rule) => Rule.required().min(20),
    }),
    defineField({
      name: "resultHeadline",
      title: "Result headline (optional)",
      type: "string",
      description: 'Optional metric for cards, e.g. "2.4× ROAS". Falls back to campaign name.',
    }),
    defineField({
      name: "heroImage",
      title: "Preview image",
      type: "image",
      options: { hotspot: true },
      description: "Poster before play — use if you have a still frame.",
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail (fallback)",
      type: "image",
      options: { hotspot: true },
      description: "Used when no preview image is set.",
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
      thumbnail: "thumbnail",
    },
    prepare({ title, segment, media, thumbnail }) {
      const segLabel =
        PORTFOLIO_SEGMENTS.find((s) => s.value === segment)?.title ?? segment;
      return {
        title,
        subtitle: `AI Ad · ${segLabel ?? ""}`,
        media: media ?? thumbnail,
      };
    },
  },
  validation: (Rule) =>
    Rule.custom((doc) => {
      const d = doc as { heroImage?: unknown; thumbnail?: unknown };
      if (!d?.heroImage && !d?.thumbnail) {
        return "Add a preview image or thumbnail for portfolio cards.";
      }
      return true;
    }),
});
