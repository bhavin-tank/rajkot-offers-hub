"use client";

import { Bookmark, ChevronDown, ChevronUp, Heart, Share2, Store, Volume2, VolumeX, X, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "@/components/i18n/link";
import { useToggleSave } from "@/components/offers/save-button";
import { buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useLikedStories } from "@/hooks/use-zalak-memory";
import { formatDistance } from "@/lib/format";
import { localizePath } from "@/lib/i18n/config";
import { useLocale, useT } from "@/lib/i18n/client";
import { offerPath, shopPath } from "@/lib/paths";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ZalakClip, ZalakKind, ZalakStory } from "@/lib/zalak/types";

/**
 * The look shared by reels and statuses: the black stage, the shop at the top, the offer and the actions
 * at the bottom. How the two behave (a scrolling feed, or tap-through posts) lives in their own viewers.
 */

/** The current minute, so "2h ago" renders after hydration instead of from the server's clock. */
export function useNow() {
  return useSyncExternalStore(
    () => () => {},
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0,
  );
}

/** Things happening outside the page that should hold the viewer, like the phone's own share sheet. */
let holds = 0;
const holdListeners = new Set<() => void>();

/** Holds the viewer for as long as `task` runs. */
async function whileHeld<T>(task: () => Promise<T>) {
  holds++;
  holdListeners.forEach((listener) => listener());
  try {
    return await task();
  } finally {
    holds--;
    holdListeners.forEach((listener) => listener());
  }
}

function subscribeHolds(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
  holdListeners.add(onChange);
  return () => {
    observer.disconnect();
    holdListeners.delete(onChange);
  };
}

/** Whether something is open on top of the viewer: a sheet or dialog (the login), or the share sheet. The viewer holds still while one is. */
export function useModalOpen() {
  return useSyncExternalStore(
    subscribeHolds,
    () => holds > 0 || document.querySelector("dialog[open]") !== null,
    () => false,
  );
}

/** Back to where the visitor came from, or Home when the viewer was opened directly. */
export function useClose() {
  const router = useRouter();
  const locale = useLocale();
  return useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push(localizePath(locale, "/"));
  }, [router, locale]);
}

/** Black screen on a phone; a centred phone-shaped column on a desktop. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black">
      <div className="relative h-dvh w-full max-w-[460px] overflow-hidden bg-black select-none">{children}</div>
    </div>
  );
}

export function EmptyStage({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <Shell>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-white">
        <p className="text-base">{t("Nothing here yet. Check back soon.")}</p>
        <button type="button" onClick={onClose} className={buttonClass({ variant: "primary" })}>
          {t("Close")}
        </button>
      </div>
    </Shell>
  );
}

/** Darkens the top and bottom of the picture so the white text stays readable. */
export function Scrim() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/65 via-transparent via-30% to-black/85" />;
}

/** Up and down buttons beside the column, for a mouse. */
export function StoryArrows({ onPrevious, onNext, atStart, atEnd }: { onPrevious: () => void; onNext: () => void; atStart: boolean; atEnd: boolean }) {
  const t = useT();
  return (
    <div className="absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      <ArrowButton label={t("Previous")} disabled={atStart} onClick={onPrevious}>
        <ChevronUp size={22} aria-hidden />
      </ArrowButton>
      <ArrowButton label={t("Next")} disabled={atEnd} onClick={onNext}>
        <ChevronDown size={22} aria-hidden />
      </ArrowButton>
    </div>
  );
}

function ArrowButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}

interface ClipMediaProps {
  clip: ZalakClip;
  /** A photo drifts closer while it plays unless it is `still`; a video plays unless it is paused. */
  paused: boolean;
  muted: boolean;
  still?: boolean;
  priority?: boolean;
}

