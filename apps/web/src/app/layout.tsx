import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/noto-sans-jp/wght.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { localize } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { RouteMotionProvider } from "@/components/motion/route-motion-provider";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const isLocalHost = host?.startsWith("localhost") || host?.startsWith("127.0.0.1");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (isLocalHost ? "http" : "https");
  const description = localize(locale, {
    en: "Measure AI-generated web quality with deterministic technical checks, evidence-led brand analysis, and reproducible scoring.",
    ja: "AI生成Webの品質を、決定的な技術検査、根拠に基づくブランド分析、再現可能な採点で評価します。",
    zh: "通过确定性的技术检查、有证据支持的品牌分析与可复现评分，衡量 AI 生成网页的质量。",
  });

  return {
    metadataBase: new URL(host ? `${protocol}://${host}` : "https://aurelis.example"),
    title: {
      default: "AURELIS QA | AI Web Quality Intelligence",
      template: "%s | AURELIS QA",
    },
    description,
    openGraph: {
      title: "AURELIS QA",
      description,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "AURELIS QA — AI Web Quality Intelligence" }],
    },
    twitter: { card: "summary_large_image", title: "AURELIS QA", description, images: ["/og.png"] },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale === "zh" ? "zh-CN" : locale} data-theme="dark" data-scroll-behavior="smooth">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <RouteMotionProvider>{children}</RouteMotionProvider>
      </body>
    </html>
  );
}
