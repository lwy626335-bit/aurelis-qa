import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurelis.example"),
  title: {
    default: "AURELIS QA | AI Web Quality Intelligence",
    template: "%s | AURELIS QA",
  },
  description:
    "Measure AI-generated web quality with deterministic technical checks, evidence-led brand analysis, and reproducible scoring.",
  openGraph: {
    title: "AURELIS QA",
    description: "Measure what AI creates.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  );
}
