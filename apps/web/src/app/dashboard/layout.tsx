import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { getDictionary } from "@/i18n/server";
import { localize } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getDictionary();
  return localize(locale, {
    en: { title: "AURELIS QA workspace", description: "Evaluation workspace with a clearly separated read-only sample report." },
    ja: { title: "AURELIS QA 評価画面", description: "読み取り専用サンプルと実際の評価を明確に分けた評価画面です。" },
    zh: { title: "AURELIS QA 评估工作区", description: "清楚区分只读示例报告与真实评估的工作区。" },
  });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dictionary, locale } = await getDictionary();
  return (
    <DashboardShell
      dictionary={dictionary}
      localeSwitcher={
        <LocaleSwitcher key="dashboard-locale-switcher" dictionary={dictionary} locale={locale} />
      }
    >
      {children}
    </DashboardShell>
  );
}
