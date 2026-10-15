"use client";

import { Check, Copy, Ticket } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState, useTransition } from "react";
import { useLogin } from "@/components/auth/login-dialog";
import { Link } from "@/components/i18n/link";
import { Button } from "@/components/ui/button";
import { claimCodeAction, revealCodeAction, type CodeResult } from "@/lib/actions/offers";
import { useLocale, useT } from "@/lib/i18n/client";
import { formatShortDate } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";
import type { RedemptionMode } from "@/types";

type Shown = Extract<CodeResult, { ok: true }>;

/**
 * The code for an offer that has one: a shop-wide code anyone can see ("Show code"), or a
 * personal one-time code a logged-in shopper claims ("Claim my code") with a QR the shop scans.
 * Walk-in offers have neither.
 */
export function OfferCode({
  offerId,
  mode,
  compact,
  className,
}: {
  offerId: string;
  mode: RedemptionMode;
  /** For the phone's bottom bar: one slim row until the code is shown, and a scrollable card after. */
  compact?: boolean;
  className?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const login = useLogin();
  const [shown, setShown] = useState<Shown | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [pending, start] = useTransition();

  if (mode === "walk_in") return null;
  const claim = mode === "unique_claim";

  function fetchCode() {
    setError(null);
    start(async () => {
      const result = await (claim ? claimCodeAction(offerId) : revealCodeAction(offerId));
      if (result.ok) setShown(result);
      else if (result.error === "login") login.prompt(fetchCode);
      else setError(result.error);
    });
  }

  function get() {
    if (login.signedIn()) fetchCode();
    else login.prompt(fetchCode);
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/40 p-4",
        compact && "max-h-[55dvh] overflow-y-auto p-3",
        className,
      )}
    >
      {shown ? (
        <>
          <p className="text-sm text-muted">{claim ? t("Your personal code. Show it at the store.") : t("Show this code at the store.")}</p>
          <CodeBox code={shown.code} />
          {claim && shown.qrPayload && <Qr payload={shown.qrPayload} />}
          {claim && shown.expiresAt && (
            <p className="text-xs text-muted">{t("Use it by {date}.", { date: formatShortDate(shown.expiresAt.slice(0, 10), locale) })}</p>
          )}
          {claim && (
            <Link href="/account#codes" className="text-sm font-medium text-primary hover:underline">
              {t("See all my codes")}
            </Link>
          )}
        </>
      ) : (
        <div className={cn("flex flex-col gap-3", compact && "flex-row items-center")}>
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">
            <Ticket size={18} className="shrink-0 text-primary" aria-hidden />
            {claim ? t("This offer needs a personal code. Log in to claim yours.") : t("This offer has a code to show at the store.")}
          </p>
          <Button type="button" onClick={get} disabled={pending} block={!compact} className={compact ? "shrink-0" : undefined}>
            {claim ? t("Claim my code") : t("Show code")}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t(error)}
        </p>
      )}
    </div>
  );
}

function CodeBox({ code }: { code: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
      <span className="font-mono text-2xl font-bold tracking-[0.2em]">{code}</span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
        className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-muted hover:text-ink"
      >
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {copied ? t("Copied") : t("Copy")}
      </button>
    </div>
  );
}

export function Qr({ payload, size = 176 }: { payload: string; size?: number }) {
  const t = useT();
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    QRCode.toString(payload, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then((markup) => live && setSvg(markup));
    return () => {
      live = false;
    };
  }, [payload]);
  return (
    <div
      role="img"
      aria-label={t("QR code for the store to scan")}
      className="self-center rounded-xl bg-white p-2"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
