"use client";

import { ArrowsLeftRight, ChartBar, ChartLineUp, ClockCounterClockwise, Code, Flask, Gauge, GithubLogo, ImageSquare, ShieldCheck, SlidersHorizontal, Sparkle } from "@phosphor-icons/react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

import type { Dictionary } from "@/i18n/config";
import styles from "./workspace.module.css";

const navigationGroups = [
  { key: "evaluate", items: [
    { key: "overview", href: "/dashboard/demo", icon: Gauge },
    { key: "evaluations", href: "/dashboard/evaluations", icon: ChartLineUp },
    { key: "logo", href: "/dashboard/logo", icon: ImageSquare },
  ] },
  { key: "analyze", items: [
    { key: "analytics", href: "/dashboard/analytics", icon: ChartBar },
    { key: "history", href: "/dashboard/history", icon: ClockCounterClockwise },
    { key: "technical", href: "/dashboard/technical", icon: Code },
    { key: "compare", href: "/dashboard/compare", icon: ArrowsLeftRight },
  ] },
  { key: "system", items: [
    { key: "brands", href: "/dashboard/brands", icon: Sparkle },
    { key: "rubrics", href: "/dashboard/rubrics", icon: SlidersHorizontal },
    { key: "research", href: "/dashboard/research", icon: Flask },
    { key: "github", href: "/dashboard/github", icon: GithubLogo },
    { key: "privacy", href: "/dashboard/privacy", icon: ShieldCheck },
  ] },
] as const;

function NavigationHint() {
  const { pending } = useLinkStatus();
  return pending ? <span aria-hidden="true" className="status-pulse size-1 rounded-full bg-current" /> : null;
}

export function CardSidebarNav({ close, compact = false, dictionary }: { close?: () => void; compact?: boolean; dictionary: Dictionary }) {
  const pathname = usePathname();
  const navId = useId();
  return (
    <nav aria-label={dictionary.dashboard.navigation} className={styles.tools} data-compact={compact}>
      {navigationGroups.map((group) => (
        <section key={group.key} aria-labelledby={`${navId}-${group.key}`} data-nav-card>
          <h2 id={`${navId}-${group.key}`}>{dictionary.dashboard.navGroups[group.key]}</h2>
          <ul>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return <li key={item.href}><Link href={item.href} onClick={close} aria-current={active ? "page" : undefined} data-nav-active={active} data-route-href={item.href}>
                <Icon aria-hidden="true" weight="regular" /><span>{dictionary.dashboard.nav[item.key]}</span><NavigationHint />
              </Link></li>;
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
