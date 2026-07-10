import Link from "next/link";
import { getAppData } from "@/lib/appData";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import HeroSection from "@/components/home/HeroSection";
import TrailsSection from "@/components/home/TrailsSection";
import GalleryGrid from "@/components/GalleryGrid";
import VideoCard from "@/components/VideoCard";

export const revalidate = 120;

export default async function HomePage() {
  const data = await getAppData();

  const heroImage =
    data.heroImages?.[0] || "https://picsum.photos/seed/desert-expedition-dusk/1800/1200";

  const visibleScouts = data.scouts?.filter((s) => s.visible).length ?? 0;
  const stats = [
    ...(visibleScouts > 0
      ? [
          {
            icon: "i-users",
            ember: true,
            value: visibleScouts,
            suffix: "+",
            label: "كشاف وكشافة",
          },
        ]
      : []),
    ...(data.groups.length > 0
      ? [{ icon: "i-tent", value: data.groups.length, label: "فرق كشفية وإرشادية" }]
      : []),
    ...(data.achievements.length > 0
      ? [{ icon: "i-medal", value: data.achievements.length, label: "إنجازاً وجائزة" }]
      : []),
    ...(data.leaders.length > 0
      ? [{ icon: "i-fleur", value: data.leaders.length, label: "قائداً وقائدة" }]
      : []),
  ].slice(0, 3);

  const galleryTeaser = data.gallery.filter((g) => g.type === "image").slice(0, 6);
  const videos = data.homeVideos.slice(0, 3);

  return (
    <main>
      <HeroSection heroImage={heroImage} stats={stats} />

      <TrailsSection groups={data.groups} />

      {galleryTeaser.length > 0 && (
        <section className="gal-sec" id="gallery">
          <div className="wrap">
            <Reveal as="h2" className="sec-title">
              من قلب المغامرة
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              لقطات حقيقية من أنشطتنا وفعالياتنا
            </Reveal>
            <GalleryGrid items={galleryTeaser} />
            <div className="gal-cta rv in">
              <Link href="/gallery" className="btn btn-nv">
                شاهد المعرض كاملاً{" "}
                <span className="ico" style={{ background: "rgba(255,255,255,.18)" }}>
                  <Icon id="i-arrow" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="vid-sec topo" id="videos">
          <div className="wrap">
            <Reveal as="h2" className="sec-title">
              مقاطع مميزة
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              شاهد لحظاتنا كما عشناها
            </Reveal>
            <div className="vid-row">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="join-sec wrap" id="join">
        <Reveal className="join-panel">
          <div className="glow" />
          <h2>جاهزين للخطوة الأولى؟</h2>
          <p>
            سجّلوا أولادكم وبناتكم في مجموعة دسمان الكشفية وخلّوهم يبدأوا رحلة بناء الشخصية
            والقيادة.
          </p>
          <div className="btns">
            <Link href="/join" className="btn btn-e">
              قدّم طلب انضمام{" "}
              <span className="ico">
                <Icon id="i-form" />
              </span>
            </Link>
          </div>
          <div className="join-steps">
            <div className="jstep">
              <Icon id="i-form" />
              <div className="t">1. املأ الطلب</div>
              <div className="s">نموذج بسيط ياخد دقيقتين</div>
            </div>
            <div className="jstep">
              <Icon id="i-chat" />
              <div className="t">2. نتواصل معك</div>
              <div className="s">القائد المسؤول يرد خلال يومين</div>
            </div>
            <div className="jstep">
              <Icon id="i-check" />
              <div className="t">3. أهلاً بك معنا</div>
              <div className="s">أول نشاط واستلام الزي الكشفي</div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
