import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { getAppData } from "@/lib/appData";
import { isLang, pick, t, type Lang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";

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
    path: "/about",
    title: lang === "ar" ? "من نحن | مجموعة دسمان الكشفية" : "About | Dasman Scout Group",
    description: lang === "ar" ? "حكاية مجموعة دسمان الكشفية: رسالتنا ورؤيتنا وقيمنا وفريق القادة المؤهلين الذين يشرفون على فرقنا." : "The story of Dasman Scout Group: our mission, vision, values, and the qualified leaders behind our troops.",
    image: data.heroImages?.[0],
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as Lang;
  const data = await getAppData();
  const about = lang === "ar" ? data.about.ar : data.about.en;

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            {t(lang, "aboutTitle1")} <em>{t(lang, "aboutTitleEm")}</em>
          </h1>
          <p className="sub">{t(lang, "aboutSub")}</p>
        </div>
      </header>

      <section className="wrap">
        <div className="story-grid">
          <Reveal>
            <h2>{t(lang, "aboutH2")}</h2>
            <p className="lead">{about.history}</p>
            <p className="lead">{t(lang, "aboutTracks")}</p>
          </Reveal>
          <Reveal className="photo" delay={1}>
            <Image
              src={
                data.gallery.find((g) => g.type === "image" && g.url)?.url ||
                "https://picsum.photos/seed/scout-history-kw/900/720"
              }
              alt={t(lang, "aboutH2")}
              width={900}
              height={720}
              sizes="(max-width: 960px) 100vw, 50vw"
            />
          </Reveal>
        </div>
      </section>

      <section className="wrap">
        <div className="mv-grid">
          <Reveal className="mv-card">
            <span className="badge">
              <Icon id="i-compass" />
            </span>
            <div>
              <h3>{t(lang, "mission")}</h3>
              <p>{about.mission}</p>
            </div>
          </Reveal>
          <Reveal className="mv-card" delay={1}>
            <span className="badge ember">
              <Icon id="i-star" />
            </span>
            <div>
              <h3>{t(lang, "vision")}</h3>
              <p>{about.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="values-band">
        <div className="wrap">
          <Reveal as="h2" className="sec-title">
            {t(lang, "valuesTitle")}
          </Reveal>
          <Reveal as="p" className="sec-sub" delay={1}>
            {t(lang, "valuesSub")}
          </Reveal>
          <div className="val-grid">
            <Reveal className="val">
              <span className="badge ember">
                <Icon id="i-heart" />
              </span>
              <div className="t">{t(lang, "val1T")}</div>
              <div className="s">{t(lang, "val1S")}</div>
            </Reveal>
            <Reveal className="val" delay={1}>
              <span className="badge ember">
                <Icon id="i-compass" />
              </span>
              <div className="t">{t(lang, "val2T")}</div>
              <div className="s">{t(lang, "val2S")}</div>
            </Reveal>
            <Reveal className="val" delay={2}>
              <span className="badge ember">
                <Icon id="i-users" />
              </span>
              <div className="t">{t(lang, "val3T")}</div>
              <div className="s">{t(lang, "val3S")}</div>
            </Reveal>
          </div>
        </div>
      </section>

      {data.leaders.length > 0 && (
        <section className="leaders-sec topo">
          <div className="wrap">
            <Reveal as="h2" className="sec-title">
              {t(lang, "leadersTitle")}
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              {t(lang, "leadersSub")}
            </Reveal>
            <div className="leader-grid">
              {data.leaders.map((l, i) => (
                <Reveal key={l.id} className="leader" delay={(i % 3) as 0 | 1 | 2}>
                  <div className="ph">
                    <Image
                      src={l.photo || `https://picsum.photos/seed/leader-${l.id}/240/240`}
                      alt={pick(lang, l.nameAr, l.nameEn)}
                      width={96}
                      height={96}
                      sizes="96px"
                    />
                  </div>
                  <div className="nm">{pick(lang, l.nameAr, l.nameEn)}</div>
                  {(l.roleAr || l.role) && <div className="rl">{l.roleAr || l.role}</div>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.achievements.length > 0 && (
        <section className="wrap" style={{ paddingBlock: "80px 0" }}>
          <Reveal as="h2" className="sec-title">
            {t(lang, "achTitle")}
          </Reveal>
          <Reveal as="p" className="sec-sub" delay={1}>
            {t(lang, "achSub")}
          </Reveal>
          <div className="ach-strip">
            {data.achievements.map((a, i) => (
              <Reveal key={a.id} className="ach" delay={(i % 3) as 0 | 1 | 2}>
                <span className="badge ember">
                  <Icon id="i-medal" />
                </span>
                <div className="t">{pick(lang, a.titleAr, a.titleEn)}</div>
                {a.year && <div className="y num">{a.year}</div>}
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
