import Image from "next/image";
import { Link } from "@/components/i18n/link";
import logo from "@/assets/brand/logo.png";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const sizes = {
  /** Footer. */
  sm: "h-9",
  /** Mobile header. */
  md: "h-10",
  /** Desktop header. */
  lg: "h-12",
} as const;

/** "Rajkot Offers Hub" wordmark linking home. */
export function Logo({
  size = "md",
  priority,
  className,
}: {
  size?: keyof typeof sizes;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0", className)}>
      <Image
        src={logo}
        alt={site.name}
        priority={priority}
        sizes="128px"
        className={cn("w-auto", sizes[size])}
      />
    </Link>
  );
}
