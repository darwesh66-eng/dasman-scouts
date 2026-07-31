import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import type { AppData } from "@/lib/appData";
import { t, type Lang } from "@/lib/i18n";

/** Homepage "who we are" block — same composition as the About page
 *  (story split + mission/vision cards), minus leaders and achievements. */
export default function AboutSection({ lang, data }: { lang: Lang; data: AppData }) {
  const about = lang === "ar" ? data.about.ar : data.about.en;
  const photo =
    data.gallery.find((g) => g.type === "image" && g.url)?.url ||
    data.heroImages?.[1] ||
    "https://picsum.photos/seed/scout-history-kw/900/720";

  return (
    <section className="about-home topo" id="about">
      <div className="wrap">
        <div className="story-grid">
          <Reveal>
            <span className="eyebrow-home">
              <Icon id="i-fleur" /> {t(lang, "aboutHomeKicker")}
            </span>
            <h2>{t(lang, "aboutH2")}</h2>
            <p className="lead">{about.history}</p>
            <p className="lead">{t(lang, "aboutTracks")}</p>
            <Link href={`/${lang}/about`} className="btn btn-nv" style={{ marginTop: 8 }}>
              {t(lang, "aboutCta")}{" "}
              <span className="ico" style={{ background: "rgba(255,255,255,.18)" }}>
                <Icon id="i-arrow" />
              </span>
            </Link>
          </Reveal>
          <Reveal className="photo" delay={1}>
            <Image
              src={photo}
              alt={t(lang, "aboutH2")}
              width={900}
              height={720}
              sizes="(max-width: 960px) 100vw, 50vw"
            />
          </Reveal>
        </div>

        <div className="mv-grid mv-grid-home">
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
      </div>
    </section>
  );
}
