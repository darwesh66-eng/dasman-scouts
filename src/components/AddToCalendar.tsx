import Icon from "@/components/Icon";
import { t, type Lang } from "@/lib/i18n";

/** Downloads a .ics generated server-side, so iOS/Android/Outlook all accept it. */
export default function AddToCalendar({ lang, eventId }: { lang: Lang; eventId: string }) {
  return (
    <a
      className="cal-btn"
      href={`/api/ics?id=${encodeURIComponent(eventId)}&lang=${lang}`}
      aria-label={t(lang, "addToCalendar")}
    >
      <Icon id="i-cal" /> {t(lang, "addToCalendar")}
    </a>
  );
}
