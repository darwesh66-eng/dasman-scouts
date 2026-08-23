import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import { t, type Lang } from "@/lib/i18n";

/** Instagram follow band. A live post feed needs a Meta Graph API token;
 *  until then this drives traffic to the account itself. */
export default function InstagramBand({ lang, instagram }: { lang: Lang; instagram: string }) {
  if (!instagram) return null;
  const handle = instagram.replace(/\/+$/, "").split("/").pop() || "instagram";

  return (
    <section className="ig-band">
      <div className="wrap">
        <Reveal className="ig-inner">
          <span className="ig-icon">
            <Icon id="i-instagram" />
          </span>
          <div className="ig-copy">
            <h2>{t(lang, "igTitle")}</h2>
            <p>{t(lang, "igSub")}</p>
          </div>
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-e ig-cta"
          >
            @{handle}{" "}
            <span className="ico">
              <Icon id="i-arrow" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
