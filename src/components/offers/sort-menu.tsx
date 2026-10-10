"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SortKey } from "@/types";
import { SORT_OPTIONS } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface SortMenuProps {
  value: SortKey;
  /** Link for each sort option, built on the server. */
  hrefs: Record<SortKey, string>;
  className?: string;
}

/** "Sort: …" pill that opens a small menu of sort links. */
export function SortMenu({ value, hrefs, className }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-[34px] cursor-pointer items-center gap-1 rounded-full border border-line bg-white px-3 text-[13px] hover:border-input lg:h-[38px] lg:px-4 lg:text-sm"
      >
        <span className="text-muted">Sort:</span>
        <span className="font-medium">{current.label}</span>
        <ChevronDown size={14} className="text-muted" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-2 w-[220px] rounded-2xl border border-line bg-white p-2 shadow-card"
        >
          <p className="px-3 pt-1 pb-2 text-xs font-semibold tracking-[0.04em] text-muted">Sort</p>
          {SORT_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <Link
                key={option.value}
                role="menuitemradio"
                aria-checked={selected}
                href={hrefs[option.value]}
                scroll={false}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center justify-between rounded-[10px] px-3 text-sm",
                  selected ? "bg-surface font-semibold" : "hover:bg-surface",
                )}
              >
                {option.label}
                {selected && <Check size={16} strokeWidth={2.5} aria-hidden />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
