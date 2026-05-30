import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { dataset, projectId } from "./sanity/env";

export default defineConfig({
  name: "brandcure",
  title: "BrandCure",
  projectId: projectId || "your-project-id",
  dataset,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
