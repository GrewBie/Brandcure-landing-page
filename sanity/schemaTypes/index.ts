import { automationProject } from "./documents/automationProject";
import { blogPost } from "./documents/blogPost";
import { creativeProject } from "./documents/creativeProject";
import { portfolioProject } from "./documents/portfolioProject";
import { websiteProject } from "./documents/websiteProject";
import { siteSettings } from "./singletons/siteSettings";

export const schemaTypes = [
  websiteProject,
  automationProject,
  creativeProject,
  portfolioProject,
  blogPost,
  siteSettings,
];
