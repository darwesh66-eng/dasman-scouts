import { getAppData } from "@/lib/appData";

/** Minimal ICS escaping: backslashes, commas, semicolons and newlines. */
function esc(v: string) {
  return v
    .split("\\")
    .join("\\\\")
    .split(";")
    .join("\\;")
    .split(",")
    .join("\\,")
    .split("\r")
    .join("")
    .split("\n")
    .join("\\n");
}

/** "5:00 مساءً" / "17:00" → { h, m } in 24h, defaulting to 16:00. */
function parseTime(time: string): { h: number; m: number } {
  const match = time?.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
  if (!match) return { h: 16, m: 0 };
  let h = Number(match[1]);
  const m = Number(match[2]);
  const pm = /مساء|م\b|pm/i.test(time);
  const am = /صباح|ص\b|am/i.test(time);
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return { h, m };
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const lang = url.searchParams.get("lang") === "en" ? "en" : "ar";

  const data = await getAppData();
  const ev = data.events.find((e) => e.id === id);
  if (!ev) return new Response("Event not found", { status: 404 });

  const title = (lang === "ar" ? ev.titleAr : ev.titleEn) || ev.titleAr;
  const desc = (lang === "ar" ? ev.descriptionAr : ev.descriptionEn) || "";
  const { h, m } = parseTime(ev.time || "");

  // Kuwait is UTC+3 year-round, so local → UTC is a fixed shift.
  const start = new Date(`${ev.date}T00:00:00Z`);
  start.setUTCHours(h - 3, m, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dasman Scout Group//Events//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.id}@dasman-scouts`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    desc ? `DESCRIPTION:${esc(desc)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="dasman-event-${ev.id}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
