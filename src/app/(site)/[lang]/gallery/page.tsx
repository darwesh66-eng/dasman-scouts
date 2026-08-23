import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getAppData } from "@/lib/appData";
import { isLang, t, type Lang } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang = (isLang(langParam) ? langParam : "ar") as Lang;
  const data = await getAppData();
  return pageMetadata({
    lang,
    path: "/gallery",
    title: lang === "ar" ? "المعرض | مجموعة دسمان الكشفية" : "Gallery | Dasman Scout Group",
    description: lang === "ar" ? "صور من مخيمات ورحلات وأنشطة مجموعة دسمان الكشفية في الكويت." : "Photos from the camps, trips and activities of Dasman Scout Group in Kuwait.",
    image: data.heroImages?.[0],
  });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as Lang;
  const data = await getAppData();
  const photos = data.gallery.filter((g) => g.type === "image" && g.url);

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            {t(lang, "galPageTitle1")} <em>{t(lang, "galPageTitleEm")}</em>
          </h1>
          <p className="sub">{t(lang, "galPageSub")}</p>
        </div>
      </header>

      <section className="wrap" style={{ paddingBlock: "60px 110px" }}>
        {photos.length > 0 ? (
          <GalleryGrid lang={lang} items={photos} />
        ) : (
          <Reveal>
            <p style={{ textAlign: "center", color: "var(--ink-2)", fontWeight: 700, padding: "30px 0" }}>
              {t(lang, "galEmpty")}
            </p>
          </Reveal>
        )}
      </section>
    </main>
  );
}
