import { cn } from "@/lib/cn";

export function Logo({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const brandFill = dark ? "rgba(255,255,255,0.85)" : "var(--charcoal)";
  const cFill = dark ? "white" : "var(--black)";

  return (
    <svg
      width="148"
      height="26"
      viewBox="0 0 148 26"
      className={cn("block h-[30px] w-auto shrink-0", className)}
      aria-label="BrandCure"
      role="img"
    >
      <text
        x="0"
        y="20"
        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
        fontWeight="500"
        letterSpacing="3.5"
        fontSize="13"
        fill={brandFill}
      >
        BRAND
      </text>
      <text
        x="69"
        y="22"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontWeight="400"
        fontSize="24"
        fill={cFill}
        fontStyle="italic"
      >
        C
      </text>
      <text
        x="86"
        y="20"
        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
        fontWeight="500"
        letterSpacing="3.5"
        fontSize="13"
        fill={brandFill}
      >
        URE
      </text>
    </svg>
  );
}
