"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal, RevealStagger, staggerChild } from "@/components/ui/Reveal";
import { whyPoints } from "@/lib/mock-data";
import { motion } from "framer-motion";

export function WhyBrandCure() {
  return (
    <section
      id="why"
      className="relative overflow-hidden bg-charcoal section-padding text-[var(--on-dark-primary)]"
      aria-labelledby="why-heading"
    >
      <div
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full border border-[var(--on-dark-border)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-5%] top-1/2 h-[340px] w-[340px] -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.07)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[5%] top-1/2 h-[120px] w-[120px] -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.1)]"
        aria-hidden
      />

      <div className="container-main relative">
        <Reveal>
          <SectionEyebrow dark>Our edge</SectionEyebrow>
          <h2
            id="why-heading"
            className="mb-16 font-serif text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.02em]"
          >
            We build. They talk.
            <br />
            <em className="italic text-[rgba(255,255,255,0.28)]">
              The difference is proof.
            </em>
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-12 md:grid-cols-3">
          {whyPoints.map((point) => (
            <motion.div
              key={point.title}
              variants={staggerChild}
              className="border-t border-[var(--on-dark-border)] pt-7"
            >
              <h3 className="font-serif text-[26px] font-medium">{point.title}</h3>
              <p className="mt-3.5 text-sm leading-[1.8] text-[var(--on-dark-secondary)]">
                {point.description}
              </p>
            </motion.div>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
