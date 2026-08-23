import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAppData } from "@/lib/appData";
import { isLang, pick, t, type Lang } from "@/lib/i18n";
import { abs, pageMetadata } from "@/lib/seo";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import ShareButtons from "@/components/ShareButtons";

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

export async function generateStaticParams() {
  const data = await getAppData();
  return data.news
    .filter((n) => n.published)
    .flatMap((n) => [
      { lang: "ar", id: n.id },
      { lang: "en", id: n.id },
    ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langParam, id } = await params;
  const lang = (isLang(langParam) ? langParam : "ar") as Lang;
  const data = await getAppData();
  const item = data.news.find((n) => n.id === id && n.published);
  if (!item) return {};

  const title = pick(lang, item.titleAr, item.titleEn);
  const body = pick(lang, item.contentAr, item.contentEn) ?? "";
  return pageMetadata({
    lang,
    path: `/news/${id}`,
    title: `${title} | ${lang === "ar" ? "مجموعة دسمان الكشفية" : "Dasman Scout Group"}`,
    description: body.slice(0, 155),
    image: item.image || data.heroImages?.[0],
    type: "article",
    publishedTime: item.date,
  });
}

export default async function NewsArticle({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: langParam, id } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as Lang;
  const data = await getAppData();

  const item = data.news.find((n) => n.id === id && n.published);
  if (!item) notFound();

  const title = pick(lang, item.titleAr, item.titleEn);
  const body = pick(lang, item.contentAr, item.contentEn) ?? "";
  const url = abs(`/${lang}/news/${id}`);
  const others = data.news
    .filter((n) => n.published && n.id !== id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          datePublished: item.date,
          dateModified: item.date,
          image: item.image ? [abs(item.image)] : undefined,
          articleBody: body,
          inLanguage: lang === "ar" ? "ar-KW" : "en",
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          author: {
            "@type": "Organization",
            name: lang === "ar" ? "مجموعة دسمان الكشفية" : "Dasman Scout Group",
          },
          publisher: {
            "@type": "Organization",
            name: lang === "ar" ? "مجموعة دسمان الكشفية" : "Dasman Scout Group",
            logo: { "@type": "ImageObject", url: abs("/favicon.svg") },
          },
        }}
      />

      <article className="article">
        <header className="article-head topo">
          <div className="wrap">
            <Link href={`/${lang}/news`} className="back-link">
              <Icon id="i-arrow" /> {t(lang, "backToNews")}
            </Link>
            <div className="article-date">
              {t(lang, "publishedOn")} {fmtDate(item.date, lang)}
            </div>
            <h1>{title}</h1>
          </div>
        </header>

        <div className="wrap article-body">
          {item.image && (
            <Reveal className="article-hero">
              <Image
                src={item.image}
                alt={title}
                width={1200}
                height={700}
                priority
                sizes="(max-width: 900px) 100vw, 900px"
                className="article-img"
              />
            </Reveal>
          )}

          <Reveal className="article-text" delay={1}>
            {body.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Reveal>

          <ShareButtons lang={lang} url={url} title={title} />
        </div>

        {others.length > 0 && (
          <section className="news-home" style={{ paddingBlock: "70px 100px" }}>
            <div className="wrap">
              <Reveal as="h2" className="sec-title">
                {t(lang, "newsHomeTitle")}
              </Reveal>
              <div className="news-home-grid" style={{ marginTop: 40 }}>
                {others.map((n, i) => (
                  <Reveal key={n.id} className="news-card" delay={(i % 3) as 0 | 1 | 2}>
                    <Link href={`/${lang}/news/${n.id}`} className="news-card-link">
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
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
