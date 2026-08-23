import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import type { IgPost } from "@/lib/appData";
import { igEmbedUrl, igHandle } from "@/lib/instagram";
import { pick, t, type Lang } from "@/lib/i18n";

/**
 * Hand-picked Instagram posts, embedded with Instagram's public embed URL —
 * no Graph API token and nothing to keep refreshing. Admins paste post links.
 */
export default function InstagramSection({
  lang,
  posts,
  instagram,
}: {
  lang: Lang;
  posts: IgPost[];
  instagram: string;
}) {
  const embeds = posts
    .map((p) => ({ ...p, embed: igEmbedUrl(p.url) }))
    .filter((p) => p.embed)
    .slice(0, 6);

  if (!instagram && !embeds.length) return null;
  const handle = igHandle(instagram);

  return (
    <section className="ig-sec" id="instagram">
      <div className="wrap">
        {embeds.length > 0 && (
          <>
            <Reveal as="h2" className="sec-title">
              {t(lang, "igPostsTitle")}
            </Reveal>
            <Reveal as="p" className="sec-sub" delay={1}>
              {t(lang, "igPostsSub")}
            </Reveal>
            <div className={`ig-grid ${embeds.length < 3 ? "few" : ""}`}>
              {embeds.map((p, i) => {
                const caption = pick(lang, p.captionAr, p.captionEn);
                return (
                  <Reveal key={p.id} className="ig-card" delay={(i % 3) as 0 | 1 | 2}>
                    <div className="ig-frame">
                      <iframe
                        src={p.embed as string}
                        title={caption || t(lang, "igViewPost")}
                        loading="lazy"
                        scrolling="no"
                        allowFullScreen
                      />
                    </div>
                    {caption && (
                      <a
                        className="ig-cap"
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon id="i-instagram" /> {caption}
                      </a>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </>
        )}

        {instagram && (
          <Reveal className="ig-inner">
            <span className="ig-icon">
              <Icon id="i-instagram" />
            </span>
            <div className="ig-copy">
              <h2>{t(lang, "igTitle")}</h2>
              <p>{t(lang, "igSub")}</p>
            </div>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="btn btn-e ig-cta">
              @{handle}{" "}
              <span className="ico">
                <Icon id="i-arrow" />
              </span>
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
