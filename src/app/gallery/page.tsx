import type { Metadata } from "next";
import { getAppData } from "@/lib/appData";
import Reveal from "@/components/Reveal";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 120;
export const metadata: Metadata = { title: "المعرض | مجموعة دسمان الكشفية" };

export default async function GalleryPage() {
  const data = await getAppData();
  const photos = data.gallery.filter((g) => g.type === "image");

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            معرض <em>اللحظات</em>
          </h1>
          <p className="sub">كل صورة هنا وراها حكاية ومغامرة وضحكة</p>
        </div>
      </header>

      <section className="wrap" style={{ paddingBlock: "60px 110px" }}>
        {photos.length > 0 ? (
          <GalleryGrid items={photos} />
        ) : (
          <Reveal>
            <p style={{ textAlign: "center", color: "var(--ink-2)", fontWeight: 700, padding: "30px 0" }}>
              المعرض بيتجهّز… قريباً هنشارك معاكم أجمل لحظاتنا
            </p>
          </Reveal>
        )}
      </section>
    </main>
  );
}
