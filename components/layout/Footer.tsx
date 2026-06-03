import { SOCIAL_ICON_COMPONENTS } from "@/components/icons/SocialIcons";
import { Logo } from "@/components/layout/Logo";
import { siteSettings } from "@/lib/mock-data";
import { SOCIAL_LINKS } from "@/lib/social-links";
import Link from "next/link";

const columns: {
  title: string;
  links: { label: string; href?: string }[];
}[] = [
  {
    title: "Services",
    links: [
      { label: "Website Development", href: "/#services" },
      { label: "SEO", href: "/#services" },
      { label: "AEO", href: "/#services" },
      { label: "GEO", href: "/#services" },
      { label: "AI Ad Creatives", href: "/#services" },
      { label: "AI Automation", href: "/#services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#why" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/#faq" },
      { label: "Careers" },
      { label: "Privacy Policy" },
    ],
  },
  {
    title: "Contact",
    links: [
      {
        label: siteSettings.contactEmail,
        href: `mailto:${siteSettings.contactEmail}`,
      },
      { label: siteSettings.whatsappDisplay, href: "/#contact" },
      { label: "Chennai, Tamil Nadu" },
      { label: "WhatsApp Us", href: "/#contact" },
      { label: "Book a Call", href: "/#contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--on-dark-tertiary)]">
      <div className="section-padding pb-10 pt-[72px]">
        <div className="container-main">
          <div className="mb-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Logo dark />
              <p className="mt-5 max-w-[240px] text-[13px] leading-[1.78] text-[rgba(255,255,255,0.65)]">
                AI-first growth partner for Indian SMBs, startups, and global
                brands. Based in Chennai, Tamil Nadu.
              </p>
              <div className="mt-6 flex gap-2.5" role="list" aria-label="Social media">
                {SOCIAL_LINKS.map(({ network, label, href }) => {
                  const Icon = SOCIAL_ICON_COMPONENTS[network];
                  return (
                    <a
                      key={network}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      role="listitem"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.5)] hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  );
                })}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-[10px] font-bold tracking-[0.12em] text-[rgba(255,255,255,0.55)]">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="text-[13px] text-[rgba(255,255,255,0.7)] transition-colors hover:text-[rgba(255,255,255,0.85)]"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-[rgba(255,255,255,0.7)]">
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.06)] pt-6 sm:flex-row sm:justify-between">
            <p className="m-0 text-[11px] text-[rgba(255,255,255,0.5)]">
              © {new Date().getFullYear()} BrandCure Agency. All rights reserved.
            </p>
            <p className="m-0 text-[11px] text-[rgba(255,255,255,0.5)]">
              Grow Differently. · A Grewbie company
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
