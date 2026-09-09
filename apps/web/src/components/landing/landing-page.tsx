import { demoReport } from "@aurelis/database/demo";
import { Code, Fingerprint, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { LandingMotion } from "@/components/landing/landing-motion";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { localize, type Dictionary, type Locale } from "@/i18n/config";

import styles from "./landing-page.module.css";

export function LandingPage({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const copy = dictionary.landing;
  const headline = localize(locale, {
    en: ["Quality", "you can prove."],
    ja: ["AIのWeb品質を、", "根拠から判断する。"],
    zh: ["让 AI 网页质量", "有据可证。"],
  });
  const navItems = [
    [localize(locale, { en: "Home", ja: "ホーム", zh: "首页" }), "/"],
    [copy.nav[0][0], "/dashboard/documentation"],
    [copy.nav[1][0], "/dashboard/demo"],
    copy.nav[2],
  ];
  const metrics = [
    ["#", demoReport.overallScore, "", dictionary.snapshot.qualityScore],
    ["<", demoReport.scores.technical, "", dictionary.snapshot.technical],
    ["*", demoReport.scores.brand, "", dictionary.snapshot.brand],
    ["%", demoReport.scores.reliability, "%", dictionary.snapshot.reliability],
  ] as const;
  const navigation = navItems.map(([label, href]) => (
    <Link key={href} href={href} aria-current={href === "/" ? "page" : undefined}>{label}</Link>
  ));

  return (
    <LandingMotion className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <video data-background-video className={styles.video} muted loop playsInline preload="metadata">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
        </video>
      </div>
      <header className={styles.header}>
        <a href="#main-content" className={`sr-only-focusable ${styles.skip}`}>{dictionary.common.skip}</a>
        <Link href="/" aria-label={dictionary.common.home} className={styles.logo}><AurelisMark compact /></Link>
        <nav className={styles.nav} aria-label={copy.primaryNavigation}>{navigation}</nav>
        <Link href="/dashboard" className={styles.dashboard}>{copy.openDashboard}</Link>
        <details data-mobile-menu className={styles.mobileMenu}>
          <summary aria-controls="landing-mobile-nav" aria-expanded="false" aria-label={copy.toggleNavigation}>
            <span /><span /><span />
          </summary>
          <button type="button" data-menu-dismiss className={styles.overlay} aria-label={localize(locale, { en: "Close navigation", ja: "メニューを閉じる", zh: "关闭菜单" })} tabIndex={-1} />
          <nav id="landing-mobile-nav" className={styles.sheet} aria-label={copy.mobileNavigation}>
            {navigation}
            <Link href="/dashboard" className={styles.sheetDashboard}>{copy.openDashboard}</Link>
            <LocaleSwitcher dictionary={dictionary} locale={locale} />
          </nav>
        </details>
      </header>
      <main id="main-content" className={styles.hero} tabIndex={-1}>
        <div className={styles.trust}>
          <div className={styles.rings} aria-hidden="true">
            {[Code, Fingerprint, ShieldCheck].map((Icon, index) => <span key={index}><i><Icon weight="bold" /></i></span>)}
          </div>
          <p>{localize(locale, { en: "Measured. Explained. Reproducible.", ja: "計測・根拠・再現性", zh: "可衡量 · 可解释 · 可复现" })}</p>
        </div>
        <p className={styles.eyebrow}>AURELIS QA / {copy.eyebrow}</p>
        <h1 className={styles.headline} aria-label={copy.heroTitle} data-display={locale === "en"}>
          {headline.map((line) => <span key={line}>{line}</span>)}
        </h1>
        <p className={styles.description}>{copy.heroDescription}</p>
        <Link href="/dashboard/demo" className={styles.cta}>{copy.exploreScore}<span aria-hidden="true">↗</span></Link>
      </main>
      <footer className={styles.footer}>
        <p className={styles.demoLabel}>{dictionary.common.demoDataset}<span aria-hidden="true"> / </span>{copy.noLiveAudit}</p>
        <div className={styles.stats}>
          {metrics.map(([icon, value, suffix, label]) => (
            <div className={styles.stat} key={label}>
              <span className={styles.statIcon} aria-hidden="true">{icon}</span>
              <p className={styles.statValue}><span data-count={value}>{value.toFixed(1)}</span>{suffix}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          ))}
        </div>
        <div className={styles.utility}>
          <span className={styles.copyright}>© 2026 AURELIS QA</span>
          <div className={styles.locale}><LocaleSwitcher dictionary={dictionary} locale={locale} /></div>
          <div className={styles.utilityLinks}>
            <Link href="/dashboard/documentation">{copy.documentation}</Link>
            <Link href="/dashboard/privacy">{copy.privacy}</Link>
            <button data-video-toggle type="button" aria-pressed="false" hidden>
              {localize(locale, { en: "Pause motion", ja: "動画を一時停止", zh: "暂停动态" })}
            </button>
          </div>
        </div>
      </footer>
    </LandingMotion>
  );
}
