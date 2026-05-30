import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  /** Always hit the API for portfolio/blog — CDN can lag after publish. */
  useCdn: false,
  perspective: "published",
});
