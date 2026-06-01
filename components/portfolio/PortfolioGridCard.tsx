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
import { parseVideoUrl } from "@/lib/video/embed";
import type { PortfolioProject } from "@/types/content";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

export function PortfolioGridCard({
  project,
  index = 0,
  globalIndex,
}: {
  project: PortfolioProject;
  index?: number;
  globalIndex?: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [hover, setHover] = useState(false);
  const isNew = isNewContent(project.createdAt);
  const navSection = serviceTypeToSection(project.serviceType);

  const videoUrl = getProjectPreviewVideoUrl(project);
  const parsed = parseVideoUrl(videoUrl);
  const hasVideo = parsed.provider !== "none";
  const isDriveOrEmbed =
    hasVideo && parsed.provider !== "none" && parsed.provider !== "file";

  const displayTitle = portfolioDisplayTitle(project.title);
  const imageAlt = `${displayTitle} — ${project.serviceTypeLabel} case study preview`;
  const thumbSrc = getProjectCardThumbnail(project);

  const cardTags = [
    project.automationSubtypeLabel ?? project.serviceTypeLabel,
    project.segmentLabel,
    ...project.tags,
  ];

  const moveRaf = useRef(0);
  const onMove = (e: React.MouseEvent) => {
    if (!hover || hasVideo) return;
    if (moveRaf.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    moveRaf.current = window.requestAnimationFrame(() => {
      moveRaf.current = 0;
      const img = cardRef.current?.querySelector("[data-card-thumb]");
      if (!cardRef.current || !img) return;
      const r = cardRef.current.getBoundingClientRect();
      const x = (clientX - r.left) / r.width - 0.5;
      const y = (clientY - r.top) / r.height - 0.5;
      (img as HTMLElement).style.transform = `scale(1.08) translate(${x * 12}px, ${y * 8}px)`;
    });
  };

  const onLeave = () => {
    if (moveRaf.current) {
      window.cancelAnimationFrame(moveRaf.current);
      moveRaf.current = 0;
    }
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

          <Image
            data-card-thumb
            src={thumbSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 ease-out will-change-transform"
          />

          {hasVideo && (
            <span
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[rgba(17,18,20,0.2)]"
              aria-hidden
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/90 text-lg text-white shadow-md">
                ▶
              </span>
            </span>
          )}

          {hover && hasVideo && !isDriveOrEmbed && project.subtitle.trim() && (
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
