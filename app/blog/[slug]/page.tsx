import { EngagementPanel } from "@/components/engagement/EngagementPanel";
import { PortableTextContent } from "@/components/portable/PortableTextContent";
import { getBlogBySlug, getBlogSlugs } from "@/lib/sanity/fetch";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return { title: "Post not found" };
  return createMetadata({
    title: `${post.title} | BrandCure`,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.coverImageUrl,
    imageAlt: post.title,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) notFound();

  return (
    <article className="section-padding pt-[calc(76px+2rem)]">
      <JsonLd
        data={[
          blogPostingJsonLd(post, slug),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />
      <div className="container-lead">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
          {post.category}
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.02em] text-brand-black md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-gray">
          {formatDate(post.publishedAt)} · {post.readTime} min read
        </p>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
        </div>
        <p className="mt-8 text-lg font-light leading-relaxed text-gray">
          {post.excerpt}
        </p>
        <PortableTextContent value={post.body} />
        {!post.body?.length && (
          <p className="mt-8 rounded-lg border border-[var(--border)] bg-warm-white p-6 text-sm text-gray">
            Add body content in Sanity Studio to publish the full article.
          </p>
        )}

        <EngagementPanel
          contentType="blog"
          contentId={post._id}
          initialLikeCount={post.likeCount}
          initialCommentCount={post.commentCount}
        />

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Link
            href="/blog"
            className="font-medium text-charcoal hover:text-gold"
          >
            ← All articles
          </Link>
          <Link href="/#blog" className="font-medium text-charcoal hover:text-gold">
            Back to home
          </Link>
        </div>
      </div>
    </article>
  );
}
