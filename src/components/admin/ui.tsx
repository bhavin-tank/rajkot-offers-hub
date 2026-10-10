import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Building blocks for admin pages. English only, dense, no marketing styling. */

export const inputClass =
  "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:shadow-ring disabled:bg-surface aria-invalid:border-danger";
export const textareaClass =
  "min-h-20 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-primary focus:shadow-ring aria-invalid:border-danger";

export function AdminPage({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-line bg-white p-4 lg:p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES = {
  green: "bg-success-soft text-open",
  amber: "bg-amber-50 text-warning",
  red: "bg-red-50 text-danger",
  grey: "bg-surface text-muted",
  blue: "bg-sky-50 text-sky-700",
} as const;

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  approved: "green",
  active: "green",
  converted: "green",
  actioned: "green",
  replied: "green",
  pending: "amber",
  new: "amber",
  open: "amber",
  in_review: "blue",
  draft: "grey",
  paused: "grey",
  expired: "grey",
  archived: "grey",
  closed: "grey",
  dismissed: "grey",
  rejected: "red",
  spam: "red",
  suspended: "red",
  blocked: "red",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap capitalize", TONES[STATUS_TONE[status] ?? "grey"], className)}>
      {status.replace("_", " ")}
    </span>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-2 text-xs text-muted uppercase">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-10 text-center text-sm text-muted">{empty}</p>}
    </div>
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-top", className)} {...props} />;
}

export function LinkButton({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "outline" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap",
        variant === "primary" ? "bg-primary text-white hover:bg-primary-hover hover:text-white" : "border border-line-strong bg-white hover:bg-surface",
      )}
    >
      {children}
    </Link>
  );
}

/** Filter links that set one query parameter (`status` by default). */
export function FilterTabs({ base, current, items, param = "status", extra = {} }: { base: string; current?: string; items: { value?: string; label: string; count?: number }[]; param?: string; extra?: Record<string, string | undefined> }) {
  return (
    <nav className="no-scrollbar flex gap-1.5 overflow-x-auto" aria-label="Filter">
      {items.map((item) => {
        const query = new URLSearchParams(Object.entries({ ...extra, [param]: item.value }).filter((e): e is [string, string] => Boolean(e[1])));
        const selected = (current ?? "") === (item.value ?? "");
        return (
          <Link
            key={item.label}
            href={`${base}${query.size ? `?${query}` : ""}`}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm",
              selected ? "border-ink bg-ink text-white hover:text-white" : "border-line-strong bg-white hover:bg-surface",
            )}
          >
            {item.label}
            {item.count !== undefined && <span className={cn("text-xs", selected ? "text-white/70" : "text-muted")}>{item.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** GET search box that keeps the other filters. */
export function SearchForm({ q, placeholder, hidden = {} }: { q?: string; placeholder: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form className="flex max-w-md gap-2" role="search">
      {Object.entries(hidden).map(([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />)}
      <input name="q" defaultValue={q} placeholder={placeholder} className={inputClass} aria-label="Search" />
      <button className="h-10 shrink-0 rounded-lg border border-line-strong bg-white px-4 text-sm font-medium hover:bg-surface">Search</button>
    </form>
  );
}

export function Pagination({ page, limit, total, href }: { page: number; limit: number; total: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return <p className="text-xs text-muted">{total} total</p>;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 && <LinkButton variant="outline" href={href(page - 1)}>Previous</LinkButton>}
        {page < pages && <LinkButton variant="outline" href={href(page + 1)}>Next</LinkButton>}
      </div>
    </div>
  );
}

export function KeyValues({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(110px,auto)_1fr] gap-x-4 gap-y-2 text-sm">
      {items.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-muted">{key}</dt>
          <dd className="min-w-0 break-words">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const dateOnly = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

export function formatDateTime(date: Date | string | undefined | null) {
  return date ? dateTime.format(new Date(date)) : "—";
}

/** "2026-10-14" → "14 Oct 2026". */
export function formatDay(isoDay: string) {
  return dateOnly.format(new Date(`${isoDay}T12:00:00+05:30`));
}

/** Query string for list pages, dropping empty values. */
export function listHref(base: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );
  return query.size ? `${base}?${query}` : base;
}
