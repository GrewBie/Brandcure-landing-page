import { defineField, defineType } from "sanity";
import { bodyContentMembers } from "../blocks/bodyContent";

const categories = [
  { title: "Insights", value: "Insights" },
  { title: "Automation", value: "Automation" },
  { title: "Case Study", value: "Case Study" },
  { title: "Strategy", value: "Strategy" },
  { title: "AI & Tech", value: "AI & Tech" },
];

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "2–3 sentence summary for cards and SEO.",
      validation: (Rule) => Rule.required().max(320),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: categories, layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "readTime",
      title: "Read time (minutes)",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(60),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      description:
        "Write your article here. Use the + control to insert images between paragraphs.",
      of: bodyContentMembers,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({ name: "metaTitle", title: "Meta title", type: "string" }),
        defineField({
          name: "metaDescription",
          title: "Meta description",
          type: "text",
          rows: 2,
        }),
        defineField({ name: "ogImage", title: "OG image", type: "image" }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Published date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
    },
  },
});
