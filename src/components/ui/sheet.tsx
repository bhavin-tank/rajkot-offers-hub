"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Bottom sheet on mobile, centred dialog on desktop. Built on <dialog>
 * so focus trapping, Escape and the backdrop come from the browser.
 */
export function Sheet({ open, onClose, title, children, footer, className }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/45",
        "lg:m-auto lg:max-w-[480px]",
        className,
      )}
    >
      <div className="flex max-h-[85dvh] flex-col rounded-t-3xl bg-white lg:rounded-2xl">
        <div className="flex justify-center pt-2.5 lg:hidden">
          <span className="h-1 w-10 rounded-full bg-input" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4 lg:px-6 lg:pt-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <IconButton variant="soft" size="sm" aria-label="બંધ કરો" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-5 lg:px-6">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 lg:px-6">{footer}</div>}
      </div>
    </dialog>
  );
}
