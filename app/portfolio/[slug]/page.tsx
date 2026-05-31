import { EngagementPanel } from "@/components/engagement/EngagementPanel";
import { PortfolioDetailMedia } from "@/components/portfolio/PortfolioDetailMedia";
import { WebsiteLivePreview } from "@/components/portfolio/WebsiteLivePreview";
import { PortableTextContent } from "@/components/portable/PortableTextContent";
import { getPortfolioBySlug, getPortfolioSlugs } from "@/lib/sanity/fetch";
import {
  isAiBreakdownBlob,
  isNearDuplicate,
  portfolioDetailSubtitle,
  portfolioDisplayTitle,
} from "@/lib/portfolio/display-copy";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  creativeWorkJsonLd,
} from "@/lib/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioBySlug(slug);
  if (!project) return { title: "Project not found" };
  const displayTitle = portfolioDisplayTitle(project.title);
  return createMetadata({
    title: `${displayTitle} | BrandCure Portfolio`,
    description:
      project.websiteDetails ||
      project.adDescription ||
      project.resultDetail ||
      project.subtitle,
    path: `/portfolio/${slug}`,
    image: project.heroImageUrl,
    imageAlt: displayTitle,
  });
}

export default async function PortfolioProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPortfolioBySlug(slug);
  if (!project) notFound();

  const displayTitle = portfolioDisplayTitle(project.title);
  const subtitle = portfolioDetailSubtitle(project.title, project.subtitle);
  const bodyCopy =
    project.serviceType === "websites"
      ? project.websiteDetails || project.resultDetail
      : project.serviceType === "ai-ads"
        ? project.adDescription || project.resultDetail
        : project.resultDetail;

  const showResultHeadline =
    project.resultHeadline.trim() &&
    !isAiBreakdownBlob(project.resultHeadline) &&
    !isNearDuplicate(project.resultHeadline, project.title) &&
    !isNearDuplicate(project.resultHeadline, displayTitle) &&
    !isNearDuplicate(project.resultHeadline, subtitle ?? "");

  const showBodyCopy =
    bodyCopy.trim() &&
    !isNearDuplicate(bodyCopy, project.title) &&
    !isNearDuplicate(bodyCopy, subtitle ?? "") &&
    (!showResultHeadline || !isNearDuplicate(bodyCopy, project.resultHeadline));

  return (
    <article className="section-padding pt-[calc(76px+2rem)]">
      <JsonLd
        data={[
          creativeWorkJsonLd(project, slug),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Portfolio", path: "/portfolio" },
            { name: displayTitle, path: `/portfolio/${slug}` },
          ]),
        ]}
      />
      <div className="container-main">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold tracking-[0.08em]">
              <span className="font-bold uppercase tracking-[0.12em] text-gold">
                {project.segmentLabel}
              </span>
              <span className="text-[var(--light-gray)]" aria-hidden>
                ·
              </span>
              <span className="text-foreground">
                {project.automationSubtypeLabel ?? project.serviceTypeLabel}
              </span>
            </div>
            <h1 className="max-w-3xl font-serif text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.025em] text-brand-black">
              {displayTitle}
            </h1>
            {subtitle && (
              <p className="max-w-2xl text-sm leading-relaxed text-gray">
                {subtitle}
              </p>
            )}
          </header>

          {project.serviceType === "websites" && project.websiteUrl ? (
            <WebsiteLivePreview
              url={project.websiteUrl}
              title={displayTitle}
              aspectClass="h-[min(88vh,980px)] w-full"
            />
          ) : (
            <PortfolioDetailMedia project={project} />
          )}

          {(showResultHeadline || showBodyCopy || project.tags.length > 0) && (
            <div className="mt-10 max-w-3xl space-y-6 border-t border-[var(--border)] pt-10">
              {showResultHeadline && (
                <p className="font-serif text-2xl leading-snug text-foreground">
                  {project.resultHeadline}
                </p>
              )}
              {showBodyCopy && (
                <p className="text-sm leading-[1.85] text-gray">{bodyCopy}</p>
              )}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {project.serviceType === "automation" && (
            <div className="mt-10 max-w-3xl">
              <PortableTextContent value={project.body} />
            </div>
          )}
          {project.serviceType === "automation" && !project.body?.length && (
            <p className="mt-10 max-w-3xl rounded-lg border border-[var(--border)] bg-warm-white p-6 text-sm text-gray">
              Add the automation case study in Sanity Studio to publish the full
              story.
            </p>
          )}

          <EngagementPanel
            contentType="portfolio"
            contentId={project._id}
            initialLikeCount={project.likeCount}
            initialCommentCount={project.commentCount}
          />

          <div className="mt-10 flex flex-wrap gap-6 border-t border-[var(--border)] pt-8 text-sm">
            <Link
              href="/portfolio"
              className="font-medium text-foreground hover:text-gold"
            >
              ← All projects
            </Link>
            <Link
              href="/#portfolio"
              className="font-medium text-foreground hover:text-gold"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
