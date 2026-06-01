import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { pickMixedHomePortfolioPreview } from "@/lib/portfolio/home-preview";
import { resolveHomePortfolioProjects } from "@/lib/portfolio/resolve-portfolio-projects";
import {
  HOME_META_DESCRIPTION,
  HOME_META_TITLE,
} from "@/lib/seo/descriptions";
import { createMetadata } from "@/lib/seo/metadata";
import { getBlogPosts } from "@/lib/sanity/fetch";
import dynamic from "next/dynamic";

const Marquee = dynamic(() =>
  import("@/components/sections/Marquee").then((m) => ({ default: m.Marquee })),
);
const WhyBrandCure = dynamic(() =>
  import("@/components/sections/WhyBrandCure").then((m) => ({
    default: m.WhyBrandCure,
  })),
);
const Process = dynamic(() =>
  import("@/components/sections/Process").then((m) => ({ default: m.Process })),
);
const Portfolio = dynamic(() =>
  import("@/components/sections/Portfolio").then((m) => ({
    default: m.Portfolio,
  })),
);
const Blog = dynamic(() =>
  import("@/components/sections/Blog").then((m) => ({ default: m.Blog })),
);
const Faq = dynamic(() =>
  import("@/components/sections/Faq").then((m) => ({ default: m.Faq })),
);
const LeadCapture = dynamic(() =>
  import("@/components/sections/LeadCapture").then((m) => ({
    default: m.LeadCapture,
  })),
);

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
