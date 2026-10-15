"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionTab {
  /** Also the id of the section, so it must be unique on the page. */
  value: string;
  label: ReactNode;
  content: ReactNode;
}

interface SectionTabsProps {
  items: SectionTab[];
  /** Accessible name of the tab bar. */
  label: string;
  /**
   * Mobile header (56px, e.g. back, title, share) that slides in above the tab bar once the
   * tab bar has stuck to the top. Hidden on large screens.
   */
  topBar?: ReactNode;
  className?: string;
}

/**
 * All sections on one scrolling page with a tab bar that sticks to the top.
 * Tapping a tab scrolls to its section, and scrolling highlights the tab of the
 * section being read. Without JavaScript the tabs are plain "#section" links.
 */
export function SectionTabs({ items, label, topBar, className }: SectionTabsProps) {
  const [active, setActive] = useState(items[0]?.value);
  const [stuck, setStuck] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);
  const values = items.map((item) => item.value);
  const key = values.join();

  /** How far from the top of the screen the tab bar sticks (below the mobile header, if any). */
  function stuckTop() {
    return bar.current ? parseFloat(getComputedStyle(bar.current).top) || 0 : 0;
  }

  useEffect(() => {
    function update() {
      // The tab bar is stuck once its natural position (the sentinel) has scrolled up to where it sticks.
      // 1px of slack so the bar never sits stuck without its header at the boundary.
      setStuck((sentinel.current?.getBoundingClientRect().top ?? 2) <= stuckTop() + 1);
      // Ignore the scroll events of a smooth scroll that a tab tap started.
      if (scrolling.current) return;
      // A section counts as the one being read once its top is in the upper third of the screen.
      const line = stuckTop() + (bar.current?.offsetHeight ?? 0) + window.innerHeight * 0.3;
      let current = values[0];
      for (const value of values) {
        const section = document.getElementById(value);
        if (section && section.getBoundingClientRect().top <= line) current = value;
      }
      // A short last section may never reach the bar, so the end of the page counts as reaching it.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActive(atBottom ? values[values.length - 1] : current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // `values` is derived from `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /** Keeps the highlighted tab visible when the bar scrolls sideways on a narrow screen. */
  function keepInView(tab: HTMLAnchorElement | null) {
    const nav = bar.current;
    if (!tab || !nav || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }

  function go(event: MouseEvent, value: string) {
    const section = document.getElementById(value);
    if (!section) return;
    event.preventDefault();
    scrolling.current = true;
    window.setTimeout(() => {
      scrolling.current = false;
    }, 800);
    setActive(value);
    const top = section.getBoundingClientRect().top + window.scrollY - stuckTop() - (bar.current?.offsetHeight ?? 0);
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className={className}>
      {topBar && (
        <div
          inert={!stuck}
          className={cn(
            "fixed inset-x-0 top-0 z-40 h-14 bg-white transition-transform duration-200 lg:hidden",
            stuck ? "translate-y-0" : "-translate-y-full",
          )}
        >
          {topBar}
        </div>
      )}
      <div ref={sentinel} aria-hidden />
      <nav
        ref={bar}
        aria-label={label}
        className={cn(
          "sticky z-30 -mx-5 flex gap-6 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-line bg-white px-5 lg:top-0 lg:mx-0 lg:gap-8 lg:px-0",
          topBar ? "top-14" : "top-0",
        )}
      >
        {items.map((item) => {
          const selected = item.value === active;
          return (
            <a
              key={item.value}
              href={`#${item.value}`}
              aria-current={selected ? "true" : undefined}
              ref={selected ? keepInView : undefined}
              onClick={(event) => go(event, item.value)}
              className={cn(
                "-mb-px shrink-0 border-b-2 pt-3 pb-3 text-[15px] whitespace-nowrap transition-colors",
                selected
                  ? "border-primary font-semibold text-ink"
                  : "border-transparent font-medium text-muted hover:text-ink",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
      {items.map((item, i) => (
        <section
          key={item.value}
          id={item.value}
          className={cn(topBar ? "scroll-mt-28 lg:scroll-mt-14" : "scroll-mt-14", i > 0 && "mt-10 border-t border-line lg:mt-14")}
        >
          {item.content}
        </section>
      ))}
    </div>
  );
}
