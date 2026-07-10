import { t, type Lang } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Lang }) {
  return (
    <footer>
      © <span className="num">{new Date().getFullYear()}</span> {t(lang, "footer")}
    </footer>
  );
}
