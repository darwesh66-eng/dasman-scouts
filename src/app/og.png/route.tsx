import { ImageResponse } from "next/og";

export const alt = "Dasman Scout Group";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded fallback share card. Pages normally override this with a real photo.
 * Text is Latin-only on purpose: satori does not shape Arabic script, so
 * Arabic would render as disconnected letters.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #142c52 0%, #1b3a6b 55%, #2c5a8f 100%)",
          position: "relative",
        }}
      >
        {/* ember glow */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(217,122,43,0.45), rgba(217,122,43,0))",
            display: "flex",
          }}
        />
        {/* emblem */}
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(140deg,#f0c46a,#d97a2b 60%,#b85f18)",
            marginBottom: 36,
          }}
        >
          <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2c1.8 2.6 2.6 4.6 2.6 6.6 0 2.2-1 3.9-2.6 4.9-1.6-1-2.6-2.7-2.6-4.9 0-2 .8-4 2.6-6.6z" />
            <path d="M8.2 9.4C5.9 9.9 4 11.6 4 13.9c0 1.9 1.4 3.1 3 3.1 1.5 0 2.6-.9 3.2-2.2" />
            <path d="M15.8 9.4c2.3.5 4.2 2.2 4.2 4.5 0 1.9-1.4 3.1-3 3.1-1.5 0-2.6-.9-3.2-2.2" />
            <path d="M9 17h6" />
            <path d="M12 13.5V22" />
          </svg>
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, color: "#fff", letterSpacing: -1, display: "flex" }}>
          Dasman Scout Group
        </div>
        <div style={{ fontSize: 30, color: "#f2b46b", marginTop: 14, display: "flex" }}>
          Dasman Bilingual School · Kuwait
        </div>
        <div
          style={{
            marginTop: 34,
            display: "flex",
            gap: 14,
            fontSize: 23,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          <span>Cubs</span><span>·</span><span>Scouts</span><span>·</span>
          <span>Brownies</span><span>·</span><span>Guides</span>
        </div>
      </div>
    ),
    size,
  );
}
