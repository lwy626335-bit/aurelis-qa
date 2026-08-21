import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-jp/wght.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { getLocale } from "@/i18n/server";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const description =
    locale === "ja"
      ? "AI生成Webの品質を、決定的な技術検査、根拠に基づくブランド分析、再現可能な採点で評価します。"
      : "Measure AI-generated web quality with deterministic technical checks, evidence-led brand analysis, and reproducible scoring.";

  return {
    metadataBase: new URL("https://aurelis.example"),
    title: {
      default: "AURELIS QA | AI Web Quality Intelligence",
      template: "%s | AURELIS QA",
    },
    description,
    openGraph: { title: "AURELIS QA", description, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} data-theme="dark" data-scroll-behavior="smooth">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  );
}
