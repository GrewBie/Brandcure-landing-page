"use client";

import { getProjectPreviewVideoUrl } from "@/lib/portfolio/preview-media";
import { portfolioDisplayTitle } from "@/lib/portfolio/display-copy";
import { cn } from "@/lib/cn";
import { parseVideoUrl } from "@/lib/video/embed";
import type { PortfolioDetail } from "@/lib/sanity/map";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

type Props = {
  project: PortfolioDetail;
  className?: string;
};

/** Hero media on portfolio detail — video when available, otherwise hero image. */
export function PortfolioDetailMedia({ project, className }: Props) {
  const videoUrl = getProjectPreviewVideoUrl(project);
  const parsed = parseVideoUrl(videoUrl);
  const hasVideo = parsed.provider !== "none";
  const displayTitle = portfolioDisplayTitle(project.title);

  if (hasVideo) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--brand-black)]",
          "h-[min(72vh,720px)] min-h-[280px] sm:min-h-[360px]",
          className,
        )}
      >
        {parsed.provider === "file" ? (
          <video
            src={parsed.url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <iframe
            src={parsed.embedUrl}
            title={displayTitle}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        )}

        {parsed.provider === "google-drive" && (
          <a
            href={parsed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-black)]/85 px-3 py-2 text-[11px] font-semibold tracking-[0.04em] text-[var(--brand-warm-white)] backdrop-blur-sm transition-colors hover:bg-gold hover:text-[var(--brand-black)]"
          >
            Watch in Drive
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)]",
        className,
      )}
    >
      <Image
        src={project.heroImageUrl}
        alt={displayTitle}
        fill
        className="object-cover"
        sizes="(max-width: 1200px) 100vw, 960px"
        priority
      />
    </div>
  );
}
