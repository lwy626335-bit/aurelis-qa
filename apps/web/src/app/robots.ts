import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.APP_URL?.replace(/\/$/, "") || "https://aurelis-qa-web.vercel.app";
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${origin}/sitemap.xml` };
}
