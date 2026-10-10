"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  /** Number of active filters, shown on the button. */
  count: number;
  /** The filter form, rendered on the server. */
  children: ReactNode;
  /** "square": 46px button next to search. "round": small round button. "pill": desktop "Filter" button. */
  trigger?: "square" | "round" | "pill";
  className?: string;
}

/** Button that opens the filter form in a bottom sheet. */
export function FilterSheet({ count, children, trigger = "square", className }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const label = count ? `Filter (${count})` : "Filter";

  return (
    <>
      {trigger === "pill" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium",
            count ? "border-ink bg-ink text-white" : "border-input bg-white hover:border-ink",
            className,
          )}
        >
          <SlidersHorizontal size={16} aria-hidden />
          {label}
        </button>
      ) : (
        <IconButton
          aria-label={label}
          variant={count ? "squareActive" : trigger === "round" ? "plain" : "square"}
          size={trigger === "round" ? "sm" : "xl"}
          count={count}
          onClick={() => setOpen(true)}
          className={cn(trigger === "round" && !count && "border border-line", trigger === "round" && "rounded-full", className)}
        >
          <SlidersHorizontal size={trigger === "round" ? 16 : 20} aria-hidden />
        </IconButton>
      )}
      {/* Submitting or resetting navigates, so close the sheet as well. */}
      <Sheet open={open} onClose={() => setOpen(false)} title="Filter">
        <div
          onSubmit={() => setOpen(false)}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </Sheet>
    </>
  );
}
