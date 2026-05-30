import type { StructureResolver } from "sanity/structure";

const HIDDEN_FROM_DEFAULT = new Set([
  "websiteProject",
  "automationProject",
  "creativeProject",
  "portfolioProject",
  "siteSettings",
]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("BrandCure")
    .items([
      S.listItem()
        .title("Website Portfolio")
        .schemaType("websiteProject")
        .child(
          S.documentTypeList("websiteProject").title("Website projects"),
        ),
      S.listItem()
        .title("AI Automations")
        .schemaType("automationProject")
        .child(
          S.documentTypeList("automationProject").title("Automation projects"),
        ),
      S.listItem()
        .title("AI Video Ads")
        .schemaType("creativeProject")
        .child(
          S.documentTypeList("creativeProject").title("AI video ads"),
        ),
      S.divider(),
      S.listItem()
        .title("Legacy portfolio (deprecated)")
        .schemaType("portfolioProject")
        .child(
          S.documentTypeList("portfolioProject").title(
            "Legacy — migrate to typed projects",
          ),
        ),
      S.listItem()
        .title("Site Settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT.has(item.getId() ?? ""),
      ),
    ]);
