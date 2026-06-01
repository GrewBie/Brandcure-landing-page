import { PortfolioEntryGate } from "@/components/portfolio/PortfolioEntryGate";
import { PortfolioSections } from "@/components/portfolio/PortfolioSections";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { resolvePortfolioProjects } from "@/lib/portfolio/resolve-portfolio-projects";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import {
  PORTFOLIO_INDEX_META_DESCRIPTION,
  PORTFOLIO_INDEX_META_TITLE,
} from "@/lib/seo/descriptions";
import { createMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = createMetadata({
  title: PORTFOLIO_INDEX_META_TITLE,
  description: PORTFOLIO_INDEX_META_DESCRIPTION,
  path: "/portfolio",
});

export default async function PortfolioIndexPage() {
  const projects = await resolvePortfolioProjects();

  return (
    <div className="section-padding pt-[calc(76px+2rem)]">
      <JsonLd
        data={[
          webPageJsonLd({
            name: PORTFOLIO_INDEX_META_TITLE,
            description: PORTFOLIO_INDEX_META_DESCRIPTION,
            path: "/portfolio",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Portfolio", path: "/portfolio" },
          ]),
        ]}
      />
      <Suspense fallback={null}>
        <PortfolioEntryGate />
      </Suspense>
      <div className="container-main">
        <SectionEyebrow>Our work</SectionEyebrow>
        <h1 className="mt-3 font-serif text-[clamp(2.25rem,4vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.02em] text-brand-black">
          Portfolio
        </h1>
        <p className="mt-4 max-w-xl text-sm text-gray">
          AI creatives, business automations, and websites — browse by section
          or just use your voice. Best performers and newest projects first.
        </p>
        <PortfolioSections projects={projects} />
        <Link
          href="/#portfolio"
          className="mt-12 inline-block text-sm font-medium text-foreground hover:text-gold"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
