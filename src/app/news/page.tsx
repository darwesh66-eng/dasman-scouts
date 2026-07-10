import type { Metadata } from "next";
import { getAppData } from "@/lib/appData";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";

export const revalidate = 120;
export const metadata: Metadata = { title: "الأخبار والفعاليات | مجموعة دسمان الكشفية" };

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("ar-KW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default async function NewsPage() {
  const data = await getAppData();
  const news = data.news
    .filter((n) => n.published)
    .sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = news;
  const today = new Date().toISOString().split("T")[0];
  const upcoming = data.events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            آخر <em>أخبارنا</em>
          </h1>
          <p className="sub">كل جديد المجموعة، وفعالياتنا القادمة</p>
        </div>
      </header>

      <section className="news-sec wrap">
        {featured ? (
          <>
            <Reveal className="news-feat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image || "https://picsum.photos/seed/dasman-news/900/620"}
                alt={featured.titleAr}
              />
              <div className="body">
                <div className="date">{fmtDate(featured.date)}</div>
                <h3>{featured.titleAr}</h3>
                <p>{featured.contentAr?.slice(0, 220)}</p>
              </div>
            </Reveal>
            {rest.length > 0 && (
              <div className="news-grid">
                {rest.slice(0, 4).map((n, i) => (
                  <Reveal key={n.id} className="news-card" delay={(i % 2) as 0 | 1}>
                    {n.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.image} alt={n.titleAr} loading="lazy" />
                    )}
                    <div className="body">
                      <div className="date">{fmtDate(n.date)}</div>
                      <h4>{n.titleAr}</h4>
                      <p>{n.contentAr?.slice(0, 140)}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        ) : (
          <Reveal>
            <p style={{ textAlign: "center", color: "var(--ink-2)", fontWeight: 700, padding: "40px 0" }}>
              لا توجد أخبار منشورة حالياً — ترقّبوا جديدنا قريباً
            </p>
          </Reveal>
        )}
      </section>

      <section className="events-sec topo">
        <div className="wrap">
          <Reveal as="h2" className="sec-title">
            الفعاليات القادمة
          </Reveal>
          <Reveal as="p" className="sec-sub" delay={1}>
            جهّز شنطتك من دلوقتي
          </Reveal>
          <div className="events-list">
            {upcoming.length > 0 ? (
              upcoming.map((ev, i) => {
                const group = data.groups.find((g) => g.id === ev.groupId);
                const d = new Date(ev.date);
                return (
                  <Reveal key={ev.id} className="event" delay={(i % 3) as 0 | 1 | 2}>
                    <div className="date num">
                      <div className="d">{d.getDate()}</div>
                      <div className="m">
                        {d.toLocaleDateString("ar-KW", { month: "long" })}
                      </div>
                    </div>
                    <div className="info">
                      <div className="t">{ev.titleAr}</div>
                      {ev.time && (
                        <div className="time">
                          <Icon id="i-clock" /> {ev.time}
                        </div>
                      )}
                    </div>
                    {group && (
                      <span className="tag">
                        <Icon id="i-fleur" /> {group.nameAr}
                      </span>
                    )}
                  </Reveal>
                );
              })
            ) : (
              <Reveal>
                <p style={{ textAlign: "center", color: "var(--ink-2)", fontWeight: 700 }}>
                  لا توجد فعاليات قادمة معلنة حالياً
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
