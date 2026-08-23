import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import type { Testimonial } from "@/lib/appData";
import { pick, t, type Lang } from "@/lib/i18n";

/** Parent testimonials — the strongest persuasion tool for a hesitant family. */
export default function TestimonialsSection({
  lang,
  items,
}: {
  lang: Lang;
  items: Testimonial[];
}) {
  const list = items.filter((x) => (lang === "ar" ? x.textAr : x.textEn || x.textAr));
  if (!list.length) return null;

  return (
    <section className="tst-sec topo" id="testimonials">
      <div className="wrap">
        <Reveal as="h2" className="sec-title">
          {t(lang, "testimonialsTitle")}
        </Reveal>
        <Reveal as="p" className="sec-sub" delay={1}>
          {t(lang, "testimonialsSub")}
        </Reveal>
        <div className={`tst-grid ${list.length === 1 ? "one" : ""}`}>
          {list.slice(0, 3).map((x, i) => (
            <Reveal key={x.id} className="tst-card" delay={(i % 3) as 0 | 1 | 2}>
              <span className="tst-mark">
                <Icon id="i-quote" />
              </span>
              <blockquote>{pick(lang, x.textAr, x.textEn)}</blockquote>
              <footer>
                <span className="badge ember">
                  <Icon id="i-users" />
                </span>
                <div>
                  <div className="nm">{pick(lang, x.nameAr, x.nameEn)}</div>
                  {(x.roleAr || x.roleEn) && (
                    <div className="rl">{pick(lang, x.roleAr, x.roleEn)}</div>
                  )}
                </div>
              </footer>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
