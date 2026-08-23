"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import type { HomeVideo } from "@/lib/appData";
import { pick, t, type Lang } from "@/lib/i18n";
import { igEmbedUrl } from "@/lib/instagram";

function ytId(url: string) {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/)?.[1];
}


export default function VideoCard({ lang, video }: { lang: Lang; video: HomeVideo }) {
  const [playing, setPlaying] = useState(false);
  const yid = video.type === "youtube" ? ytId(video.url) : null;
  const ig = video.type === "instagram" ? igEmbedUrl(video.url) : null;
  const thumb =
    yid != null
      ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg`
      : `https://picsum.photos/seed/dasman-video-${video.id}/700/440`;
  const title = pick(lang, video.titleAr, video.titleEn);
  const desc = pick(lang, video.descriptionAr, video.descriptionEn);

  const iframeStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
  };

  if (playing) {
    return (
      <div className="vid">
        <div className="vid-frame">
          {yid ? (
            <iframe
              src={`https://www.youtube.com/embed/${yid}?autoplay=1`}
              title={title}
              style={iframeStyle}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : ig ? (
            <iframe
              src={ig}
              title={title}
              style={iframeStyle}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : video.url ? (
            <video src={video.url} controls autoPlay style={{ ...iframeStyle, objectFit: "cover" }} />
          ) : null}
        </div>
      </div>
    );
  }

  // A real <button> so the thumbnail is reachable by keyboard and screen readers.
  return (
    <button
      type="button"
      className="vid"
      onClick={() => setPlaying(true)}
      aria-label={`${t(lang, "playVideo")}: ${title}`}
    >
      <Image
        src={thumb}
        alt=""
        width={700}
        height={440}
        sizes="(max-width: 860px) 100vw, 33vw"
        className="vid-thumb"
      />
      <span className="veil" />
      <span className="play">
        <Icon id="i-play" />
      </span>
      <span className="vt">
        <span className="t">{title}</span>
        {desc && <span className="s">{desc}</span>}
      </span>
    </button>
  );
}
