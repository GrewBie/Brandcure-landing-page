"use client";

import { BlogCard } from "@/components/blog/BlogCard";
import { Reveal } from "@/components/ui/Reveal";
import type { BlogPost } from "@/types/content";

export function BlogListing({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-gray">
        No articles published yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="mt-12 space-y-px bg-[var(--border)]">
      {posts.map((post, i) => (
        <Reveal key={post._id} delay={i * 0.05}>
          <BlogCard post={post} variant="list" />
        </Reveal>
      ))}
    </div>
  );
}
