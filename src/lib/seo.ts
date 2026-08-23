import type { Metadata } from "next";
import type { Lang } from "./i18n";

export const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dasman-scouts.vercel.app";

/** Absolute URL for any site-relative path. */
export function abs(path: string) {
  return path.startsWith("http") ? path : `${SITE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Canonical + hreflang + Open Graph / Twitter card for one page.
 * `path` is the route WITHOUT the locale prefix, e.g. "" | "/about" | "/news/abc".
 */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  image,
  type = "website",
  publishedTime,
}: {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const url = abs(`/${lang}${path}`);
  const ogImage = image ? abs(image) : abs("/og.png");

  return {
    title,
    description,
    metadataBase: new URL(SITE),
    alternates: {
      canonical: url,
      languages: {
        ar: abs(`/ar${path}`),
        en: abs(`/en${path}`),
        "x-default": abs(`/ar${path}`),
      },
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: lang === "ar" ? "مجموعة دسمان الكشفية" : "Dasman Scout Group",
      locale: lang === "ar" ? "ar_KW" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    icons: { icon: "/favicon.svg" },
    manifest: "/manifest.json",
  };
}
