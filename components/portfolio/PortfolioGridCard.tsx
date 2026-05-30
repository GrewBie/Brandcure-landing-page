"use client";

import { EngagementCounts } from "@/components/engagement/EngagementCounts";
import { WebsiteLivePreview } from "@/components/portfolio/WebsiteLivePreview";
import { isNewContent } from "@/lib/engagement/rank";
import { serviceTypeToSection } from "@/lib/portfolio-nav";
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
  /** Stable index across homepage sections for voice next/prev. */
  globalIndex?: number;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [hover, setHover] = useState(false);
  const isNew = isNewContent(project.createdAt);
  const navSection = serviceTypeToSection(project.serviceType);
  const isWebsite = project.serviceType === "websites";
  const websiteUrl = project.websiteUrl?.trim();

  const cardTags = [
    project.automationSubtypeLabel ?? project.serviceTypeLabel,
    project.segmentLabel,
    ...project.tags,
  ];

  const onMove = (e: React.MouseEvent) => {
    const img = cardRef.current?.querySelector("img");
    if (!cardRef.current || !img) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    (img as HTMLImageElement).style.transform = `scale(1.1) translate(${x * 14}px, ${y * 10}px)`;
  };

  const onLeave = () => {
    setHover(false);
    const img = cardRef.current?.querySelector("img");
    if (img) (img as HTMLImageElement).style.transform = "scale(1)";
  };

  const navProps = {
    "data-nav-id": project.slug,
    "data-nav-section": navSection,
    "data-nav-index": globalIndex ?? index,
    "data-nav-title": project.title,
    "data-nav-result": project.resultHeadline,
    "data-nav-industry": project.segmentLabel,
  };

  if (isWebsite && websiteUrl) {
    return (
      <article
        ref={cardRef}
        {...navProps}
        className="overflow-hidden"
        style={{ background: project.cardBg }}
      >
        <div className="relative">
          {isNew && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-charcoal px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-cream">
              NEW
            </span>
          )}
          <WebsiteLivePreview
            url={websiteUrl}
            title={project.title}
            posterUrl={project.heroImageUrl}
            navId={project.slug}
            aspectClass="h-[210px]"
            imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="px-7 pb-7 pt-5">
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-gold">
            {project.segmentLabel}
          </p>
          <h3 className="font-serif text-[26px] font-medium tracking-[-0.01em] text-brand-black">
            {project.title}
          </h3>
          <p className="mt-1 text-xs tracking-[0.02em] text-gray">
            {project.subtitle}
          </p>
          <EngagementCounts
            likeCount={project.likeCount}
            commentCount={project.commentCount}
            className="mt-3 mb-3"
          />
          <div className="flex flex-wrap gap-1.5">
            {cardTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[rgba(42,44,48,0.07)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] text-charcoal"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            href={`/portfolio/${project.slug}`}
            className="mt-4 inline-flex text-[11px] font-semibold text-charcoal hover:text-gold"
          >
            View details →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Link
      ref={cardRef as React.RefObject<HTMLAnchorElement>}
      href={`/portfolio/${project.slug}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      {...navProps}
      className="block cursor-pointer overflow-hidden"
      style={{ background: project.cardBg }}
    >
      <article>
        <div className="relative h-[210px] overflow-hidden">
          {isNew && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-charcoal px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-cream">
              NEW
            </span>
          )}
          <Image
            src={project.heroImageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform"
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[rgba(17,18,20,0.72)] p-6 transition-opacity duration-[320ms]"
            style={{ opacity: hover ? 1 : 0 }}
          >
            <div className="font-serif text-[46px] font-medium leading-none text-white">
              {project.resultHeadline}
            </div>
            <p className="max-w-[220px] text-center text-xs leading-snug text-[rgba(255,255,255,0.7)]">
              {project.resultDetail}
            </p>
            <span className="mt-2 rounded-full border border-gold px-4 py-1.5 text-[10px] font-bold tracking-[0.08em] text-gold">
              VIEW CASE STUDY →
            </span>
          </div>
        </div>
        <div className="px-7 pb-7 pt-5">
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-gold">
            {project.segmentLabel}
          </p>
          <h3 className="font-serif text-[26px] font-medium tracking-[-0.01em] text-brand-black">
            {project.title}
          </h3>
          <p className="mt-1 text-xs tracking-[0.02em] text-gray">
            {project.subtitle}
          </p>
          <EngagementCounts
            likeCount={project.likeCount}
            commentCount={project.commentCount}
            className="mt-3 mb-3"
          />
          <div className="flex flex-wrap gap-1.5">
            {cardTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[rgba(42,44,48,0.07)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] text-charcoal"
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
