"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export type RouteMotionKind = "route" | "completion";

export type RouteMotionTransition = {
  href: string;
  id: number;
  kind: RouteMotionKind;
  visible: boolean;
};

export type RouteMotionCompletion = {
  href: string;
  id: number;
  kind: RouteMotionKind | "history";
};

type RouteMotionContextValue = {
  completion: RouteMotionCompletion | null;
  locationKey: string;
  startNavigation: (href: string, kind?: RouteMotionKind) => void;
  transition: RouteMotionTransition | null;
};

const RouteMotionContext = createContext<RouteMotionContextValue>({
  completion: null,
  locationKey: "",
  startNavigation: () => undefined,
  transition: null,
});

function RouteLocationObserver({ onChange }: { onChange: (locationKey: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  useEffect(() => onChange(locationKey), [locationKey, onChange]);
  return null;
}

function GlobalRouteFilament({ active }: { active: boolean }) {
  const filament = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (!active) {
          gsap.set(filament.current, { autoAlpha: 0, x: 0 });
          return;
        }

        const travel = () => window.innerWidth * 0.86;
        gsap.timeline({ repeat: -1 })
          .set(filament.current, { autoAlpha: 1, scaleX: 0.3, x: -96 })
          .to(filament.current, { scaleX: 1, duration: 0.34, ease: "power2.out" })
          .to(filament.current, { x: travel, duration: 0.86, ease: "power2.inOut" }, 0)
          .to(filament.current, { autoAlpha: 0.28, duration: 0.2, yoyo: true, repeat: 1 }, 0.5);
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(filament.current, { autoAlpha: active ? 0.82 : 0, scaleX: 0.38, x: 0 });
      });
      return () => media.revert();
    },
    { dependencies: [active], revertOnUpdate: true },
  );

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] h-px w-24 origin-left bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 shadow-[0_0_14px_rgba(214,185,120,0.48)]"
      data-route-filament="global"
      ref={filament}
    />
  );
}

export function RouteMotionProvider({ children }: { children: React.ReactNode }) {
  const [transition, setTransition] = useState<RouteMotionTransition | null>(null);
  const [completion, setCompletion] = useState<RouteMotionCompletion | null>(null);
  const [locationKey, setLocationKey] = useState("");
  const transitionRef = useRef<RouteMotionTransition | null>(null);
  const locationRef = useRef("");
  const sequence = useRef(0);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    delayTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const startNavigation = useCallback((href: string, kind: RouteMotionKind = "route") => {
    if (typeof window === "undefined") return;

    const url = new URL(href, window.location.href);
    if (!/^https?:$/.test(url.protocol) || url.origin !== window.location.origin) return;

    const current = `${window.location.pathname}${window.location.search}`;
    const target = `${url.pathname}${url.search}`;
    if (target === current || transitionRef.current?.href === target) return;

    clearTimers();
    const next: RouteMotionTransition = {
      href: target,
      id: ++sequence.current,
      kind,
      visible: transitionRef.current?.visible ?? false,
    };
    transitionRef.current = next;
    setTransition(next);

    if (!next.visible) {
      delayTimer.current = setTimeout(() => {
        const currentTransition = transitionRef.current;
        if (!currentTransition || currentTransition.id !== next.id) return;
        const visibleTransition = { ...currentTransition, visible: true };
        transitionRef.current = visibleTransition;
        setTransition(visibleTransition);
      }, 110);
    }

    safetyTimer.current = setTimeout(() => {
      if (transitionRef.current?.id !== next.id) return;
      transitionRef.current = null;
      setTransition(null);
      clearTimers();
    }, 12_000);
  }, [clearTimers]);

  const handleLocationChange = useCallback((nextLocation: string) => {
    setLocationKey(nextLocation);
    if (!locationRef.current) {
      locationRef.current = nextLocation;
      return;
    }
    if (locationRef.current === nextLocation) return;
    locationRef.current = nextLocation;

    const finished = transitionRef.current;
    clearTimers();
    transitionRef.current = null;
    setTransition(null);
    setCompletion({
      href: finished?.href ?? nextLocation,
      id: ++sequence.current,
      kind: finished?.kind ?? "history",
    });
  }, [clearTimers]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor
        || anchor.hasAttribute("download")
        || anchor.dataset.routeMotion === "off"
        || (anchor.target && anchor.target !== "_self")
      ) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      const current = `${window.location.pathname}${window.location.search}`;
      const targetLocation = `${url.pathname}${url.search}`;
      if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol) || targetLocation === current) return;
      startNavigation(targetLocation);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [startNavigation]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo<RouteMotionContextValue>(() => ({
    completion,
    locationKey,
    startNavigation,
    transition,
  }), [completion, locationKey, startNavigation, transition]);

  const showGlobalFilament = Boolean(transition?.visible && !locationKey.startsWith("/dashboard"));

  return (
    <RouteMotionContext.Provider value={value}>
      <Suspense fallback={null}>
        <RouteLocationObserver onChange={handleLocationChange} />
      </Suspense>
      <GlobalRouteFilament active={showGlobalFilament} />
      {children}
      <div aria-atomic="true" aria-live="polite" className="sr-only" role="status">
        {transition && (
          <>
            <span className="locale-en">Opening page</span>
            <span className="locale-ja">ページを開いています</span>
            <span className="locale-zh">正在打开页面</span>
          </>
        )}
      </div>
    </RouteMotionContext.Provider>
  );
}

export function useRouteMotion() {
  return useContext(RouteMotionContext);
}
