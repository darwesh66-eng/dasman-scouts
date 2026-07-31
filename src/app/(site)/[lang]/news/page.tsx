import { notFound } from "next/navigation";
import Image from "next/image";
import { getAppData } from "@/lib/appData";
import { isLang, pick, t, type Lang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";

export const revalidate = 120;

function fmtDate(d: string, lang: Lang) {
  try {
    return new Date(d).toLocaleDateString(lang === "ar" ? "ar-KW" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as Lang;
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
            {t(lang, "newsTitle1")} <em>{t(lang, "newsTitleEm")}</em>
          </h1>
          <p className="sub">{t(lang, "newsSub")}</p>
        </div>
      </header>

      <section className="news-sec wrap">
        {featured ? (
          <>
            <Reveal className="news-feat">
              <Image
                src={featured.image || "https://picsum.photos/seed/dasman-news/900/620"}
                alt={pick(lang, featured.titleAr, featured.titleEn)}
                width={900}
                height={620}
                sizes="(max-width: 820px) 100vw, 60vw"
                className="news-feat-img"
              />
              <div className="body">
                <div className="date">{fmtDate(featured.date, lang)}</div>
                <h3>{pick(lang, featured.titleAr, featured.titleEn)}</h3>
                <p>{pick(lang, featured.contentAr, featured.contentEn)?.slice(0, 220)}</p>
              </div>
            </Reveal>
            {rest.length > 0 && (
              <div className="news-grid">
                {rest.slice(0, 4).map((n, i) => (
                  <Reveal key={n.id} className="news-card" delay={(i % 2) as 0 | 1}>
                    {n.image && (
                      <Image
                        src={n.image}
                        alt={pick(lang, n.titleAr, n.titleEn)}
                        width={700}
                        height={380}
                        sizes="(max-width: 700px) 100vw, 50vw"
                        className="news-card-img"
                      />
                    )}
                    <div className="body">
                      <div className="date">{fmtDate(n.date, lang)}</div>
                      <h4>{pick(lang, n.titleAr, n.titleEn)}</h4>
                      <p>{pick(lang, n.contentAr, n.contentEn)?.slice(0, 140)}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        ) : (
          <Reveal>
            <p style={{ textAlign: "center", color: "var(--ink-2)", fontWeight: 700, padding: "40px 0" }}>
              {t(lang, "newsEmpty")}
            </p>
          </Reveal>
        )}
      </section>

      <section className="events-sec topo">
        <div className="wrap">
          <Reveal as="h2" className="sec-title">
            {t(lang, "eventsTitle")}
          </Reveal>
          <Reveal as="p" className="sec-sub" delay={1}>
            {t(lang, "eventsSub")}
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
                        {d.toLocaleDateString(lang === "ar" ? "ar-KW" : "en-GB", { month: "long" })}
                      </div>
                    </div>
                    <div className="info">
                      <div className="t">{pick(lang, ev.titleAr, ev.titleEn)}</div>
                      {ev.time && (
                        <div className="time">
                          <Icon id="i-clock" /> {ev.time}
                        </div>
                      )}
                    </div>
                    {group && (
                      <span className="tag">
                        <Icon id="i-fleur" /> {pick(lang, group.nameAr, group.nameEn)}
                      </span>
                    )}
                  </Reveal>
                );
              })
            ) : (
              <Reveal>
                <p style={{ textAlign: "center", color: "var(--ink-2)", fontWeight: 700 }}>
                  {t(lang, "eventsEmpty")}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
