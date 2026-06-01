import { SITE_NAME, SITE_URL } from "@/lib/seo/constants";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Your AI-native digital partner",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#2A2C30",
    icons: [
      {
        src: "/icon-48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    id: SITE_URL,
  };
}
