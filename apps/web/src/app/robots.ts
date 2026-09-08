import type { MetadataRoute } from "next";

const origin = process.env.APP_URL ?? "https://aurelis-qa-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { allow: "/", userAgent: "*" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
