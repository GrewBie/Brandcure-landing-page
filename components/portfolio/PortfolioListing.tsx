"use client";

import { PortfolioGridCard } from "@/components/portfolio/PortfolioGridCard";
import { Reveal } from "@/components/ui/Reveal";
import {
  PORTFOLIO_SEGMENTS,
  PORTFOLIO_SERVICE_TYPES,
} from "@/lib/content/portfolio-labels";
import { cn } from "@/lib/cn";
import type {
  PortfolioProject,
  PortfolioSegment,
  PortfolioServiceType,
} from "@/types/content";
import { useMemo, useState } from "react";

type ServiceFilter = "all" | PortfolioServiceType;
type SegmentFilter = "all" | PortfolioSegment;

export function PortfolioListing({ projects }: { projects: PortfolioProject[] }) {
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchService =
          serviceFilter === "all" || p.serviceType === serviceFilter;
        const matchSegment =
          segmentFilter === "all" || p.segment === segmentFilter;
        return matchService && matchSegment;
      }),
    [projects, serviceFilter, segmentFilter],
  );

  if (projects.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-gray">
        No portfolio projects published yet.
      </p>
    );
  }

  const serviceFilters: { id: ServiceFilter; label: string }[] = [
    { id: "all", label: "All Work" },
    ...PORTFOLIO_SERVICE_TYPES.map((s) => ({ id: s.value, label: s.title })),
  ];

  const segmentFilters: { id: SegmentFilter; label: string }[] = [
    { id: "all", label: "All Segments" },
    ...PORTFOLIO_SEGMENTS.map((s) => ({ id: s.value, label: s.title })),
  ];

  return (
    <>
      <div className="mt-10 flex flex-col gap-3">
        <FilterRow
          label="Work type"
          filters={serviceFilters}
          active={serviceFilter}
          onSelect={setServiceFilter}
        />
        <FilterRow
          label="Client segment"
          filters={segmentFilters}
          active={segmentFilter}
          onSelect={setSegmentFilter}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-12 grid-border grid-border-3">
          {filtered.map((project, i) => (
            <Reveal key={project._id} delay={i * 0.05}>
              <PortfolioGridCard project={project} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-gray">
          No projects match these filters.
        </p>
      )}
    </>
  );
}

function FilterRow<T extends string>({
  label,
  filters,
  active,
  onSelect,
}: {
  label: string;
  filters: { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gray">
        {label}
      </p>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={label}>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active === f.id}
            onClick={() => onSelect(f.id)}
            className={cn(
              "filter-pill min-h-[44px] rounded-full border border-[var(--border-mid)] px-4 py-2 text-[11px] font-semibold tracking-[0.05em]",
              active === f.id ? "on" : "text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
