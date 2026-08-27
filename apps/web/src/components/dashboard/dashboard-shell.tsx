"use client";

import { useGSAP } from "@gsap/react";
import {
  ArrowsLeftRight,
  BookOpenText,
  ChartBar,
  ChartLineUp,
  ClockCounterClockwise,
  Code,
  Flask,
  Gauge,
  GithubLogo,
  List,
  ShieldCheck,
  SlidersHorizontal,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { gsap } from "gsap";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { useRouteMotion } from "@/components/motion/route-motion-provider";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import type { Dictionary } from "@/i18n/config";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const navigation = [
  { key: "overview", href: "/dashboard/demo", icon: Gauge },
  { key: "evaluations", href: "/dashboard/evaluations", icon: ChartLineUp },
  { key: "analytics", href: "/dashboard/analytics", icon: ChartBar },
  { key: "brands", href: "/dashboard/brands", icon: Sparkle },
  { key: "history", href: "/dashboard/history", icon: ClockCounterClockwise },
  { key: "technical", href: "/dashboard/technical", icon: Code },
  { key: "compare", href: "/dashboard/compare", icon: ArrowsLeftRight },
  { key: "rubrics", href: "/dashboard/rubrics", icon: SlidersHorizontal },
  { key: "research", href: "/dashboard/research", icon: Flask },
  { key: "github", href: "/dashboard/github", icon: GithubLogo },
  { key: "privacy", href: "/dashboard/privacy", icon: ShieldCheck },
] as const;

function NavigationHint({ href }: { href: string }) {
  const { pending } = useLinkStatus();
  const { transition } = useRouteMotion();
  const routePending = transition?.href === href || transition?.href.startsWith(`${href}/`);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-[var(--accent)] opacity-0",
        (pending || routePending) && "status-pulse opacity-75 shadow-[0_0_9px_rgba(214,185,120,0.52)]",
      )}
    />
  );
}

function railPosition(host: HTMLElement, href: string) {
  const path = href.split("?")[0];
  const links = Array.from(host.querySelectorAll<HTMLElement>("[data-route-href]"));
  const target = links
    .filter((link) => {
      const routeHref = link.dataset.routeHref;
      return routeHref && (path === routeHref || path.startsWith(`${routeHref}/`));
    })
    .sort((a, b) => (b.dataset.routeHref?.length ?? 0) - (a.dataset.routeHref?.length ?? 0))[0]
    ?? links.find((link) => link.getAttribute("aria-current") === "page");

  if (!target) return 96;
  const hostRect = host.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return Math.max(72, Math.min(hostRect.height - 72, targetRect.top - hostRect.top + targetRect.height / 2));
}

