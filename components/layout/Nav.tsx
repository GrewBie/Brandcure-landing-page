"use client";

import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/cn";
import { useScrollY } from "@/hooks/useScrollY";
import { MAIN_NAV_LINKS, NAV_CTA_HREF } from "@/lib/nav-links";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NAV_HEIGHT = 76;

export function Nav() {
  const scrollY = useScrollY();
  const scrolled = scrollY > 60;
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-[350ms] ease-out",
        scrolled
          ? "border-b border-[var(--border)] bg-[rgba(240,237,230,0.93)] backdrop-blur-[20px]"
          : "bg-transparent",
      )}
      style={{ height: NAV_HEIGHT }}
    >
      <div className="container-main flex h-full items-center justify-between gap-6">
        <Link
          href="/#home"
          className="flex h-full shrink-0 items-center"
          aria-label="BrandCure home"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>

        <div className="hidden h-full items-center gap-10 md:flex">
          <nav
            className="flex h-full items-center gap-9"
            aria-label="Main navigation"
          >
            {MAIN_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link text-charcoal">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href={NAV_CTA_HREF} className="nav-cta shrink-0">
            Free Audit →
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-charcoal md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
        </button>
      </div>

      {open && (
        <div
          className="absolute inset-x-0 border-t border-[var(--border)] bg-[rgba(240,237,230,0.98)] backdrop-blur-xl md:hidden"
          style={{ top: NAV_HEIGHT }}
        >
          <div className="container-main py-6">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {MAIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex h-12 items-center text-[15px] font-medium text-charcoal"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={NAV_CTA_HREF}
                className="nav-cta mt-3 h-11 w-full justify-center"
                onClick={() => setOpen(false)}
              >
                Free Audit →
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
