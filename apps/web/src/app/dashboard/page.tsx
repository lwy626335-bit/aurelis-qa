import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getDictionary } from "@/i18n/server";

export default async function DashboardPage() {
  const { dictionary, locale } = await getDictionary();
  return <DashboardOverview dictionary={dictionary} locale={locale} />;
}
