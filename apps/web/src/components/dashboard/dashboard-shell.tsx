"use client";

import { BookOpenText, List, Pause, Play, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { CardSidebarNav } from "@/components/dashboard/card-sidebar-nav";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { localize, type Dictionary, type Locale } from "@/i18n/config";

import styles from "./workspace.module.css";

export function DashboardShell({ children, dictionary, locale, localeSwitcher }: {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: Locale;
  localeSwitcher: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/dashboard/demo");
  const primaryLinks = [
    [dictionary.dashboard.nav.overview, "/dashboard/demo"],
    [dictionary.dashboard.nav.evaluations, "/dashboard/evaluations"],
    [dictionary.dashboard.nav.brands, "/dashboard/brands"],
    [dictionary.dashboard.nav.research, "/dashboard/research"],
  ];

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduced.matches) element.pause();
      else void element.play().catch(() => {});
    };
    sync();
    reduced.addEventListener("change", sync);
    return () => { reduced.removeEventListener("change", sync); element.pause(); };
  }, []);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className={styles.workspace} data-workspace>
      <div className={styles.background} aria-hidden="true">
        <video ref={video} muted loop playsInline preload="metadata" onPause={() => setPaused(true)} onPlay={() => setPaused(false)}>
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
        </video>
      </div>
      <a href="#workspace-content" className={`sr-only-focusable ${styles.skip}`}>{dictionary.common.skip}</a>
      <header className={styles.header}>
        <Link href="/" aria-label={dictionary.common.home} className={styles.logo}><AurelisMark compact /></Link>
        <nav className={styles.primary} aria-label={dictionary.landing.primaryNavigation}>
          {primaryLinks.map(([label, href]) => <Link href={href} key={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className={styles.language}>{localeSwitcher}</div>
        <IconButton className={styles.motion} aria-label={localize(locale, paused ? { en: "Play background", ja: "背景を再生", zh: "播放背景" } : { en: "Pause background", ja: "背景を一時停止", zh: "暂停背景" })} onClick={() => {
          if (video.current?.paused) void video.current.play().catch(() => {});
          else video.current?.pause();
        }} type="button">{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</IconButton>
        <IconButton aria-controls="dashboard-drawer" aria-label={dictionary.dashboard.openNavigation} aria-expanded={open} className={styles.menuButton} onClick={() => setOpen(true)} type="button"><List aria-hidden="true" className="size-5" /></IconButton>
      </header>
      <div className={styles.navigation}><CardSidebarNav compact dictionary={dictionary} /></div>
      <div className={styles.context}>
        <Link href="/">AURELIS QA</Link><span aria-hidden="true">/</span><span>{dictionary.dashboard.workspace}</span>
        <span className={styles.workspaceState}><i aria-hidden="true" />{isDemo ? dictionary.common.demoDataset : dictionary.dashboard.workspaceReady}</span>
      </div>
      <div id="workspace-content" className={styles.content} tabIndex={-1}>{children}</div>
      <footer className={styles.footer}>
        <span>© 2026 AURELIS QA</span>
        <div><Link href="/dashboard/documentation">{dictionary.dashboard.documentation}</Link><Link href="/dashboard/privacy">{dictionary.landing.privacy}</Link></div>
      </footer>
      <Drawer closeLabel={dictionary.dashboard.closeNavigation} onClose={() => setOpen(false)} open={open} title={dictionary.dashboard.navigation}>
        <div className={styles.drawerHeader}>
          <Link href="/" onClick={() => setOpen(false)}><AurelisMark /></Link>
          <IconButton aria-label={dictionary.dashboard.closeNavigation} onClick={() => setOpen(false)} type="button"><X aria-hidden="true" className="size-5" /></IconButton>
        </div>
        <CardSidebarNav close={() => setOpen(false)} dictionary={dictionary} />
        <Link className={styles.drawerDocs} href="/dashboard/documentation" onClick={() => setOpen(false)}><BookOpenText aria-hidden="true" />{dictionary.dashboard.documentation}</Link>
      </Drawer>
    </div>
  );
}
