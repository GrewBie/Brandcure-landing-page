"use client";

import { parseVideoUrl } from "@/lib/video/embed";
import type { PortfolioDetail } from "@/lib/sanity/map";

type Props = {
  project: PortfolioDetail;
};

export function PortfolioDetailExtras({ project }: Props) {
  if (project.serviceType === "websites") {
    return null;
  }

  const videoUrl =
    project.serviceType === "automation"
      ? project.demoVideoUrl
      : project.serviceType === "ai-ads"
        ? project.previewVideoUrl
        : undefined;

  if (!videoUrl) return null;

  const parsed = parseVideoUrl(videoUrl);
  if (parsed.provider === "none") return null;

  return (
    <div className="relative mt-10 aspect-video max-w-4xl overflow-hidden rounded-lg bg-charcoal">
      {parsed.provider === "file" ? (
        <video
          src={parsed.url}
          controls
          playsInline
          className="h-full w-full object-contain"
        />
      ) : (
        <iframe
          src={parsed.embedUrl}
          title={project.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      )}
    </div>
  );
}
