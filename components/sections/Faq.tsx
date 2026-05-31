import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { BRANDCURE_FAQ } from "@/lib/seo/faq";

export function Faq() {
  return (
    <section
      id="faq"
      className="section-padding bg-warm-white"
      aria-labelledby="faq-heading"
    >
      <div className="container-main max-w-3xl">
        <Reveal>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2
            id="faq-heading"
            className="mb-3 font-serif text-[clamp(2rem,3.5vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.02em] text-brand-black"
          >
            Common questions
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-gray">
            Straight answers about what BrandCure does, how we work, and how to
            get started.
          </p>
        </Reveal>

        <div className="flex flex-col gap-2">
          {BRANDCURE_FAQ.map((item, i) => (
            <Reveal key={item.question} delay={i * 0.04}>
              <details className="group rounded-xl border border-[var(--border)] bg-cream/40 open:bg-cream">
                <summary className="cursor-pointer list-none px-5 py-4 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.question}
                    <span
                      className="mt-0.5 shrink-0 text-gold transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="border-t border-[var(--border)] px-5 py-4 text-sm leading-[1.78] text-gray">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
