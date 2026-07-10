import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dasman-scouts.vercel.app";
const PAGES = ["", "/about", "/gallery", "/news", "/join"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((p) => [
    {
      url: `${SITE}/ar${p}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
      alternates: { languages: { ar: `${SITE}/ar${p}`, en: `${SITE}/en${p}` } },
    },
    {
      url: `${SITE}/en${p}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 0.9 : 0.6,
    },
  ]);
}
