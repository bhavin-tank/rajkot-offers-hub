"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import { revealContactAction } from "@/lib/actions/auth";
import { useT } from "@/lib/i18n/client";
import { telHref, whatsappHref } from "@/lib/utils";

/** Numbers revealed in this tab, so a second tap doesn't ask the API again. */
const revealed = new Map<string, { phone: string; whatsapp: string }>();

/**
 * Call or WhatsApp a shop. Guests see masked numbers, so the first tap logs
 * them in (when needed), asks the API for the real numbers, then dials or opens
 * WhatsApp. An unmasked number is a plain link.
 */
export function ContactLink({
  business,
  kind,
  number,
  masked,
  className,
  children,
}: {
  business: string;
  kind: "call" | "whatsapp";
  number: string;
  masked: boolean;
  className?: string;
  children: ReactNode;
}) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [numbers, setNumbers] = useState(() => revealed.get(business));
  const open = (contact: { phone: string; whatsapp: string }) => {
    if (kind === "call") window.location.href = telHref(contact.phone);
    else window.open(whatsappHref(contact.whatsapp), "_blank", "noopener");
  };

  if (!masked) {
    const href = kind === "call" ? telHref(number) : whatsappHref(number);
    return (
      <a href={href} className={className} {...(kind === "whatsapp" && { target: "_blank", rel: "noreferrer" })}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      aria-label={numbers ? undefined : t("Log in to see the number")}
      onClick={() => {
        if (numbers) return open(numbers);
        start(async () => {
          const result = await revealContactAction(business);
          if (result.ok) {
            revealed.set(business, result.data);
            setNumbers(result.data);
            open(result.data);
          } else if (result.error === "login") {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
          } else {
            toast(t(result.error));
          }
        });
      }}
    >
      {children}
    </button>
  );
}
