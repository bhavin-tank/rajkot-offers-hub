"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { useT } from "@/lib/i18n/client";

const DESKTOP = "(min-width: 1024px)";

/** Whether the viewport is desktop-wide; the map sits in the page there and in a drawer on a phone. */
export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DESKTOP);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

interface MapDrawerProps {
  onClose: () => void;
  /** The search box and filter chips shown above the map. */
  header: ReactNode;
  children: ReactNode;
}

/**
 * The offers map on a phone: a tall bottom drawer with the search and filter chips on top and the
 * map filling the rest. Built on <dialog>, so focus trapping, Escape and the backdrop are the browser's.
 */
export function MapDrawer({ onClose, header, children }: MapDrawerProps) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={t("Map")}
      // A filter chip's own drawer closes inside this one, and React lets its close event bubble up here.
      onClose={(e) => e.target === e.currentTarget && onClose()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 mt-auto h-[92dvh] max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/45"
    >
      <div className="flex h-full flex-col rounded-t-3xl bg-white">
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-input" />
        </div>
        <div className="flex flex-col gap-3 px-5 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("Map")}</h2>
            <IconButton variant="soft" size="sm" aria-label={t("Close")} onClick={onClose}>
              <X size={18} />
            </IconButton>
          </div>
          {header}
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">{children}</div>
      </div>
    </dialog>
  );
}
