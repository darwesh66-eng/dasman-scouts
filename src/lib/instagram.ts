/**
 * Instagram post embedding without any API token.
 * Accepts a normal post/reel/tv URL and returns Instagram's public embed URL.
 */
export function igEmbedUrl(url: string): string | null {
  const m = url?.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  // "reels" (plural, from the app's share sheet) embeds under /reel/
  const kind = m[1] === "reels" ? "reel" : m[1];
  return `https://www.instagram.com/${kind}/${m[2]}/embed/`;
}

/** Handle from a profile URL, e.g. https://instagram.com/scouts_dasman/ -> scouts_dasman */
export function igHandle(profileUrl: string): string {
  return profileUrl?.replace(/\/+$/, "").split("/").pop() || "instagram";
}
