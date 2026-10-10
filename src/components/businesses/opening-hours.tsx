"use client";

import { useSyncExternalStore } from "react";
import type { OpeningHours } from "@/types";
import { DAYS, formatHours, getOpenStatus, rajkotClock } from "@/lib/format";
import { cn } from "@/lib/utils";

function subscribeMinute(onChange: () => void) {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
}

/**
 * Current time to the minute, read only on the client so the prerendered
 * and cached server HTML never shows a stale open/closed state.
 */
function useNow() {
  const minute = useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  return minute === null ? null : new Date(minute * 60_000);
}

/** "હમણાં ખુલ્લું • રાત્રે 9 સુધી" pill. */
export function OpenStatusPill({ hours, className }: { hours: OpeningHours[]; className?: string }) {
  const now = useNow();
  const status = now ? getOpenStatus(hours, now) : null;
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium",
        !status && "invisible",
        className,
      )}
    >
      <span aria-hidden className={cn("size-2 rounded-full", status?.open ? "bg-open" : "bg-faint")} />
      {status?.text ?? "…"}
    </span>
  );
}

/** Weekly hours with today highlighted. */
export function HoursTable({ hours, compact }: { hours: OpeningHours[]; compact?: boolean }) {
  const now = useNow();
  const today = now ? rajkotClock(now).day : -1;

  if (compact) {
    return (
      <ul className="flex flex-col gap-1.5 text-[13px]">
        {hours.map((h) => (
          <li key={h.day} className={cn("flex justify-between gap-3", h.day === today ? "font-semibold" : "text-muted")}>
            <span>{DAYS[h.day]}</span>
            <span>{formatHours(h)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <table className="w-full overflow-hidden rounded-2xl border border-line text-sm [border-collapse:separate] [border-spacing:0]">
      <tbody>
        {hours.map((h) => {
          const isToday = h.day === today;
          return (
            <tr key={h.day} className={cn(isToday && "bg-surface font-semibold")}>
              <th scope="row" className="border-b border-line px-4 py-3 text-left font-[inherit] [tr:last-child_&]:border-0">
                {DAYS[h.day]}
                {isToday && <span className="sr-only"> (આજે)</span>}
              </th>
              <td className={cn("border-b border-line px-4 py-3 text-right [tr:last-child_&]:border-0", !isToday && "text-muted")}>
                {formatHours(h)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
