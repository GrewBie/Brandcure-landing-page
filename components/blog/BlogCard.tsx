"use client";

import { EngagementCounts } from "@/components/engagement/EngagementCounts";
import { isNewContent } from "@/lib/engagement/rank";
import type { BlogPost } from "@/types/content";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogCard({
  post,
  variant = "compact",
}: {
  post: BlogPost;
  variant?: "featured" | "compact" | "list";
}) {
  const [hover, setHover] = useState(false);
  const isNew = isNewContent(post.publishedAt);

  if (variant === "featured") {
    return (
      <article
        className="group flex h-full min-h-0 flex-col overflow-hidden bg-warm-white"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link href={`/blog/${post.slug}`} className="flex h-full min-h-0 flex-col">
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden lg:aspect-auto lg:min-h-[280px] lg:flex-1">
            {isNew && <NewBadge />}
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500"
              style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
            />
            <HoverOverlay label="READ ARTICLE →" visible={hover} large />
          </div>
          <BlogCardBody post={post} large />
        </Link>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article
        className="group overflow-hidden bg-warm-white"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,280px)_1fr]"
        >
          <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[200px]">
            {isNew && <NewBadge />}
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              sizes="280px"
              className="object-cover transition-transform duration-500"
              style={{ transform: hover ? "scale(1.05)" : "scale(1)" }}
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <BlogCardMeta post={post} />
            <h3 className="mt-2 font-serif text-2xl font-medium text-brand-black">
              {post.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray">
              {post.excerpt}
            </p>
            <EngagementCounts
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              className="mt-4"
            />
            <time
              dateTime={post.publishedAt}
              className="mt-3 text-[11px] text-light-gray"
            >
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className="group flex h-full min-h-0 flex-col overflow-hidden bg-warm-white"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/blog/${post.slug}`} className="flex h-full min-h-0 flex-col">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-[4/3] lg:aspect-[16/11]">
          {isNew && <NewBadge />}
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500"
            style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
          />
          <HoverOverlay label="READ →" visible={hover} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-5 md:p-6">
          <BlogCardMeta post={post} />
          <h3
            className="font-serif text-lg font-medium leading-snug text-brand-black transition-transform duration-300 lg:text-xl"
            style={{ transform: hover ? "translateX(4px)" : "none" }}
          >
            {post.title}
          </h3>
          <EngagementCounts
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            className="mt-3"
          />
          <time
            dateTime={post.publishedAt}
            className="mt-auto pt-3 text-[11px] tracking-[0.04em] text-light-gray"
          >
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </Link>
    </article>
  );
}

function NewBadge() {
  return (
    <span className="absolute left-3 top-3 z-10 rounded-full bg-charcoal px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-cream">
      NEW
    </span>
  );
}

function HoverOverlay({
  label,
  visible,
  large,
}: {
  label: string;
  visible: boolean;
  large?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[rgba(17,18,20,0.5)] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <span
        className={
          large
            ? "rounded-full border border-[rgba(255,255,255,0.45)] px-[18px] py-1.5 text-[11px] font-bold tracking-[0.08em] text-[rgba(255,255,255,0.95)]"
            : "rounded-full border border-[rgba(255,255,255,0.45)] px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-[rgba(255,255,255,0.95)] lg:px-[18px] lg:text-[11px]"
        }
      >
        {label}
      </span>
    </div>
  );
}

function BlogCardMeta({ post }: { post: BlogPost }) {
  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold tracking-[0.1em] text-gold">
        {post.category}
      </span>
      <span className="text-[10px] text-light-gray">·</span>
      <span className="text-[10px] text-gray">{post.readTime} min</span>
    </div>
  );
}

function BlogCardBody({ post, large }: { post: BlogPost; large?: boolean }) {
  return (
    <div className="shrink-0 p-6 md:p-8 lg:p-9">
      <BlogCardMeta post={post} />
      <h3
        className={
          large
            ? "font-serif text-2xl font-medium leading-tight text-brand-black md:text-[28px] lg:text-[30px]"
            : "font-serif text-lg font-medium text-brand-black"
        }
      >
        {post.title}
      </h3>
      {large && (
        <p className="mb-4 mt-3 line-clamp-3 text-sm leading-[1.75] text-gray lg:line-clamp-4">
          {post.excerpt}
        </p>
      )}
      <EngagementCounts
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        className="mb-3"
      />
      <time
        dateTime={post.publishedAt}
        className="text-[11px] tracking-[0.04em] text-light-gray"
      >
        {formatDate(post.publishedAt)}
      </time>
    </div>
  );
}
