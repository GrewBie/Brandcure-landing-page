"use client";

import type { NavigatorSection } from "@/types/navigator";
import type { PortfolioProject } from "@/types/content";
import Image from "next/image";
import Link from "next/link";

type Props = {
  project: PortfolioProject;
  section: NavigatorSection;
  index: number;
};

export function WebsiteCard({ project, section, index }: Props) {
  return (
    <article
      data-nav-id={project.slug}
      data-nav-section={section}
      data-nav-index={index}
      data-nav-title={project.title}
      data-nav-result={project.resultHeadline}
      data-nav-industry={project.segmentLabel}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-warm-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-cream">
        <Image
          src={project.heroImageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 rounded-full bg-warm-white/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.06em] text-charcoal shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-gold hover:text-white"
          >
            VISIT SITE ↗
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gold">
          {project.segmentLabel}
        </p>
        <h3 className="mt-1.5 font-serif text-[22px] font-medium leading-tight text-brand-black">
          {project.title}
        </h3>
        <p className="mt-1 text-xs text-gray">{project.subtitle}</p>
        <p className="mt-3 font-serif text-lg text-charcoal">
          {project.resultHeadline}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {[project.serviceTypeLabel, ...project.tags].map((tag) => (
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
          className="mt-4 inline-flex items-center text-[12px] font-semibold text-charcoal hover:text-gold"
        >
          View full case study →
        </Link>
      </div>
    </article>
  );
}
