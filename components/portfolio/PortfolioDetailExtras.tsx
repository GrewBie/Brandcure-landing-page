"use client";

import { parseVideoUrl } from "@/lib/video/embed";
import type { PortfolioDetail } from "@/lib/sanity/map";

type Props = {
  project: PortfolioDetail;
};

export function PortfolioDetailExtras({ project }: Props) {
  if (project.serviceType === "websites" && project.websiteUrl) {
    return (
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white hover:bg-brand-black"
        >
          Visit live website ↗
        </a>
      </div>
    );
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
