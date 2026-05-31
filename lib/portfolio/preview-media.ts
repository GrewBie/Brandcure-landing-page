import type { PortfolioProject } from "@/types/content";

export function getProjectPreviewVideoUrl(project: PortfolioProject): string {
  return (
    project.previewVideoUrl?.trim() ||
    project.adVideos?.[0]?.videoUrl?.trim() ||
    project.demoVideoUrl?.trim() ||
    ""
  );
}

export function getProjectCardThumbnail(project: PortfolioProject): string {
  return (
    project.adVideos?.[0]?.thumbnailUrl?.trim() ||
    project.heroImageUrl
  );
}
