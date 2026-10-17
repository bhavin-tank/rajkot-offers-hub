"use client";

import Image from "next/image";
import { Store } from "lucide-react";
import { Link } from "@/components/i18n/link";
import { useSeenStatuses } from "@/hooks/use-zalak-memory";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { ZalakStory } from "@/lib/zalak/types";

/**
 * Shops with something new today, as rings like a stories bar: pink until watched, then grey.
 * Each opens the status viewer on that shop.
 */
export function StatusRow({ stories }: { stories: ZalakStory[] }) {
  const t = useT();
  const seen = useSeenStatuses();
  if (stories.length === 0) return null;
  return (
    <ul aria-label={t("Status")} className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 lg:mx-0 lg:gap-6 lg:px-0">
      {stories.map((story) => {
        const watched = seen.has(story.id);
        return (
          <li key={story.id} className="w-[68px] shrink-0 lg:w-20">
            <Link href={`/status?shop=${encodeURIComponent(story.shop.slug)}`} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "block size-[68px] rounded-full p-[3px] lg:size-20",
                  watched ? "bg-line-strong" : "bg-[conic-gradient(var(--color-primary),#ff8a3d,var(--color-primary))]",
                )}
              >
                <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full border-[2.5px] border-white bg-surface text-muted">
                  {story.shop.logo ? <Image src={story.shop.logo} alt="" fill sizes="80px" className="object-cover" /> : <Store size={24} strokeWidth={1.6} aria-hidden />}
                </span>
              </span>
              <span className={cn("w-full truncate text-center text-xs lg:text-[13px]", watched ? "text-muted" : "font-medium")}>{story.shop.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
