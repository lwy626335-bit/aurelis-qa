"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import type { Dictionary, Locale } from "@/i18n/config";

export function MobileNavigation({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const details = useRef<HTMLDetailsElement>(null);

  function closeAfterNavigation(event: React.MouseEvent) {
    if ((event.target as HTMLElement).closest("a")) {
      details.current?.removeAttribute("open");
    }
  }

  return (
    <details className="group md:hidden" ref={details}>
      <summary className="interactive-control grid size-10 cursor-pointer list-none place-items-center rounded-[var(--radius-control)] border border-white/10 text-[var(--text)] marker:content-none">
        <span className="sr-only">{dictionary.landing.toggleNavigation}</span>
        <List aria-hidden="true" className="size-5 group-open:hidden" />
        <X aria-hidden="true" className="hidden size-5 group-open:block" />
      </summary>

      <nav
        aria-label={dictionary.landing.mobileNavigation}
        className="absolute inset-x-0 top-16 border-t border-white/[0.065] bg-[var(--surface)]"
        id="mobile-menu"
        onClick={closeAfterNavigation}
      >
        <div className="aurelis-shell flex flex-col py-3">
          {dictionary.landing.nav.map(([label, href]) => (
            <Link
              className="border-b border-white/[0.055] py-3.5 text-sm text-[var(--text-secondary)] last:border-0"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
          <div className="mt-3"><LocaleSwitcher dictionary={dictionary} locale={locale} /></div>
          <ButtonLink href="/dashboard/demo" className="mt-3 w-full">
            {dictionary.common.openDemo}
          </ButtonLink>
        </div>
      </nav>
    </details>
  );
}
