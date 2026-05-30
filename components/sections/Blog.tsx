"use client";

import { BlogCard } from "@/components/blog/BlogCard";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { ViewMoreLink } from "@/components/ui/ViewMoreLink";
import { cn } from "@/lib/cn";
import type { BlogPost } from "@/types/content";

const HOME_PREVIEW_COUNT = 3;

export function Blog({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  const preview = posts.slice(0, HOME_PREVIEW_COUNT);
  const [featured, ...rest] = preview;
  const showViewMore = posts.length > 0;

  return (
    <section
      id="blog"
      className="section-padding bg-cream"
      aria-labelledby="blog-heading"
    >
      <div className="container-main">
        <Reveal>
          <SectionEyebrow>Insights</SectionEyebrow>
          <h2
            id="blog-heading"
            className="font-serif text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.02em] text-brand-black"
          >
            Ideas worth reading.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-gray">
            Top articles by engagement — newest and most discussed first.
          </p>
        </Reveal>

        <div
          className={cn(
            "mt-12 grid gap-px bg-[var(--border)]",
            "grid-cols-1 items-stretch",
            "md:grid-cols-2",
            rest.length >= 2
              ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
              : "lg:grid-cols-2",
          )}
        >
          {featured && (
            <Reveal className="h-full md:col-span-2 lg:col-span-1">
              <BlogCard post={featured} variant="featured" />
            </Reveal>
          )}
          {rest.map((post, i) => (
            <Reveal key={post._id} delay={(i + 1) * 0.09} className="h-full min-h-0">
              <BlogCard post={post} variant="compact" />
            </Reveal>
          ))}
        </div>

        {showViewMore && <ViewMoreLink href="/blog" label="VIEW MORE ARTICLES" />}
      </div>
    </section>
  );
}
