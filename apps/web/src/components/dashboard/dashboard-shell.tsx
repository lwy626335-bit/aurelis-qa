"use client";

import {
  BezierCurve,
  BookOpenText,
  ChartLineUp,
  ClockCounterClockwise,
  Flask,
  Gauge,
  List,
  SlidersHorizontal,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import type { Dictionary } from "@/i18n/config";
import { cn } from "@/lib/utils";

const navigation = [
  { key: "overview", href: "/dashboard", icon: Gauge, phase: 1 },
  { key: "evaluations", href: "/dashboard/evaluations", icon: ChartLineUp, phase: 2 },
  { key: "brands", href: "/dashboard/brands", icon: Sparkle, phase: 4 },
  { key: "history", href: "/dashboard/history", icon: ClockCounterClockwise, phase: 6 },
  { key: "rubrics", href: "/dashboard/rubrics", icon: SlidersHorizontal, phase: 6 },
  { key: "research", href: "/dashboard/research", icon: Flask, phase: 6 },
] as const;

function SidebarContent({ close, dictionary }: { close?: () => void; dictionary: Dictionary }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center border-b border-white/[0.07] px-5">
        <Link href="/" aria-label={dictionary.common.home} className="text-[var(--text)] hover:text-[var(--accent)]" onClick={close}>
          <AurelisMark />
        </Link>
      </div>
      <nav className="flex-1 px-3 py-5" aria-label={dictionary.dashboard.navigation}>
        <p className="px-3 pb-3 font-mono text-[9px] tracking-[0.12em] text-[var(--text-tertiary)] uppercase">{dictionary.dashboard.workspace}</p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-[var(--radius-control)] px-3 text-[13px]",
                    active
                      ? "bg-white/[0.065] text-[var(--text)]"
                      : "text-[var(--text-secondary)] hover:bg-white/[0.035] hover:text-[var(--text)]",
                  )}
                >
                  <Icon aria-hidden="true" className={cn("size-[17px]", active && "text-[var(--accent)]")} weight="light" />
                  <span className="min-w-0 flex-1 truncate">{dictionary.dashboard.nav[item.key]}</span>
                  {item.phase > 1 && <span className="font-mono text-[8px] text-[var(--text-tertiary)]">P{item.phase}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/[0.07] p-4">
        <Link
          href="/dashboard/documentation"
          onClick={close}
          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-xs text-[var(--text-tertiary)] hover:bg-white/[0.035] hover:text-[var(--text)]"
        >
          <BookOpenText aria-hidden="true" className="size-4" /> {dictionary.dashboard.documentation}
        </Link>
        <div className="mt-3 rounded-[var(--radius-control)] border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
            <BezierCurve aria-hidden="true" className="size-3.5 text-[var(--accent)]" /> Phase 2
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-[var(--text-tertiary)]">Architecture and interface foundation</p>
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

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-white/[0.07] bg-[var(--surface)] lg:flex">
        <SidebarContent dictionary={dictionary} />
      </aside>

      <div className="lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[rgba(7,8,11,0.88)] px-4 backdrop-blur-xl lg:px-7">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-[var(--radius-control)] border border-white/10 text-[var(--text)] lg:hidden"
            aria-label={dictionary.dashboard.openNavigation}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <List aria-hidden="true" className="size-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-[11px] text-[var(--text-tertiary)]">Northstar Atelier</p>
            <p className="mt-0.5 text-xs font-medium text-[var(--text)]">Luxury AI Landing Page</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {localeSwitcher}
            <span className="rounded-[6px] border border-[rgba(214,185,120,0.22)] bg-[rgba(214,185,120,0.06)] px-2.5 py-1 font-mono text-[9px] text-[var(--accent)]">
              {dictionary.common.demoDataset}
            </span>
            <div className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-[var(--text-secondary)]" aria-label={dictionary.dashboard.demoWorkspace}>
              NA
            </div>
          </div>
        </header>
        {children}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label={dictionary.dashboard.closeNavigation}
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-white/10 bg-[var(--surface)] shadow-2xl">
            <button
              type="button"
              aria-label={dictionary.dashboard.closeNavigation}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-[var(--radius-control)] text-[var(--text-secondary)]"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <SidebarContent close={() => setOpen(false)} dictionary={dictionary} />
          </aside>
        </div>
      )}
    </div>
  );
}
