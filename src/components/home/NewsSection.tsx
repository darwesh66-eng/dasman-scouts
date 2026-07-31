import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import type { NewsItem } from "@/lib/appData";
import { pick, t, type Lang } from "@/lib/i18n";

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

/** Homepage news teaser — same card language as the News page. */
export default function NewsSection({ lang, news }: { lang: Lang; news: NewsItem[] }) {
  if (!news.length) return null;

  return (
    <section className="news-home" id="news">
      <div className="wrap">
        <Reveal as="h2" className="sec-title">
          {t(lang, "newsHomeTitle")}
        </Reveal>
        <Reveal as="p" className="sec-sub" delay={1}>
          {t(lang, "newsHomeSub")}
        </Reveal>

        <div className="news-home-grid">
          {news.map((n, i) => (
            <Reveal key={n.id} className="news-card" delay={(i % 3) as 0 | 1 | 2}>
              {n.image && (
                <Image
                  src={n.image}
                  alt={pick(lang, n.titleAr, n.titleEn)}
                  width={700}
                  height={380}
                  sizes="(max-width: 860px) 100vw, 33vw"
                  className="news-card-img"
                />
              )}
              <div className="body">
                <div className="date">{fmtDate(n.date, lang)}</div>
                <h3>{pick(lang, n.titleAr, n.titleEn)}</h3>
                <p>{pick(lang, n.contentAr, n.contentEn)?.slice(0, 130)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="gal-cta rv in">
          <Link href={`/${lang}/news`} className="btn btn-nv">
            {t(lang, "newsCta")}{" "}
            <span className="ico" style={{ background: "rgba(255,255,255,.18)" }}>
              <Icon id="i-arrow" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
