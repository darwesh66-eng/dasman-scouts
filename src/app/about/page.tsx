import type { Metadata } from "next";
import { getAppData } from "@/lib/appData";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";

export const revalidate = 120;
export const metadata: Metadata = { title: "من نحن | مجموعة دسمان الكشفية" };

export default async function AboutPage() {
  const data = await getAppData();
  const about = data.about.ar;

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            حكاية <em>دسمان</em>
          </h1>
          <p className="sub">من أول اجتماع لمجموعة صغيرة، لعائلة كشفية وإرشادية كاملة</p>
        </div>
      </header>

      <section className="wrap">
        <div className="story-grid">
          <Reveal>
            <h2>عن مجموعة دسمان الكشفية</h2>
            <p className="lead">{about.history}</p>
            <p className="lead">
              فرقنا منظمة في مسارين مستقلين: قسم البنين (الأشبال والفتيان) وقسم البنات
              (الزهرات والمرشدات)، ولكل فرقة برنامجها وأنشطتها وقيادتها الخاصة.
            </p>
          </Reveal>
          <Reveal className="photo" delay={1}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                data.gallery.find((g) => g.type === "image")?.url ||
                "https://picsum.photos/seed/scout-history-kw/900/720"
              }
              alt="من تاريخ المجموعة"
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
              <h3>رسالتنا</h3>
              <p>{about.mission}</p>
            </div>
          </Reveal>
          <Reveal className="mv-card" delay={1}>
            <span className="badge ember">
              <Icon id="i-star" />
            </span>
            <div>
              <h3>رؤيتنا</h3>
              <p>{about.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="values-band">
        <div className="wrap">
          <Reveal as="h2" className="sec-title">
            قيمنا
          </Reveal>
          <Reveal as="p" className="sec-sub" delay={1}>
            المبادئ اللي بنربّي عليها
          </Reveal>
          <div className="val-grid">
            <Reveal className="val">
              <span className="badge ember">
                <Icon id="i-heart" />
              </span>
              <div className="t">الانتماء</div>
              <div className="s">حب الوطن وخدمة المجتمع أساس كل نشاط نقوم به.</div>
            </Reveal>
            <Reveal className="val" delay={1}>
              <span className="badge ember">
                <Icon id="i-compass" />
              </span>
              <div className="t">القيادة</div>
              <div className="s">نبني قادة يعتمدون على أنفسهم ويتحملون المسؤولية.</div>
            </Reveal>
            <Reveal className="val" delay={2}>
              <span className="badge ember">
                <Icon id="i-users" />
              </span>
              <div className="t">العمل الجماعي</div>
              <div className="s">روح الفريق الواحد في المخيم والنشاط والحياة.</div>
            </Reveal>
          </div>
        </div>
      </section>

      {data.leaders.length > 0 && (
        <section className="leaders-sec topo">
          <div className="wrap">
            <Reveal as="h2" className="sec-title">
              قادتنا
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              نخبة من القادة والقائدات المؤهلين
            </Reveal>
            <div className="leader-grid">
              {data.leaders.map((l, i) => (
                <Reveal key={l.id} className="leader" delay={(i % 3) as 0 | 1 | 2}>
                  <div className="ph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.photo || `https://picsum.photos/seed/leader-${l.id}/240/240`}
                      alt={l.nameAr || ""}
                    />
                  </div>
                  <div className="nm">{l.nameAr}</div>
                  {(l.roleAr || l.role) && <div className="rl">{l.roleAr || l.role}</div>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.achievements.length > 0 && (
        <section className="wrap">
          <Reveal as="h2" className="sec-title">
            إنجازاتنا
          </Reveal>
          <Reveal as="p" className="sec-sub" delay={1}>
            محطات نفخر بها
          </Reveal>
          <div className="ach-strip">
            {data.achievements.map((a, i) => (
              <Reveal key={a.id} className="ach" delay={(i % 3) as 0 | 1 | 2}>
                <span className="badge ember">
                  <Icon id="i-medal" />
                </span>
                <div className="t">{a.titleAr}</div>
                {a.year && <div className="y num">{a.year}</div>}
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
