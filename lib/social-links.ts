export type SocialNetwork = "facebook" | "instagram" | "linkedin" | "x";

export type SocialLink = {
  network: SocialNetwork;
  label: string;
  href: string;
};

/** BrandCure social profiles (custom subdomains). */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    network: "facebook",
    label: "BrandCure on Facebook",
    href: "https://facebook.brandcure.in",
  },
  {
    network: "instagram",
    label: "BrandCure on Instagram",
    href: "https://instagram.brandcure.in",
  },
  {
    network: "linkedin",
    label: "BrandCure on LinkedIn",
    href: "https://linkedin.brandcure.in",
  },
  {
    network: "x",
    label: "BrandCure on X",
    href: "https://x.brandcure.in",
  },
];

export const SOCIAL_PROFILE_URLS = SOCIAL_LINKS.map((s) => s.href);
