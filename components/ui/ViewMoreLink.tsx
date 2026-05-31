import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ViewMoreLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-10 flex justify-center">
      <Link
        href={href}
        className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-charcoal px-6 py-2.5 text-[11px] font-bold tracking-[0.1em] text-foreground transition-colors hover:border-gold hover:text-gold"
      >
        {label}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
