import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const sizes = {
  sm: { tile: "size-6 rounded-[7px] text-[13px]", text: "text-sm" },
  md: { tile: "size-7 rounded-lg text-[15px]", text: "text-[15px]" },
  lg: { tile: "size-8 rounded-[9px] text-[17px]", text: "text-base" },
} as const;

export function LogoMark({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary pt-0.5 font-gujarati font-bold text-white",
        sizes[size].tile,
        className,
      )}
    >
      ર
    </span>
  );
}

export function Logo({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className={cn("font-semibold tracking-[-0.01em] whitespace-nowrap", sizes[size].text)}>
        {site.name}
      </span>
    </Link>
  );
}
