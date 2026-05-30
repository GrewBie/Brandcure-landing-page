"use client";

import { PortfolioGridCard } from "@/components/portfolio/PortfolioGridCard";
import { RegisterNavCatalog } from "@/components/portfolio/RegisterNavCatalog";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ViewMoreLink } from "@/components/ui/ViewMoreLink";
import {
  SECTION_LABEL,
  SECTION_ORDER,
  serviceTypeToSection,
} from "@/lib/portfolio-nav";
import type { PortfolioProject } from "@/types/content";

const PER_SECTION = 3;

export function Portfolio({
  allProjects,
  previewProjects,
}: {
  /** Full Sanity catalog for voice/chat navigation on the homepage. */
  allProjects: PortfolioProject[];
  /** Mixed slice shown in the grid (3 websites, 3 automations, 3 creatives). */
  previewProjects: PortfolioProject[];
}) {
  if (previewProjects.length === 0 && allProjects.length === 0) return null;

  const catalogSource =
    allProjects.length > 0 ? allProjects : previewProjects;

  const grouped = SECTION_ORDER.map((section) => ({
    section,
    label: SECTION_LABEL[section],
    projects: previewProjects.filter(
      (p) => serviceTypeToSection(p.serviceType) === section,
    ),
  })).filter((g) => g.projects.length > 0);

  return (
    <section
      id="portfolio"
      className="section-padding bg-cream"
      aria-labelledby="portfolio-heading"
    >
      <div className="container-main">
        <RegisterNavCatalog projects={catalogSource} />
        <Reveal>
          <div className="mb-12">
            <SectionEyebrow>Our work</SectionEyebrow>
            <h2
              id="portfolio-heading"
              className="font-serif text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.02em] text-brand-black"
            >
              Results,
              <br />
              <em className="italic text-gray">not promises.</em>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-gray">
              Live work from our studio — AI creatives, automations, and websites.
              Three highlights from each pillar; Neha can walk you through the full
              portfolio in chat.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-14">
          {grouped.map(({ section, label, projects }, groupIndex) => (
            <div
              key={section}
              data-nav-section={section}
              data-nav-title={label}
              className="scroll-mt-24"
            >
              <Reveal delay={groupIndex * 0.05}>
                <h3 className="mb-6 font-serif text-2xl font-medium text-brand-black">
                  {label}
                </h3>
              </Reveal>
              <div className="grid-border grid-border-3">
                {projects.map((project, i) => (
                  <Reveal
                    key={project._id}
                    delay={groupIndex * 0.07 + i * 0.05}
                  >
                    <PortfolioGridCard
                      project={project}
                      index={i}
                      globalIndex={
                        SECTION_ORDER.indexOf(section) * PER_SECTION + i
                      }
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>

        <ViewMoreLink href="/portfolio?entry=see-work" label="SEE OUR WORK" />

        <Reveal>
          <p className="mt-5 text-center text-xs text-gray">
            Open chat (✦) for a voice tour with Neha · Full case studies on the
            portfolio page
          </p>
        </Reveal>
      </div>
    </section>
  );
}
