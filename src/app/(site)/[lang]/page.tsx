import Link from "next/link";
import { getAppData } from "@/lib/appData";
import { isLang, t, type Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import HeroSection from "@/components/home/HeroSection";
import TrailsSection from "@/components/home/TrailsSection";
import AboutSection from "@/components/home/AboutSection";
import NewsSection from "@/components/home/NewsSection";
import GalleryGrid from "@/components/GalleryGrid";
import VideoCard from "@/components/VideoCard";

export const revalidate = 120;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as Lang;
  const data = await getAppData();

  const heroImage =
    data.heroImages?.[0] || "https://picsum.photos/seed/desert-expedition-dusk/1800/1200";

  // Marketing headline number (per the group's request) — not the DB scout
  // count, which stays the source for internal stats once rosters are filled.
  const stats = [
    { icon: "i-users", ember: true, value: 90, suffix: "+", label: t(lang, "statScouts") },
    ...(data.groups.length > 0
      ? [{ icon: "i-tent", value: data.groups.length, label: t(lang, "statTroops") }]
      : []),
    ...(data.achievements.length > 0
      ? [{ icon: "i-medal", value: data.achievements.length, label: t(lang, "statAwards") }]
      : []),
    ...(data.leaders.length > 0
      ? [{ icon: "i-fleur", value: data.leaders.length, label: t(lang, "statLeaders") }]
      : []),
  ].slice(0, 3);

  const galleryTeaser = data.gallery.filter((g) => g.type === "image" && g.url).slice(0, 6);
  const videos = data.homeVideos.slice(0, 3);
  const latestNews = data.news
    .filter((n) => n.published)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <main>
      <HeroSection lang={lang} heroImage={heroImage} stats={stats} />

      <AboutSection lang={lang} data={data} />

      <TrailsSection lang={lang} groups={data.groups} />

      {galleryTeaser.length > 0 && (
        <section className="gal-sec" id="gallery">
          <div className="wrap">
            <Reveal as="h2" className="sec-title">
              {t(lang, "galTitle")}
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              {t(lang, "galSub")}
            </Reveal>
            <GalleryGrid lang={lang} items={galleryTeaser} />
            <div className="gal-cta rv in">
              <Link href={`/${lang}/gallery`} className="btn btn-nv">
                {t(lang, "galCta")}{" "}
                <span className="ico" style={{ background: "rgba(255,255,255,.18)" }}>
                  <Icon id="i-arrow" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <NewsSection lang={lang} news={latestNews} />

      {videos.length > 0 && (
        <section className="vid-sec topo" id="videos">
          <div className="wrap">
            <Reveal as="h2" className="sec-title">
              {t(lang, "vidTitle")}
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              {t(lang, "vidSub")}
            </Reveal>
            <div className="vid-row">
              {videos.map((v) => (
                <VideoCard key={v.id} lang={lang} video={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="join-sec wrap" id="join">
        <Reveal className="join-panel">
          <div className="glow" />
          <h2>{t(lang, "joinPanelTitle")}</h2>
          <p>{t(lang, "joinPanelText")}</p>
          <div className="btns">
            <Link href={`/${lang}/join`} className="btn btn-e">
              {t(lang, "joinCta")}{" "}
              <span className="ico">
                <Icon id="i-form" />
              </span>
            </Link>
          </div>
          <div className="join-steps">
            <div className="jstep">
              <Icon id="i-form" />
              <div className="t">{t(lang, "step1T")}</div>
              <div className="s">{t(lang, "step1S")}</div>
            </div>
            <div className="jstep">
              <Icon id="i-chat" />
              <div className="t">{t(lang, "step2T")}</div>
              <div className="s">{t(lang, "step2S")}</div>
            </div>
            <div className="jstep">
              <Icon id="i-check" />
              <div className="t">{t(lang, "step3T")}</div>
              <div className="s">{t(lang, "step3S")}</div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
