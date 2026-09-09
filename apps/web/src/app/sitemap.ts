import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.APP_URL?.replace(/\/$/, "") || "https://aurelis-qa-web.vercel.app";
  return ["", "/dashboard/demo", "/dashboard/documentation", "/dashboard/privacy"].map((path) => ({ url: `${origin}${path}` }));
}
