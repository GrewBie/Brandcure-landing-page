import { defineArrayMember } from "sanity";

/** Rich text + inline images for blog posts and portfolio case studies */
export const bodyContentMembers = [
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "H2", value: "h2" },
      { title: "H3", value: "h3" },
      { title: "Quote", value: "blockquote" },
    ],
    lists: [
      { title: "Bullet", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      decorators: [
        { title: "Strong", value: "strong" },
        { title: "Emphasis", value: "em" },
      ],
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            {
              name: "href",
              type: "url",
              title: "URL",
              validation: (Rule) =>
                Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
            },
          ],
        },
      ],
    },
  }),
  defineArrayMember({
    type: "image",
    title: "Image",
    options: { hotspot: true },
    fields: [
      {
        name: "alt",
        type: "string",
        title: "Alt text",
        description: "Describe the image for accessibility and SEO.",
      },
      {
        name: "caption",
        type: "string",
        title: "Caption",
        description: "Optional line shown below the image.",
      },
    ],
  }),
];
