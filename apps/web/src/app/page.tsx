import { LandingPage } from "@/components/landing/landing-page";
import { getDictionary } from "@/i18n/server";

export default async function HomePage() {
  const { dictionary, locale } = await getDictionary();
  return <LandingPage dictionary={dictionary} locale={locale} />;
}
