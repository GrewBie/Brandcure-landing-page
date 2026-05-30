"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal, RevealStagger, staggerChild } from "@/components/ui/Reveal";
import { services } from "@/lib/mock-data";
import { motion } from "framer-motion";

function ServiceCard({
  service,
}: {
  service: (typeof services)[number];
}) {
  return (
    <article className="svc-card group h-full cursor-default bg-warm-white px-[38px] py-[42px]">
      <div className="svc-card-inner h-full transition-[transform,box-shadow] duration-[280ms] ease-[ease] group-hover:-translate-y-[5px] group-hover:shadow-[0_20px_54px_rgba(0,0,0,0.09)]">
        <div className="mb-5 text-[22px] text-gold">{service.sym}</div>
        <h3 className="font-serif text-[26px] font-medium text-brand-black">
          {service.title}
        </h3>
        <p className="mb-4 mt-1.5 text-[10px] font-bold tracking-[0.1em] text-gold">
          {service.sub}
        </p>
        <p className="m-0 text-sm leading-[1.78] text-gray">
          {service.description}
        </p>
      </div>
    </article>
  );
}

export function Services() {
  return (
    <section
      id="services"
      className="section-padding bg-warm-white"
      aria-labelledby="services-heading"
    >
      <div className="container-main">
        <Reveal>
          <SectionEyebrow>What we do</SectionEyebrow>
          <h2
            id="services-heading"
            className="mb-14 font-serif text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.02em] text-brand-black"
          >
            Everything you need.
            <br />
            <em className="italic text-gray">Nothing you don&apos;t.</em>
          </h2>
        </Reveal>

        <RevealStagger className="grid-border grid-border-3">
          {services.map((service) => (
            <motion.div key={service.title} variants={staggerChild}>
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
