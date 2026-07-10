import Icon from "./Icon";

export default function ContactFab({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null;
  const href = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="contact-fab"
      aria-label="تواصل معنا عبر واتساب"
    >
      <span className="cf-ic">
        <Icon id="i-chat" />
      </span>
      <span className="txt">تواصل معنا</span>
    </a>
  );
}
