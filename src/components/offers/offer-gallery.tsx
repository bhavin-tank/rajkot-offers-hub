"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OfferGalleryProps {
  images: string[];
  alt: string;
  expired?: boolean;
  /** Badge drawn at the bottom left of the main image. */
  badge: ReactNode;
  /** Buttons drawn over the image on mobile (back, share, save). */
  overlay?: ReactNode;
}

/**
 * Mobile: swipeable full-width carousel with dots.
 * Desktop: large image with a thumbnail strip.
 */
export function OfferGallery({ images, alt, expired, badge, overlay }: OfferGalleryProps) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = track.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function select(index: number) {
    setActive(index);
    const el = track.current;
    el?.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  const fade = expired && "opacity-75 grayscale-[0.7]";

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-surface lg:rounded-2xl">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto lg:overflow-hidden"
        >
          {images.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={i === 0 ? alt : ""}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 700px, 100vw"
                className={cn("object-cover", fade)}
              />
            </div>
          ))}
        </div>
        {overlay}
        <div className="absolute bottom-4 left-4 lg:bottom-5 lg:left-5">{badge}</div>
        {images.length > 1 && (
          <div className="absolute right-4 bottom-5 flex gap-1.5 lg:hidden" aria-hidden>
            {images.map((src, i) => (
              <span
                key={src}
                className={cn(
                  "h-1.5 rounded-full bg-white transition-all",
                  i === active ? "w-4" : "w-1.5 opacity-60",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 hidden gap-3 lg:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === active}
              onClick={() => select(i)}
              className={cn(
                "relative h-[72px] w-24 cursor-pointer overflow-hidden rounded-xl border-2",
                i === active ? "border-ink" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="96px" className={cn("object-cover", fade)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
