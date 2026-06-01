import { Blog } from "@/components/sections/Blog";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { LeadCapture } from "@/components/sections/LeadCapture";
import { Marquee } from "@/components/sections/Marquee";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { WhyBrandCure } from "@/components/sections/WhyBrandCure";
import { JsonLd } from "@/components/seo/JsonLd";
import { pickMixedHomePortfolioPreview } from "@/lib/portfolio/home-preview";
import { resolveHomePortfolioProjects } from "@/lib/portfolio/resolve-portfolio-projects";
import { homePageJsonLdGraph } from "@/lib/seo/json-ld";
import {
  HOME_META_DESCRIPTION,
  HOME_META_TITLE,
} from "@/lib/seo/descriptions";
import { createMetadata } from "@/lib/seo/metadata";
import { getBlogPosts } from "@/lib/sanity/fetch";

export const metadata = createMetadata({
  title: HOME_META_TITLE,
  description: HOME_META_DESCRIPTION,
  path: "/",
});

export default async function Home() {
  const [allProjects, posts] = await Promise.all([
    resolveHomePortfolioProjects(),
    getBlogPosts(),
  ]);
  const previewProjects = pickMixedHomePortfolioPreview(allProjects, 3);

  return (
    <>
      <JsonLd data={homePageJsonLdGraph()} />
      <Hero />
      <Services />
      <Marquee />
      <WhyBrandCure />
      <Process />
      <Portfolio
        allProjects={allProjects}
        previewProjects={previewProjects}
      />
      <Blog posts={posts} />
      <Faq />
      <LeadCapture />
    </>
  );
}
