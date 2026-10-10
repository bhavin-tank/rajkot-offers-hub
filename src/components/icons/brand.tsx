import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function base({ size = 24, strokeWidth = 1.75, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

/** Lucide no longer ships brand icons, so these two are drawn here. */
export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
