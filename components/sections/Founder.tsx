"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteSettings } from "@/lib/mock-data";
import Image from "next/image";

const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/yogeswaran4002/";

const globalPoints = [
  {
    title: "Timezone that overlaps yours",
    body: "We work IST with a daily window for US-morning and UK-afternoon calls, so you're never waiting a full day for a reply.",
  },
  {
    title: "Async updates you can actually follow",
    body: "Short Loom walkthroughs plus Slack or WhatsApp — you stay in the loop without standing meetings.",
  },
  {
    title: "Clear scope, priced in your currency",
    body: "Fixed-scope proposals and milestones in [FILL: USD / GBP / AED]. You approve before any work starts.",
  },
];

export function Founder() {
  return (
    <section
      id="founder"
      className="section-padding bg-warm-white"
      aria-labelledby="founder-heading"
    >
      <div className="container-main">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <Reveal>
            <div className="relative mx-auto w-full max-w-[400px]">
              {/* Decorative accents */}
              <div
                className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-gold/40"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-5 -left-5 h-16 w-16 rotate-12 border border-[var(--border-mid)]"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-cream shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
                <Image
                  src="/founder.png"
                  alt="Yogeswaran S, Co-Founder of BrandCure"
                  width={800}
                  height={800}
                  className="aspect-square w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent"
                  aria-hidden
                />
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="font-serif text-xl font-medium text-brand-black">
                    Yogeswaran S
                  </p>
                  <p className="mt-0.5 text-[13px] text-gray">
                    Co-Founder · BrandCure (a Grewbie company)
                  </p>
                </div>
                <a
                  href={FOUNDER_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Yogeswaran S on LinkedIn"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-gray transition-all duration-[220ms] hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div>
              <SectionEyebrow>Who you&apos;re working with</SectionEyebrow>
              <h2
                id="founder-heading"
                className="mb-6 font-serif text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-brand-black"
              >
                A founder,
                <br />
                <em className="italic text-gray">not a faceless agency.</em>
              </h2>
              <div className="flex flex-col gap-4 text-sm leading-[1.8] text-gray">
                <p>
                  I&apos;m Yogeswaran, co-founder of Grewbie Technologies — the
                  team behind BrandCure. I come from an AI/ML and engineering
                  background, and I kept seeing the same thing: businesses pay
                  good money for leads, then lose them to slow replies and
                  half-finished websites.
                </p>
                <p>
                  So we built BrandCure to fix exactly that — with AI systems
                  that actually ship. We&apos;re new and growing, which means
                  every client gets my direct attention, senior people on the
                  real work, and founding-client pricing. You&apos;re not a
                  ticket in a queue — you have my number.
                </p>
              </div>

              <ul className="mt-7 flex flex-wrap gap-2.5">
                {[
                  "Founder-led delivery",
                  "Founding-client pricing",
                  "You talk to the people doing the work",
                ].map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-[var(--surface-muted)] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.03em] text-foreground"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#contact">Get a Free Audit →</Button>
                <Button
                  href={`https://wa.me/${siteSettings.whatsappNumber}`}
                  variant="secondary"
                >
                  WhatsApp us
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-16 rounded-2xl border border-[var(--border)] bg-cream p-8 md:p-10">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionEyebrow>For clients outside India</SectionEyebrow>
                <h3 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-tight text-brand-black">
                  Built in India, ready for your timezone.
                </h3>
              </div>
              <p className="max-w-sm text-sm leading-[1.8] text-gray">
                Same senior team, work that meets a global standard — without
                agency-tier overheads. Here&apos;s how we keep it simple across
                borders.
              </p>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {globalPoints.map((point) => (
                <div
                  key={point.title}
                  className="border-t border-[var(--border)] pt-5"
                >
                  <h4 className="font-serif text-lg font-medium text-brand-black">
                    {point.title}
                  </h4>
                  <p className="mt-2 text-[13px] leading-[1.75] text-gray">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
