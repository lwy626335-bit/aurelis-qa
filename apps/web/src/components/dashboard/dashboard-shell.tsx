"use client";

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
import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import type { Dictionary } from "@/i18n/config";
import { cn } from "@/lib/utils";

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

function NavigationHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-[var(--accent)] opacity-0",
        pending && "status-pulse opacity-75 shadow-[0_0_9px_rgba(214,185,120,0.52)]",
      )}
    />
  );
}

function SidebarContent({ close, compact = false, dictionary, isDemo }: { close?: () => void; compact?: boolean; dictionary: Dictionary; isDemo: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <div className={cn("flex h-16 items-center border-b border-white/[0.07] px-5", compact && "lg:justify-center lg:px-0 xl:justify-start xl:px-5")}>
        <Link href="/" aria-label={dictionary.common.home} className="text-[var(--text)] hover:text-[var(--accent)]" onClick={close}>
          {compact ? <><AurelisMark className="xl:hidden" compact /><AurelisMark className="hidden xl:inline-flex" /></> : <AurelisMark />}
        </Link>
      </div>
      <nav className={cn("flex-1 overflow-y-auto px-3 py-5", compact && "lg:px-2 xl:px-3")} aria-label={dictionary.dashboard.navigation}>
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
                  <span className={cn("ml-auto", compact && "lg:absolute lg:right-1.5 lg:ml-0 xl:static xl:ml-auto")}><NavigationHint /></span>
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
  const isDemo = pathname.startsWith("/dashboard/demo");

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] lg:grid lg:grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col border-r border-white/[0.07] bg-[var(--surface)] lg:flex xl:w-[248px]">
        <SidebarContent compact dictionary={dictionary} isDemo={isDemo} />
      </aside>

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[rgba(7,8,11,0.88)] px-4 backdrop-blur-xl lg:px-7">
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
        </header>
        {children}
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
