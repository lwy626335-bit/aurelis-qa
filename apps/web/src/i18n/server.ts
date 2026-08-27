import "server-only";

import { cookies, headers } from "next/headers";

import { dictionaries, isLocale, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const savedLocale = (await cookies()).get("aurelis-locale")?.value;
  if (isLocale(savedLocale)) return savedLocale;

  const preferredLanguage = (await headers()).get("accept-language")?.split(",")[0].toLowerCase();
  if (preferredLanguage?.startsWith("ja")) return "ja";
  if (preferredLanguage?.startsWith("zh")) return "zh";
  return "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, dictionary: dictionaries[locale] };
}
