import Link from "next/link";

import { AurelisMark } from "@/components/brand/aurelis-mark";
import { MobileNavigation } from "@/components/landing/mobile-navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import type { Dictionary, Locale } from "@/i18n/config";

export function SiteHeader({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const navItems = dictionary.landing.nav;
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.065] bg-[rgba(7,8,11,0.94)] md:bg-[rgba(7,8,11,0.86)] md:backdrop-blur-xl">
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
          <ButtonLink href="/dashboard/demo" className="min-h-9 px-4 text-xs">
            {dictionary.common.openDemo}
          </ButtonLink>
        </nav>

        <MobileNavigation dictionary={dictionary} locale={locale} />
      </div>
    </header>
  );
}
