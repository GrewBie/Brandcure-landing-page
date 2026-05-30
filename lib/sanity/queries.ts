/** All portfolio document types (typed + legacy). */
export const PORTFOLIO_DOCUMENT_TYPES = [
  "websiteProject",
  "automationProject",
  "creativeProject",
  "portfolioProject",
] as const;

const portfolioTypeFilter = `_type in ${JSON.stringify([...PORTFOLIO_DOCUMENT_TYPES])}`;

const portfolioProjection = `
  _type,
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  segment,
  subtitle,
  tags,
  cardBg,
  heroImage,
  thumbnail,
  sortOrder,
  "serviceType": select(
    _type == "websiteProject" => "websites",
    _type == "automationProject" => "automation",
    _type == "creativeProject" => "ai-ads",
    _type == "portfolioProject" => serviceType
  ),
  automationSubtype,
  websiteUrl,
  websiteDetails,
  demoVideoUrl,
  videoUrl,
  adDescription,
  resultHeadline,
  resultDetail,
  "adVideos": select(
    _type == "creativeProject" => [{ "title": title, "videoUrl": videoUrl, thumbnail }],
    _type == "portfolioProject" => adVideos[]{ title, videoUrl, thumbnail },
    null
  ),
  body
`;

export const portfolioListQuery = `*[${portfolioTypeFilter}] | order(sortOrder asc, _createdAt desc) {
  ${portfolioProjection}
}`;

export const portfolioBySlugQuery = `*[${portfolioTypeFilter} && slug.current == $slug][0] {
  ${portfolioProjection}
}`;

export const portfolioSlugsQuery = `*[${portfolioTypeFilter}].slug.current`;

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
