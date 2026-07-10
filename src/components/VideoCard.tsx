"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import type { HomeVideo } from "@/lib/appData";

function ytId(url: string) {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/)?.[1];
}
function igEmbed(url: string) {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/` : null;
}

export default function VideoCard({ video }: { video: HomeVideo }) {
  const [playing, setPlaying] = useState(false);
  const yid = video.type === "youtube" ? ytId(video.url) : null;
  const ig = video.type === "instagram" ? igEmbed(video.url) : null;
  const thumb =
    yid != null
      ? `https://img.youtube.com/vi/${yid}/hqdefault.jpg`
      : `https://picsum.photos/seed/dasman-video-${video.id}/700/440`;

  const iframeStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
  };

  return (
    <div className="vid" onClick={() => !playing && setPlaying(true)}>
      {playing ? (
        <div style={{ position: "relative", aspectRatio: "16/10", background: "#0a1226" }}>
          {yid ? (
            <iframe
              src={`https://www.youtube.com/embed/${yid}?autoplay=1`}
              style={iframeStyle}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : ig ? (
            <iframe src={ig} style={iframeStyle} allow="autoplay; encrypted-media" allowFullScreen />
          ) : video.url ? (
            <video src={video.url} controls autoPlay style={{ ...iframeStyle, objectFit: "cover" }} />
          ) : null}
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt={video.titleAr} loading="lazy" />
          <div className="veil" />
          <span className="play">
            <Icon id="i-play" />
          </span>
          <div className="vt">
            <div className="t">{video.titleAr}</div>
            {video.descriptionAr && <div className="s">{video.descriptionAr}</div>}
          </div>
        </>
      )}
    </div>
  );
}
