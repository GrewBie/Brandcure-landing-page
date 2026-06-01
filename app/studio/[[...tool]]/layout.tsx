import type { Metadata } from "next";

export { viewport } from "next-sanity/studio";

/** CMS UI must not compete with public pages in search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: "Sanity Studio",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
