"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal, RevealStagger, staggerChild } from "@/components/ui/Reveal";
import { processSteps } from "@/lib/mock-data";
import { motion } from "framer-motion";

export function Process() {
  return (
    <section
      id="process"
      className="section-padding bg-warm-white"
      aria-labelledby="process-heading"
    >
      <div className="container-main">
        <Reveal>
          <SectionEyebrow>How we work</SectionEyebrow>
          <h2
            id="process-heading"
            className="mb-16 font-serif text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.02em] text-brand-black"
          >
            Fast. Accountable.
            <br />
            <em className="italic text-gray">No surprises.</em>
          </h2>
        </Reveal>

        <RevealStagger className="grid-border grid-border-3">
          {processSteps.map((step) => (
            <motion.article
              key={step.step}
              variants={staggerChild}
              className="proc-card h-full bg-warm-white px-[42px] py-[46px]"
            >
              <div className="mb-6 font-serif text-[64px] font-normal italic leading-none text-[rgba(196,196,188,0.55)]">
                {step.step}
              </div>
              <h3 className="font-serif text-[28px] font-medium text-brand-black">
                {step.title}
              </h3>
              <p className="mb-6 mt-4 text-sm leading-[1.78] text-gray">
                {step.description}
              </p>
              <span className="inline-flex items-center rounded-full bg-cream px-3.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-gold">
                {step.time}
              </span>
            </motion.article>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
