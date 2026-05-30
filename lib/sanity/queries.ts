const portfolioFields = `
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  serviceType,
  automationSubtype,
  segment,
  subtitle,
  tags,
  resultHeadline,
  resultDetail,
  cardBg,
  heroImage,
  websiteUrl,
  demoVideoUrl,
  adVideos[]{ title, videoUrl, thumbnail }
`;

export const portfolioListQuery = `*[_type == "portfolioProject"] | order(sortOrder asc, _createdAt desc) {
  ${portfolioFields}
}`;

export const portfolioBySlugQuery = `*[_type == "portfolioProject" && slug.current == $slug][0] {
  ${portfolioFields},
  body
}`;

export const portfolioSlugsQuery = `*[_type == "portfolioProject"].slug.current`;

export const blogListQuery = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  readTime,
  publishedAt,
  coverImage
}`;

export const blogBySlugQuery = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  readTime,
  publishedAt,
  coverImage,
  body,
  seo
}`;

export const blogSlugsQuery = `*[_type == "blogPost"].slug.current`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  contactEmail,
  whatsappNumber
}`;
