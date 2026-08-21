import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { getDictionary } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Demo Dashboard",
  description: "AURELIS QA Phase 1 demo dashboard using clearly labeled sample evaluation data.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dictionary, locale } = await getDictionary();
  return (
    <DashboardShell
      dictionary={dictionary}
      localeSwitcher={<LocaleSwitcher dictionary={dictionary} locale={locale} />}
    >
      {children}
    </DashboardShell>
  );
}
