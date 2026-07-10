import Icon from "./Icon";
import { t, type Lang } from "@/lib/i18n";

export default function ContactFab({ lang, whatsapp }: { lang: Lang; whatsapp: string }) {
  if (!whatsapp) return null;
  const href = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="contact-fab"
      aria-label={t(lang, "contactUs")}
    >
      <span className="cf-ic">
        <Icon id="i-chat" />
      </span>
      <span className="txt">{t(lang, "contactUs")}</span>
    </a>
  );
}
