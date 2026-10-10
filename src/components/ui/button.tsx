import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-white hover:bg-[#d81b5a] disabled:bg-skeleton disabled:text-faint",
  outline:
    "border border-ink bg-white text-ink hover:bg-surface disabled:border-input disabled:text-line-strong disabled:hover:bg-white",
  ghost: "text-muted hover:text-ink",
  soft: "bg-surface text-ink hover:bg-canvas",
} as const;

const sizes = {
  sm: "h-10 px-[18px] text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-base",
} as const;

export interface ButtonStyleProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  block?: boolean;
  iconOnly?: boolean;
}

export function buttonClass({
  variant = "primary",
  size = "md",
  block,
  iconOnly,
  className,
}: ButtonStyleProps & { className?: string }) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    block && "w-full",
    iconOnly && "aspect-square px-0",
    className,
  );
}

export function Button({
  variant,
  size,
  block,
  iconOnly,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, iconOnly, className })}
      {...props}
    />
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  iconOnly,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={buttonClass({ variant, size, block, iconOnly, className })} {...props} />;
}

/** For external links (tel:, wa.me, maps). */
export function ButtonAnchor({
  variant,
  size,
  block,
  iconOnly,
  className,
  ...props
}: ComponentProps<"a"> & ButtonStyleProps) {
  return <a className={buttonClass({ variant, size, block, iconOnly, className })} {...props} />;
}
