import Link from "next/link";
import { InstagramIcon } from "@/components/icons/brand";
import { footerNav, site } from "@/lib/site";
import { cn, instagramHref } from "@/lib/utils";
import { Container } from "./container";
import { Logo } from "./logo";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-line bg-white", className)}>
      <Container className="flex flex-col gap-5 py-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10 lg:py-12">
        <div className="flex flex-col gap-3">
          <Logo size="sm" className="self-start" />
          <p className="text-sm text-muted">{site.tagline}</p>
        </div>

        <nav aria-label="ફૂટર મેનુ">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm lg:gap-8">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted lg:flex-col lg:items-end lg:gap-1.5">
          <a
            href={instagramHref(site.instagram)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-ink"
          >
            <InstagramIcon size={15} />
            {site.instagram}
          </a>
          <span>{site.domain}</span>
        </div>
      </Container>
    </footer>
  );
}
