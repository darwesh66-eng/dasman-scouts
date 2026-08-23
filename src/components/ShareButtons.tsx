"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { t, type Lang } from "@/lib/i18n";

/** WhatsApp share + copy link. Uses the native share sheet on mobile when available. */
export default function ShareButtons({
  lang,
  url,
  title,
}: {
  lang: Lang;
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard can be blocked; fall back to a temporary selection
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const native = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return true;
      } catch {
        /* user dismissed */
      }
    }
    return false;
  };

  return (
    <div className="share-row">
      <span className="share-label">
        <Icon id="i-share" /> {t(lang, "shareLabel")}
      </span>
      <a
        className="share-btn wa"
        href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={async (e) => {
          if (await native()) e.preventDefault();
        }}
        aria-label={t(lang, "shareWhatsapp")}
      >
        <Icon id="i-chat" /> واتساب
      </a>
      <button type="button" className="share-btn" onClick={copy}>
        <Icon id={copied ? "i-check" : "i-link"} /> {t(lang, copied ? "copied" : "copyLink")}
      </button>
    </div>
  );
}
