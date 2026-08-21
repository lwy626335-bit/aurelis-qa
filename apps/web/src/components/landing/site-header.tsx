import { List, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { ButtonLink } from "@/components/ui/button-link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import type { Dictionary, Locale } from "@/i18n/config";

export function SiteHeader({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const navItems = dictionary.landing.nav;
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.065] bg-[rgba(7,8,11,0.86)] backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only-focusable absolute left-4 top-3 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[#17140d]"
      >
        {dictionary.common.skip}
      </a>
      <div className="aurelis-shell flex h-16 items-center justify-between">
        <Link href="/" aria-label={dictionary.common.home} className="text-[var(--text)] hover:text-[var(--accent)]">
          <AurelisMark />
        </Link>

        <nav aria-label={dictionary.landing.primaryNavigation} className="hidden items-center gap-5 md:flex">
          {navItems.map(([label, href]) => (
            <Link
              className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)]"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
          <LocaleSwitcher dictionary={dictionary} locale={locale} />
          <ButtonLink href="/dashboard" className="min-h-9 px-4 text-xs">
            {dictionary.common.openDemo}
          </ButtonLink>
        </nav>

        <details className="group md:hidden">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-[var(--radius-control)] border border-white/10 text-[var(--text)] marker:content-none">
            <span className="sr-only">{dictionary.landing.toggleNavigation}</span>
            <List aria-hidden="true" className="size-5 group-open:hidden" />
            <X aria-hidden="true" className="hidden size-5 group-open:block" />
          </summary>

          <nav
            id="mobile-menu"
            aria-label={dictionary.landing.mobileNavigation}
            className="absolute inset-x-0 top-16 border-t border-white/[0.065] bg-[var(--surface)]"
          >
            <div className="aurelis-shell flex flex-col py-3">
              {navItems.map(([label, href]) => (
                <Link
                  className="border-b border-white/[0.055] py-3.5 text-sm text-[var(--text-secondary)] last:border-0"
                  href={href}
                  key={href}
                >
                  {label}
                </Link>
              ))}
              <div className="mt-3"><LocaleSwitcher dictionary={dictionary} locale={locale} /></div>
              <ButtonLink href="/dashboard" className="mt-3 w-full">
                {dictionary.common.openDemo}
              </ButtonLink>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
