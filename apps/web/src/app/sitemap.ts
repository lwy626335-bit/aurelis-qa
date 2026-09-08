import type { MetadataRoute } from "next";

const origin = process.env.APP_URL ?? "https://aurelis-qa-web.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/dashboard/demo", "/dashboard/documentation", "/dashboard/privacy"].map((path) => ({
    changeFrequency: "weekly",
    priority: path ? 0.7 : 1,
    url: `${origin}${path}`,
  }));
}