export function ClipMedia({ clip, paused, muted, still, priority }: ClipMediaProps) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (paused) el.pause();
    else void el.play().catch(() => {});
  }, [paused, clip]);

  if (clip.kind === "video") {
    return <video ref={video} src={clip.src} poster={clip.poster} muted={muted} loop autoPlay={!paused} playsInline preload="metadata" className="size-full object-cover" />;
  }
  return (
    <Image
      src={clip.src}
      alt=""
      fill
      priority={priority}
      sizes="(min-width: 460px) 460px, 100vw"
      draggable={false}
      className={cn("object-cover", !still && "animate-zalak-zoom motion-reduce:animate-none")}
      style={still ? undefined : { animationDuration: `${clip.seconds}s`, animationPlayState: paused ? "paused" : "running" }}
    />
  );
}

interface OverlayProps {
  story: ZalakStory;
  kind: ZalakKind;
  clip: ZalakClip;
  /** The progress or position bars, drawn above the shop. */
  bars: ReactNode;
  muted: boolean;
  onMute?: () => void;
  onClose: () => void;
}

/** Everything drawn over the picture. It lets touches through to the picture except on its own buttons. */
export function Overlay({ story, kind, clip, bars, muted, onMute, onClose }: OverlayProps) {
  const t = useT();
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-3 pt-[calc(env(safe-area-inset-top)+10px)] pb-[calc(env(safe-area-inset-bottom)+14px)]">
      <div className="flex flex-col gap-3">
        {bars}
        <Header story={story} kind={kind} clip={clip} onClose={onClose} />
      </div>

      {/* Everything below sits together at the bottom edge: the offer, the actions, then the button. */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1 pb-1 text-white">
            {story.caption && <span className="mb-2 inline-block rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold">{story.caption}</span>}
            <h2 className="line-clamp-2 text-lg leading-snug font-semibold">{story.title}</h2>
          </div>
          <Rail story={story} muted={muted} onMute={onMute} />
        </div>

        {story.offer && (
          <Link
            href={offerPath({ businessSlug: story.offer.businessSlug, urlSlug: story.offer.urlSlug })}
            className={buttonClass({ variant: "primary", block: true, className: "pointer-events-auto" })}
          >
            {t("View offer")}
          </Link>
        )}
      </div>
    </div>
  );
}

function Header({ story, kind, clip, onClose }: { story: ZalakStory; kind: ZalakKind; clip: ZalakClip; onClose: () => void }) {
  const t = useT();
  const now = useNow();
  const ago = story.postedAt && now ? Math.floor((now - new Date(story.postedAt).getTime()) / 3_600_000) : null;
  const detail =
    kind === "status"
      ? ago === null
        ? null
        : ago < 1
          ? t("Just now")
          : t("{hours}h ago", { hours: ago })
      : clip.kind === "video"
        ? `0:${String(clip.seconds).padStart(2, "0")}`
        : null;
  return (
    <div className="pointer-events-auto flex items-center gap-2.5 text-white">
      <Link href={shopPath(story.shop.slug)} className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/20">
          {story.shop.logo ? <Image src={story.shop.logo} alt="" fill sizes="40px" className="object-cover" /> : <Store size={18} aria-hidden />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{story.shop.name}</span>
          <span className="block truncate text-xs text-white/85">{[detail, story.distanceKm === undefined ? null : formatDistance(story.distanceKm, t), story.shop.areaName].filter(Boolean).join(" · ")}</span>
        </span>
      </Link>
      <FollowPill slug={story.shop.slug} />
      <button type="button" aria-label={t("Close")} onClick={onClose} className="-mr-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15">
        <X size={24} aria-hidden />
      </button>
    </div>
  );
}

function FollowPill({ slug }: { slug: string }) {
  const t = useT();
  const { saved, onToggle } = useToggleSave(slug, "follow");
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={onToggle}
      className={cn(
        "shrink-0 cursor-pointer rounded-full border-[1.5px] border-white px-3 py-1 text-xs font-bold transition-colors",
        saved ? "bg-white text-primary" : "text-white hover:bg-white/15",
      )}
    >
      {saved ? t("Following") : t("Follow")}
    </button>
  );
}

