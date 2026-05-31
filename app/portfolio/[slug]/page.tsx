import { EngagementPanel } from "@/components/engagement/EngagementPanel";
import { PortfolioDetailExtras } from "@/components/portfolio/PortfolioDetailExtras";
import { WebsiteLivePreview } from "@/components/portfolio/WebsiteLivePreview";
import { PortableTextContent } from "@/components/portable/PortableTextContent";
import { getPortfolioBySlug, getPortfolioSlugs } from "@/lib/sanity/fetch";
import Image from "next/image";
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
  return createMetadata({
    title: `${project.title} | BrandCure Portfolio`,
    description:
      project.websiteDetails ||
      project.adDescription ||
      project.resultDetail ||
      project.subtitle,
    path: `/portfolio/${slug}`,
    image: project.heroImageUrl,
    imageAlt: project.title,
  });
}

export default async function PortfolioProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPortfolioBySlug(slug);
  if (!project) notFound();

  return (
    <article className="section-padding pt-[calc(76px+2rem)]">
      <JsonLd
        data={[
          creativeWorkJsonLd(project, slug),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Portfolio", path: "/portfolio" },
            { name: project.title, path: `/portfolio/${slug}` },
          ]),
        ]}
      />
      <div className="container-main">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
          {project.segmentLabel}
        </p>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.08em] text-charcoal">
          {project.automationSubtypeLabel ?? project.serviceTypeLabel}
        </p>
        <h1 className="mt-4 max-w-2xl font-serif text-5xl font-medium tracking-[-0.025em] text-brand-black">
          {project.title}
        </h1>
        <p className="mt-2 text-sm text-gray">{project.subtitle}</p>
        <p className="mt-6 font-serif text-3xl text-charcoal">
          {project.resultHeadline}
        </p>
        <p className="mt-3 max-w-xl text-gray">
          {project.serviceType === "websites"
            ? project.websiteDetails || project.resultDetail
            : project.serviceType === "ai-ads"
              ? project.adDescription || project.resultDetail
              : project.resultDetail}
        </p>
        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[rgba(42,44,48,0.07)] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-charcoal"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {project.serviceType === "websites" && project.websiteUrl ? (
          <div className="mt-12 max-w-4xl">
            <WebsiteLivePreview
              url={project.websiteUrl}
              title={project.title}
              aspectClass="aspect-[16/10] min-h-[420px] w-full"
            />
          </div>
        ) : (
          <div className="relative mt-12 aspect-[16/9] max-w-4xl overflow-hidden rounded-lg">
            <Image
              src={project.heroImageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 900px"
              priority
            />
          </div>
        )}
        <PortfolioDetailExtras project={project} />
        {project.serviceType === "automation" && (
          <PortableTextContent value={project.body} />
        )}
        {project.serviceType === "automation" && !project.body?.length && (
          <p className="mt-10 max-w-[720px] rounded-lg border border-[var(--border)] bg-warm-white p-6 text-sm text-gray">
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

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Link
            href="/portfolio"
            className="font-medium text-charcoal hover:text-gold"
          >
            ← All projects
          </Link>
          <Link
            href="/#portfolio"
            className="font-medium text-charcoal hover:text-gold"
          >
            Back to home
          </Link>
        </div>
      </div>
    </article>
  );
}
