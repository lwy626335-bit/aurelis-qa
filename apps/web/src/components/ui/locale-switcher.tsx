"use client";

import { useFormStatus } from "react-dom";

import { setLocale } from "@/app/locale-actions";
import type { Dictionary, Locale } from "@/i18n/config";

function LocaleButton({ active, label }: { active: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-busy={pending || undefined}
      aria-pressed={active}
      className={`interactive-control min-h-7 rounded-[5px] px-2 font-mono text-[9px] transition-colors ${
        active
          ? "bg-white/[0.09] text-[var(--text)]"
          : "text-[var(--text-tertiary)] hover:text-[var(--text)]"
      }`}
      disabled={pending}
      type="submit"
    >
      {pending && <span aria-hidden="true" className="status-pulse mr-1 inline-block size-1 rounded-full bg-current" />}
      {label}
    </button>
  );
}

export function LocaleSwitcher({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <div
      aria-label={dictionary.common.language}
      className="flex items-center rounded-[var(--radius-control)] border border-white/10 bg-[#07080b]/55 p-0.5"
      role="group"
    >
      {(["en", "ja", "zh"] as const).map((value) => (
        <form action={setLocale.bind(null, value)} key={value}>
          <LocaleButton
            active={locale === value}
            label={{ en: "EN", ja: dictionary.common.japanese, zh: dictionary.common.chinese }[value]}
          />
        </form>
      ))}
    </div>
  );
}
