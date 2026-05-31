"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { auditChecklist, siteSettings } from "@/lib/mock-data";
import { leadFormSchema, type LeadFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

const inputClass =
  "w-full rounded-[7px] border border-[var(--border)] bg-warm-white px-[14px] py-3 text-sm text-brand-black transition-[border-color] duration-[220ms] focus:border-gold focus:outline-none";

export function LeadCapture() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Submission failed");
      }

      setSubmitted(true);
      reset();
    } catch {
      setSubmitError(
        "We could not send your request. Please try again or WhatsApp us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="section-padding bg-warm-white"
      aria-labelledby="contact-heading"
    >
      <div className="container-lead">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 lg:items-start">
          <Reveal>
            <SectionEyebrow>Free digital audit</SectionEyebrow>
            <h2
              id="contact-heading"
              className="mb-5 font-serif text-[clamp(2.125rem,3.5vw,3.25rem)] font-medium leading-[1.08] text-brand-black"
            >
              What&apos;s costing
              <br />
              <em className="italic text-gray">you customers?</em>
            </h2>
            <p className="mb-9 max-w-md text-sm leading-[1.8] text-gray">
              We&apos;ll audit your website, SEO, social presence, and automation
              gaps — and show you exactly what to fix. No sales pitch. Just data.
            </p>
            <ul className="mb-11 flex flex-col gap-3.5">
              {auditChecklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-[15px] font-semibold text-gold">✓</span>
                  <span className="text-[13px] text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-[10px] border border-[var(--border)] bg-cream px-6 py-5">
              <p className="mb-1.5 text-[10px] font-bold tracking-[0.08em] text-gray">
                PREFER WHATSAPP?
              </p>
              <p className="font-serif text-2xl font-medium text-brand-black">
                {siteSettings.whatsappDisplay}
              </p>
              <p className="mt-1 text-xs text-gray">
                We respond within 2 hours during business hours
              </p>
              <a
                href={`https://wa.me/${siteSettings.whatsappNumber}`}
                className="mt-3 inline-block text-xs font-medium text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message on WhatsApp →
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            {submitted ? (
              <div
                className="animate-slide-up rounded-xl border border-[var(--border)] bg-cream px-11 py-12 text-center"
                role="status"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-xl text-white">
                  ✓
                </div>
                <h3 className="font-serif text-[30px] font-medium text-brand-black">
                  Audit Requested!
                </h3>
                <p className="mt-3 text-sm leading-[1.78] text-gray">
                  We&apos;ve saved your details and sent a confirmation to your
                  email. Your custom audit will arrive within 24 hours.
                </p>
              </div>
            ) : (
              <div
                data-contact-audit-form
                className="rounded-xl border border-[var(--border)] bg-cream p-9 md:p-10"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[18px]" noValidate>
                  <Field id="name" label="YOUR NAME *" error={errors.name?.message}>
                    <input id="name" className={inputClass} autoComplete="name" {...register("name")} />
                  </Field>
                  <Field id="email" label="EMAIL ADDRESS *" error={errors.email?.message}>
                    <input id="email" type="email" className={inputClass} autoComplete="email" {...register("email")} />
                  </Field>
                  <Field id="phone" label="PHONE (OPTIONAL)" error={errors.phone?.message}>
                    <input id="phone" type="tel" className={inputClass} autoComplete="tel" {...register("phone")} />
                  </Field>
                  <Field id="business" label="BUSINESS NAME & INDUSTRY" error={errors.business?.message}>
                    <input id="business" className={inputClass} {...register("business")} />
                  </Field>
                  <Field id="challenge" label="BIGGEST CHALLENGE (OPTIONAL)" error={errors.challenge?.message}>
                    <textarea
                      id="challenge"
                      rows={3}
                      className={`${inputClass} min-h-[100px] resize-y`}
                      {...register("challenge")}
                    />
                  </Field>
                  {submitError && (
                    <p className="text-xs text-error" role="alert">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-charcoal px-4 py-3.5 text-sm font-medium tracking-[0.02em] text-white transition-all duration-[220ms] hover:-translate-y-0.5 hover:bg-brand-black hover:shadow-[0_10px_28px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Request Free Audit →"}
                  </button>
                </form>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[10px] font-bold tracking-[0.08em] text-gray">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
