import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  /** CDN can lag a few seconds right after publish; API is fresher */
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
});
