"use client";

import { useEffect, useRef } from "react";

export function LandingMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const video = page.querySelector<HTMLVideoElement>("[data-background-video]")!;
    const pause = page.querySelector<HTMLButtonElement>("[data-video-toggle]")!;
    const menu = page.querySelector<HTMLDetailsElement>("[data-mobile-menu]")!;
    const trigger = menu.querySelector("summary")!;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 721px)");
    const counters = Array.from(page.querySelectorAll<HTMLElement>("[data-count]"));
    let frame = 0;

    const showFinalCounts = () => {
      cancelAnimationFrame(frame);
      counters.forEach((element) => { element.textContent = Number(element.dataset.count).toFixed(1); });
    };
    const syncPlayback = () => {
      pause.hidden = false;
      pause.setAttribute("aria-pressed", String(video.paused));
    };
    const syncMotion = () => {
      if (reducedMotion.matches) {
        video.pause();
        showFinalCounts();
      } else {
        void video.play().catch(() => { pause.hidden = true; });
      }
    };
    const toggleVideo = () => {
      if (video.paused) void video.play().catch(() => { pause.hidden = true; });
      else video.pause();
    };
    const closeMenu = () => {
      if (!menu.open) return;
      const hadFocus = menu.contains(document.activeElement);
      menu.open = false;
      if (hadFocus && !desktop.matches) trigger.focus();
    };
    const syncMenu = () => trigger.setAttribute("aria-expanded", String(menu.open));
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a, [data-menu-dismiss]")) closeMenu();
    };
    const onKey = (event: KeyboardEvent) => {
      if (!menu.open) return;
      if (event.key === "Escape") closeMenu();
      if (event.key === "Tab") {
        const focusable = Array.from(menu.querySelectorAll<HTMLElement>("summary, a, button:not([tabindex='-1']):not(:disabled)"));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const onResize = () => { if (desktop.matches) closeMenu(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (reducedMotion.matches) return;
      const start = performance.now();
      const count = (now: number) => {
        counters.forEach((element, index) => {
          const progress = Math.min(1, Math.max(0, (now - start - 480 - index * 90) / (1500 + index * 80)));
          element.textContent = (Number(element.dataset.count) * (1 - (1 - progress) ** 3)).toFixed(1);
        });
        if (now - start < 2500) frame = requestAnimationFrame(count);
      };
      frame = requestAnimationFrame(count);
    }, { threshold: 0.25 });
    if (counters[0]) observer.observe(counters[0]);
    video.addEventListener("play", syncPlayback);
    video.addEventListener("pause", syncPlayback);
    pause.addEventListener("click", toggleVideo);
    reducedMotion.addEventListener("change", syncMotion);
    desktop.addEventListener("change", onResize);
    menu.addEventListener("toggle", syncMenu);
    menu.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    syncMotion();

    return () => {
      observer.disconnect();
      showFinalCounts();
      video.removeEventListener("play", syncPlayback);
      video.removeEventListener("pause", syncPlayback);
      video.pause();
      pause.removeEventListener("click", toggleVideo);
      reducedMotion.removeEventListener("change", syncMotion);
      desktop.removeEventListener("change", onResize);
      menu.removeEventListener("toggle", syncMenu);
      menu.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [children]);

  return <div ref={root} className={className}>{children}</div>;
}