function SidebarContent({ close, compact = false, dictionary, isDemo }: { close?: () => void; compact?: boolean; dictionary: Dictionary; isDemo: boolean }) {
  const pathname = usePathname();
  const navigationRoot = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo("[data-nav-active]", { autoAlpha: 0, x: -5 }, { autoAlpha: 1, x: 0, duration: 0.28, ease: "power2.out" });
    },
    { dependencies: [pathname], revertOnUpdate: true, scope: navigationRoot },
  );

  return (
    <>
      <div className={cn("flex h-16 items-center border-b border-white/[0.07] px-5", compact && "lg:justify-center lg:px-0 xl:justify-start xl:px-5")}>
        <Link href="/" aria-label={dictionary.common.home} className="text-[var(--text)] hover:text-[var(--accent)]" onClick={close}>
          {compact ? <><AurelisMark className="xl:hidden" compact /><AurelisMark className="hidden xl:inline-flex" /></> : <AurelisMark />}
        </Link>
      </div>
      <nav className={cn("flex-1 overflow-y-auto px-3 py-5", compact && "lg:px-2 xl:px-3")} aria-label={dictionary.dashboard.navigation} ref={navigationRoot}>
        <p className={cn("px-3 pb-3 font-mono text-[9px] tracking-[0.12em] text-[var(--text-tertiary)] uppercase", compact && "lg:sr-only xl:not-sr-only")}>{dictionary.dashboard.workspace}</p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  data-route-href={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "interactive-control relative flex min-h-11 items-center gap-3 overflow-hidden rounded-[var(--radius-control)] px-3 text-[13px]",
                    compact && "lg:justify-center lg:px-0 xl:justify-start xl:px-3",
                    active
                      ? "bg-white/[0.065] text-[var(--text)]"
                      : "text-[var(--text-secondary)] hover:bg-white/[0.035] hover:text-[var(--text)]",
                  )}
                >
                  {active && <span data-nav-active aria-hidden="true" className="absolute inset-y-2 left-0 w-px bg-[var(--accent)]" />}
                  <Icon aria-hidden="true" className={cn("size-[17px]", active && "text-[var(--accent)]")} weight="light" />
                  <span className={cn("min-w-0 flex-1 truncate", compact && "lg:sr-only xl:not-sr-only")}>{dictionary.dashboard.nav[item.key]}</span>
                  <span className={cn("ml-auto", compact && "lg:absolute lg:right-1.5 lg:ml-0 xl:static xl:ml-auto")}><NavigationHint href={item.href} /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={cn("border-t border-white/[0.07] p-4", compact && "lg:px-2 xl:p-4")}>
        <Link
          data-route-href="/dashboard/documentation"
          href="/dashboard/documentation"
          onClick={close}
          className={cn("flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-xs text-[var(--text-tertiary)] hover:bg-white/[0.035] hover:text-[var(--text)]", compact && "lg:justify-center lg:px-0 xl:justify-start xl:px-3")}
        >
          <BookOpenText aria-hidden="true" className="size-4" /> <span className={cn(compact && "lg:sr-only xl:not-sr-only")}>{dictionary.dashboard.documentation}</span>
        </Link>
        <div className={cn("mt-3 rounded-[var(--radius-control)] border border-white/[0.07] bg-white/[0.025] p-3", compact && "lg:hidden xl:block")}>
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", isDemo ? "bg-[var(--accent)]" : "bg-[var(--success)]")} /> {isDemo ? dictionary.dashboard.demoWorkspace : dictionary.dashboard.workspaceReady}
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-[var(--text-tertiary)]">{isDemo ? dictionary.common.demoDataset : dictionary.dashboard.foundation}</p>
        </div>
      </div>
    </>
  );
}
export function DashboardShell({
  children,
  dictionary,
  localeSwitcher,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  localeSwitcher: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { completion, locationKey, transition } = useRouteMotion();
  const isDemo = pathname.startsWith("/dashboard/demo");
  const shell = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const desktopFilament = useRef<HTMLSpanElement>(null);
  const mobileHeader = useRef<HTMLElement>(null);
  const mobileFilament = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      const pending = Boolean(transition?.visible);

      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        if (!sidebar.current || !desktopFilament.current) return;
        if (pending && transition) {
          const startY = railPosition(sidebar.current, pathname) - 32;
          const targetY = railPosition(sidebar.current, transition.href) - 32;
          gsap.timeline()
            .set(desktopFilament.current, { autoAlpha: 1, scaleY: 0.28, transformOrigin: "50% 50%", y: startY })
            .to(desktopFilament.current, { scaleY: 1, y: targetY, duration: 0.5, ease: "power3.inOut" })
            .to(desktopFilament.current, { scaleY: 0.62, duration: 0.42, ease: "sine.inOut", repeat: -1, yoyo: true });
        } else if (completion) {
          const targetY = railPosition(sidebar.current, completion.href) - 32;
          gsap.set(desktopFilament.current, { autoAlpha: 0.9, scaleY: 0.82, y: targetY });
          gsap.to(desktopFilament.current, { autoAlpha: 0, scaleY: 0.16, duration: 0.24, ease: "power2.out" });
        } else {
          gsap.set(desktopFilament.current, { autoAlpha: 0 });
        }
      });

      media.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        if (!mobileHeader.current || !mobileFilament.current) return;
        if (pending) {
          const travel = () => Math.max(0, mobileHeader.current!.clientWidth - 96);
          gsap.timeline()
            .set(mobileFilament.current, { autoAlpha: 1, scaleX: 0.34, transformOrigin: "0 50%", x: 0 })
            .to(mobileFilament.current, { scaleX: 1, x: travel, duration: 0.66, ease: "power3.inOut" })
            .to(mobileFilament.current, { x: () => travel() * 0.72, duration: 0.46, ease: "sine.inOut", repeat: -1, yoyo: true });
        } else if (completion) {
          gsap.to(mobileFilament.current, { autoAlpha: 0, scaleX: 0.12, duration: 0.22, ease: "power2.out" });
        } else {
          gsap.set(mobileFilament.current, { autoAlpha: 0 });
        }
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        if (desktopFilament.current) {
          const y = sidebar.current && transition ? railPosition(sidebar.current, transition.href) - 32 : 64;
          gsap.set(desktopFilament.current, { autoAlpha: pending ? 0.82 : 0, scaleY: 0.42, y });
        }
        gsap.set(mobileFilament.current, { autoAlpha: pending ? 0.82 : 0, scaleX: 0.4, x: 0 });
      });

      return () => media.revert();
    },
    { dependencies: [completion?.id, pathname, transition?.id, transition?.visible], revertOnUpdate: true, scope: shell },
  );

  useGSAP(
    () => {
      if (!content.current) return;
      const media = gsap.matchMedia();

      if (transition?.visible) {
        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.to(content.current, { autoAlpha: 0.55, x: -6, duration: 0.24, ease: "power2.out" });
        });
        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(content.current, { autoAlpha: 0.82, x: 0 });
        });
        return () => media.revert();
      }

      if (!completion || !locationKey.startsWith("/dashboard")) {
        gsap.set(content.current, { clearProps: "transform,opacity,visibility" });
        return () => media.revert();
      }

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const duration = completion.kind === "completion" ? 0.34 : 0.46;
        const distance = completion.kind === "history" ? 0 : completion.kind === "completion" ? 7 : 11;

        if (pathname.startsWith("/dashboard/demo")) {
          gsap.fromTo(
            content.current,
            { autoAlpha: 0.68, x: distance },
            { autoAlpha: 1, x: 0, duration, ease: "power3.out", clearProps: "transform,opacity,visibility" },
          );
          return;
        }

        const main = content.current?.querySelector("main") ?? content.current?.firstElementChild;
        const heading = main?.querySelector("h1") ?? null;
        const summary = heading?.parentElement?.querySelector("p") ?? null;
        let intro: Element | null = heading;
        while (intro?.parentElement && intro.parentElement !== main) intro = intro.parentElement;
        const body = main
          ? Array.from(main.children).filter((element) => element !== intro).slice(0, 5)
          : [];
        const timeline = gsap.timeline({ defaults: { duration, ease: "power3.out" } });

        gsap.set(content.current, { autoAlpha: 1, x: 0 });
        if (heading) timeline.fromTo(heading, { autoAlpha: 0, x: distance }, { autoAlpha: 1, x: 0 }, 0);
        if (summary) timeline.fromTo(summary, { autoAlpha: 0, x: distance * 0.8 }, { autoAlpha: 1, x: 0, duration: duration * 0.9 }, 0.07);
        if (body.length) timeline.fromTo(body, { autoAlpha: 0, x: distance }, { autoAlpha: 1, x: 0, stagger: 0.045 }, 0.12);
        if (!heading && !body.length) {
          timeline.fromTo(content.current, { autoAlpha: 0.68, x: distance }, { autoAlpha: 1, x: 0, clearProps: "transform,opacity,visibility" }, 0);
        }
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(content.current, { clearProps: "transform,opacity,visibility" });
      });
      return () => media.revert();
    },
    { dependencies: [completion?.id, locationKey, transition?.visible], revertOnUpdate: true, scope: content },
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] lg:grid lg:grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]" ref={shell}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col border-r border-white/[0.07] bg-[var(--surface)] lg:flex xl:w-[248px]" ref={sidebar}>
        <SidebarContent compact dictionary={dictionary} isDemo={isDemo} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-1px] top-0 h-16 w-[2px] bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent opacity-0 shadow-[0_0_14px_rgba(214,185,120,0.55)]"
          data-route-filament="desktop"
          ref={desktopFilament}
        />
      </aside>

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[rgba(7,8,11,0.88)] px-4 backdrop-blur-xl lg:px-7" ref={mobileHeader}>
          <IconButton
            aria-controls="dashboard-drawer"
            aria-label={dictionary.dashboard.openNavigation}
            aria-expanded={open}
            className="border border-white/10 text-[var(--text)] lg:hidden"
            onClick={() => setOpen(true)}
            type="button"
          >
            <List aria-hidden="true" className="size-5" />
          </IconButton>
          <div className="hidden lg:block">
            <p className="text-[11px] text-[var(--text-tertiary)]">{isDemo ? "Northstar Atelier" : dictionary.dashboard.workspace}</p>
            <p className="mt-0.5 text-xs font-medium text-[var(--text)]">{isDemo ? dictionary.dashboard.overviewTitle : "AURELIS QA"}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {localeSwitcher}
            {isDemo && <span className="hidden rounded-[6px] border border-[rgba(214,185,120,0.22)] bg-[rgba(214,185,120,0.06)] px-2.5 py-1 font-mono text-[9px] text-[var(--accent)] sm:inline-flex">{dictionary.common.demoDataset}</span>}
            {isDemo && <div className="hidden size-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-[var(--text-secondary)] md:grid" aria-label={dictionary.dashboard.demoWorkspace}>NA</div>}
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-1px] left-0 h-[2px] w-24 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 shadow-[0_0_12px_rgba(214,185,120,0.5)] lg:hidden"
            data-route-filament="mobile"
            ref={mobileFilament}
          />
        </header>
        <div aria-busy={Boolean(transition)} data-route-content ref={content}>{children}</div>
      </div>

      <Drawer
        closeLabel={dictionary.dashboard.closeNavigation}
        onClose={() => setOpen(false)}
        open={open}
        title={dictionary.dashboard.navigation}
      >
        <IconButton
          aria-label={dictionary.dashboard.closeNavigation}
          className="absolute right-3 top-3 z-[1] text-[var(--text-secondary)]"
          onClick={() => setOpen(false)}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </IconButton>
        <SidebarContent close={() => setOpen(false)} dictionary={dictionary} isDemo={isDemo} />
      </Drawer>
    </div>
  );
}
