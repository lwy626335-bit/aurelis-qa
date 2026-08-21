import { setLocale } from "@/app/locale-actions";
import type { Dictionary, Locale } from "@/i18n/config";

export function LocaleSwitcher({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  return (
    <div
      aria-label={dictionary.common.language}
      className="flex items-center rounded-[var(--radius-control)] border border-white/10 bg-black/15 p-0.5"
      role="group"
    >
      {(["en", "ja"] as const).map((value) => (
        <form action={setLocale.bind(null, value)} key={value}>
          <button
            aria-pressed={locale === value}
            className={`min-h-7 rounded-[5px] px-2 font-mono text-[9px] transition-colors ${
              locale === value
                ? "bg-white/[0.09] text-[var(--text)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text)]"
            }`}
            type="submit"
          >
            {value === "en" ? "EN" : "日本語"}
          </button>
        </form>
      ))}
    </div>
  );
}