function Rail({ story, muted, onMute }: { story: ZalakStory; muted: boolean; onMute?: () => void }) {
  const t = useT();
  const toast = useToast();
  const locale = useLocale();
  const { isLiked, toggle } = useLikedStories();
  const liked = isLiked(story.id);

  function share() {
    const path = story.offer ? offerPath({ businessSlug: story.offer.businessSlug, urlSlug: story.offer.urlSlug }) : shopPath(story.shop.slug);
    const url = `${site.url}${localizePath(locale, path)}`;
    // The phone's share sheet is not part of the page, so the viewer is held for as long as it is open.
    return whileHeld(async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: story.title, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        toast(t("Link copied"));
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") toast(t("Could not share. Please try again."));
      }
    });
  }

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-5 pb-1">
      {/* Mock: the count is this browser's own like until the API counts them. */}
      <RailButton label={t("Like")} count={liked ? 1 : 0} pressed={liked} onClick={() => toggle(story.id)}>
        <Heart size={30} strokeWidth={1.8} aria-hidden className={cn(liked && "fill-primary text-primary")} />
      </RailButton>
      {story.offer && <SaveRail slug={story.offer.slug} />}
      <RailButton label={t("Share")} onClick={share}>
        <Share2 size={28} strokeWidth={1.8} aria-hidden />
      </RailButton>
      {onMute && (
        <RailButton label={muted ? t("Unmute") : t("Mute")} onClick={onMute}>
          {muted ? <VolumeX size={28} strokeWidth={1.8} aria-hidden /> : <Volume2 size={28} strokeWidth={1.8} aria-hidden />}
        </RailButton>
      )}
    </div>
  );
}

function SaveRail({ slug }: { slug: string }) {
  const t = useT();
  const { saved, onToggle } = useToggleSave(slug, "offer");
  return (
    <RailButton label={saved ? t("Saved") : t("Save")} pressed={saved} onClick={onToggle}>
      <Bookmark size={28} strokeWidth={1.8} aria-hidden className={cn(saved && "fill-primary text-primary")} />
    </RailButton>
  );
}

/** An icon with a bold label under it (and a count under that), straight on the picture. */
function RailButton({ label, count, pressed, onClick, children }: { label: string; count?: number; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="flex w-14 cursor-pointer flex-col items-center gap-1 text-white [filter:drop-shadow(0_1px_3px_rgb(0_0_0/0.55))]"
    >
      {children}
      <span className="text-[13px] leading-none font-bold">{label}</span>
      {count !== undefined && <span className="text-[13px] leading-none font-medium text-white/90">{count}</span>}
    </button>
  );
}

export interface TourStep {
  icon: LucideIcon;
  text: string;
  button: string;
}

/** The "how to use it" hint over a blurred picture, shown once on a device. One tap moves on, and the last one closes it. */
export function Tour({ steps, step, onNext }: { steps: TourStep[]; step: number; onNext: () => void }) {
  const { icon: Icon, text, button } = steps[step];
  return (
    <button
      type="button"
      onClick={onNext}
      className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-5 bg-black/55 px-10 text-center text-white backdrop-blur-xl"
    >
      <span className="flex size-24 items-center justify-center rounded-full border border-white/35 bg-white/10">
        <Icon size={36} strokeWidth={2.2} aria-hidden />
      </span>
      <p className="text-base leading-snug text-white/90">{text}</p>
      {steps.length > 1 && (
        <span aria-hidden className="flex gap-1.5">
          {steps.map((_, i) => (
            <i key={i} className={cn("h-2 rounded-full transition-all", i === step ? "w-7 bg-white" : "w-2 bg-white/50")} />
          ))}
        </span>
      )}
      <span className="rounded-full border border-white/50 px-6 py-2 text-[15px]">{button}</span>
    </button>
  );
}
