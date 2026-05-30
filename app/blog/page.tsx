import { BlogListing } from "@/components/blog/BlogListing";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { getBlogPosts } from "@/lib/sanity/fetch";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Insights & Articles | BrandCure",
  description:
    "AI marketing, automation, and growth insights for Indian SMBs, startups, and growing brands.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="section-padding pt-[calc(76px+2rem)]">
      <JsonLd
        data={[
          webPageJsonLd({
            name: "BrandCure Blog",
            description: "AI marketing, automation, and growth insights.",
            path: "/blog",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <div className="container-main">
        <SectionEyebrow>Insights</SectionEyebrow>
        <h1 className="mt-3 font-serif text-[clamp(2.25rem,4vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.02em] text-brand-black">
          All articles
        </h1>
        <p className="mt-4 max-w-xl text-sm text-gray">
          Sorted by engagement and recency — popular and new posts rise to the
          top.
        </p>
        <BlogListing posts={posts} />
        <Link
          href="/#blog"
          className="mt-12 inline-block text-sm font-medium text-charcoal hover:text-gold"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
