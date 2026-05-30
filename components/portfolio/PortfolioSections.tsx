"use client";

import { RegisterNavCatalog } from "@/components/portfolio/RegisterNavCatalog";
import { VideoCard } from "@/components/portfolio/VideoCard";
import { WebsiteCard } from "@/components/portfolio/WebsiteCard";
import { Reveal } from "@/components/ui/Reveal";
import { browserNav } from "@/lib/browser-navigator";
import { cn } from "@/lib/cn";
import { NAV_EVENTS } from "@/hooks/useVoiceNavigator";
import {
  SECTION_LABEL,
  SECTION_ORDER,
  sectionToServiceType,
} from "@/lib/portfolio-nav";
import type { NavigatorSection } from "@/types/navigator";
import type { PortfolioProject } from "@/types/content";
import { useEffect, useMemo, useState } from "react";

const SECTION_BLURB: Record<NavigatorSection, string> = {
  creatives: "AI-generated video ads & creatives that convert.",
  automations: "AI & agentic systems that run the busywork for you.",
  websites: "Conversion-first websites shipped in days.",
};

function previewVideoUrl(project: PortfolioProject): string | undefined {
  if (project.previewVideoUrl) return project.previewVideoUrl;
  if (project.serviceType === "ai-ads" && project.adVideos?.length) {
    return project.adVideos[0]?.videoUrl;
  }
  if (project.serviceType === "automation") return project.demoVideoUrl;
  return undefined;
}

export function PortfolioSections({
  projects,
}: {
  projects: PortfolioProject[];
}) {
  const [industry, setIndustry] = useState<string>("all");

  const grouped = useMemo(() => {
    const map: Record<NavigatorSection, PortfolioProject[]> = {
      creatives: [],
      automations: [],
      websites: [],
    };
    for (const project of projects) {
      const serviceType = project.serviceType;
      const section = SECTION_ORDER.find(
        (s) => sectionToServiceType(s) === serviceType,
      );
      if (section) map[section].push(project);
    }
    return map;
  }, [projects]);

  const websiteIndustries = useMemo(() => {
    const set = new Set<string>();
    grouped.websites.forEach((p) => set.add(p.segmentLabel));
    return Array.from(set);
  }, [grouped.websites]);

  // Voice-driven filter / reset.
  useEffect(() => {
    const onFilter = (e: Event) => {
      const detail = (e as CustomEvent<{ industry?: string }>).detail;
      if (!detail?.industry) return;
      const match = websiteIndustries.find(
        (i) => i.toLowerCase() === detail.industry?.toLowerCase(),
      );
      setIndustry(match ?? "all");
    };
    const onShowAll = (e: Event) => {
      const detail = (e as CustomEvent<{ section?: NavigatorSection }>).detail;
      if (!detail?.section || detail.section === "websites") setIndustry("all");
    };
    window.addEventListener(NAV_EVENTS.filterIndustry, onFilter);
    window.addEventListener(NAV_EVENTS.showAll, onShowAll);
    return () => {
      window.removeEventListener(NAV_EVENTS.filterIndustry, onFilter);
      window.removeEventListener(NAV_EVENTS.showAll, onShowAll);
    };
  }, [websiteIndustries]);

  const activeSections = SECTION_ORDER.filter((s) => grouped[s].length > 0);
  if (activeSections.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-gray">
        No portfolio projects published yet.
      </p>
    );
  }

  return (
    <>
      <RegisterNavCatalog projects={projects} />

      <div className="mt-6 rounded-[16px] border border-gold/40 bg-[rgba(196,162,106,0.08)] p-4">
        <p className="text-[13px] text-charcoal">
          <span className="font-semibold">Try voice —</span> open chat (bottom
          right), tap the gold <strong>Talk</strong> button, and say{" "}
          <em>“show me the AI ads”</em> or <em>“play the first video.”</em> You
          can also press spacebar while the call is active.
        </p>
      </div>

      {/* Sticky mini-nav */}
      <nav
        aria-label="Portfolio sections"
        className="sticky top-[76px] z-30 -mx-2 mt-8 flex gap-2 overflow-x-auto bg-cream/85 px-2 py-2 backdrop-blur"
      >
        {activeSections.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => browserNav.scrollToSection(section)}
            className="whitespace-nowrap rounded-full border border-[var(--border-mid)] px-4 py-2 text-[11px] font-semibold tracking-[0.05em] text-charcoal transition-colors hover:bg-charcoal hover:text-white"
          >
            {SECTION_LABEL[section]} · {grouped[section].length}
          </button>
        ))}
      </nav>

      {activeSections.map((section) => {
        const items =
          section === "websites" && industry !== "all"
            ? grouped[section].filter((p) => p.segmentLabel === industry)
            : grouped[section];

        return (
          <section
            key={section}
            data-nav-section={section}
            data-nav-title={SECTION_LABEL[section]}
            className="scroll-mt-[128px] pt-14"
          >
            <Reveal>
              <h2 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.02em] text-brand-black">
                {SECTION_LABEL[section]}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-gray">
                {SECTION_BLURB[section]}
              </p>
            </Reveal>

            {section === "websites" && websiteIndustries.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {["all", ...websiteIndustries].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIndustry(opt)}
                    className={cn(
                      "filter-pill min-h-[40px] rounded-full border border-[var(--border-mid)] px-4 py-2 text-[11px] font-semibold tracking-[0.05em]",
                      industry === opt ? "on" : "text-charcoal",
                    )}
                  >
                    {opt === "all" ? "All Industries" : opt}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((project, index) => {
                const video = previewVideoUrl(project);
                return (
                  <Reveal key={project._id} delay={index * 0.05}>
                    {section === "websites" || !video ? (
                      <WebsiteCard
                        project={project}
                        section={section}
                        index={index}
                      />
                    ) : (
                      <VideoCard
                        project={project}
                        section={section}
                        index={index}
                        videoUrl={video}
                      />
                    )}
                  </Reveal>
                );
              })}
            </div>

            {items.length === 0 && (
              <p className="mt-8 text-sm text-gray">
                No projects match this filter.
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}
