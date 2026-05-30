import { cn } from "@/lib/cn";

export function SectionEyebrow({
  children,
  className,
  dark = false,
}: {
  children: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <p
      className={cn(
        "mb-4 text-[11px] font-bold uppercase tracking-[0.12em]",
        dark ? "text-gold" : "text-gold",
        className,
      )}
    >
      {children}
    </p>
  );
}
