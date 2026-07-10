import { notFound } from "next/navigation";
import { getAppData } from "@/lib/appData";
import { isLang, t, type Lang } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 120;

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
