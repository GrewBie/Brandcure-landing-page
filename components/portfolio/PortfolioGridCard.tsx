"use client";

import { CardSubtitleOverlay } from "@/components/portfolio/CardSubtitleOverlay";
import { isNewContent } from "@/lib/engagement/rank";
import { cn } from "@/lib/cn";
import {
  getProjectCardThumbnail,
  getProjectPreviewVideoUrl,
} from "@/lib/portfolio/preview-media";
import { serviceTypeToSection } from "@/lib/portfolio-nav";
import { portfolioDisplayTitle } from "@/lib/portfolio/display-copy";
import {
  isIframeVideoProvider,
  parseVideoUrl,
  videoEmbedAutoplaySrc,
} from "@/lib/video/embed";
import type { PortfolioProject } from "@/types/content";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function PortfolioGridCard({
  project,
  index = 0,
  globalIndex,
}: {
  project: PortfolioProject;
  index?: number;
  /** Stable index across homepage sections for voice next/prev. */
  globalIndex?: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const isNew = isNewContent(project.createdAt);
  const navSection = serviceTypeToSection(project.serviceType);

  const videoUrl = getProjectPreviewVideoUrl(project);
  const parsed = parseVideoUrl(videoUrl);
  const hasVideo = parsed.provider !== "none";
  const embedAutoplay = videoEmbedAutoplaySrc(parsed);
  const iframeSrc =
    hasVideo && isIframeVideoProvider(parsed.provider) && parsed.embedUrl
      ? hover && embedAutoplay
        ? embedAutoplay
        : parsed.embedUrl
      : undefined;

  const displayTitle = portfolioDisplayTitle(project.title);
  const imageAlt = `${displayTitle} — ${project.serviceTypeLabel} case study preview`;

  const cardTags = [
    project.automationSubtypeLabel ?? project.serviceTypeLabel,
    project.segmentLabel,
    ...project.tags,
  ];

  useEffect(() => {
    const v = videoRef.current;
    if (!v || parsed.provider !== "file") return;
    if (hover) {
      v.muted = false;
      v.currentTime = 0;
      void v.play().catch(() => {
        v.muted = true;
        void v.play().catch(() => {});
      });
    } else {
      v.pause();
      v.currentTime = 0;
      v.muted = true;
    }
  }, [hover, parsed.provider]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || parsed.provider !== "file") return;
    v.muted = true;
    void v.load();
  }, [parsed.provider, parsed.url]);

  const onMove = (e: React.MouseEvent) => {
    if (!hover || hasVideo) return;
    const img = cardRef.current?.querySelector("[data-card-thumb]");
    if (!cardRef.current || !img) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    (img as HTMLElement).style.transform = `scale(1.08) translate(${x * 12}px, ${y * 8}px)`;
  };

  const onLeave = () => {
    setHover(false);
    const img = cardRef.current?.querySelector("[data-card-thumb]");
    if (img) (img as HTMLElement).style.transform = "scale(1)";
  };

  return (
    <Link
      ref={cardRef}
      href={`/portfolio/${project.slug}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      data-nav-id={project.slug}
      data-nav-section={navSection}
      data-nav-index={globalIndex ?? index}
      data-nav-title={project.title}
      data-nav-result={project.resultHeadline}
      data-nav-industry={project.segmentLabel}
      className="group block cursor-pointer overflow-hidden border border-[var(--border)] bg-charcoal"
    >
      <article>
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--brand-black)]">
          {isNew && (
            <span
              className={cn(
                "absolute left-3 top-3 z-20 rounded-full bg-[var(--brand-black)]/80 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--brand-warm-white)] backdrop-blur-sm transition-opacity duration-300",
                hover && "opacity-0",
              )}
            >
              NEW
            </span>
          )}

          {hasVideo && parsed.provider === "file" && (
            <video
              ref={videoRef}
              src={parsed.url}
              playsInline
              loop
              preload="auto"
              muted
              className="absolute inset-0 z-10 h-full w-full object-cover"
            />
          )}

          {iframeSrc && (
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              title={project.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 z-10 h-full w-full border-0"
            />
          )}

          {!hasVideo && (
            <Image
              data-card-thumb
              src={getProjectCardThumbnail(project)}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-out will-change-transform"
            />
          )}

          {hover && hasVideo && project.subtitle.trim() && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[rgba(17,18,20,0.92)] via-[rgba(17,18,20,0.55)] to-transparent px-4 pb-4 pt-12">
              <p className="line-clamp-3 text-center text-xs font-medium leading-relaxed text-[var(--brand-warm-white)]">
                {project.subtitle}
              </p>
            </div>
          )}

          {hover && !hasVideo && (
            <CardSubtitleOverlay
              subtitle={project.subtitle}
              className="pointer-events-none opacity-100"
            />
          )}
        </div>

        <p data-nav-summary className="sr-only">
          {project.subtitle}
        </p>

        <div
          className={cn(
            "overflow-hidden border-t border-[var(--on-dark-border)] px-5 transition-all duration-300 ease-out",
            hover
              ? "max-h-32 py-4 opacity-100"
              : "max-h-0 border-transparent py-0 opacity-0",
          )}
        >
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-gold">
            {project.segmentLabel}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cardTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--on-dark-border)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] text-[var(--on-dark-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
