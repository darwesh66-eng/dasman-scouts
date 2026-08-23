import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getAppData } from "@/lib/appData";
import { isLang, t, type Lang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import JoinForm from "@/components/JoinForm";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang = (isLang(langParam) ? langParam : "ar") as Lang;
  const data = await getAppData();
  return pageMetadata({
    lang,
    path: "/join",
    title: lang === "ar" ? "انضم إلينا | مجموعة دسمان الكشفية" : "Join Us | Dasman Scout Group",
    description: lang === "ar" ? "سجّل ابنك أو ابنتك في مجموعة دسمان الكشفية: أربع فرق من 8 إلى 15 سنة. النموذج لا يستغرق دقيقتين." : "Enrol your child in Dasman Scout Group: four troops for ages 8–15. The form takes two minutes.",
  });
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const lang = langParam as Lang;
  const data = await getAppData();

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            {t(lang, "joinTitle1")} <em>{t(lang, "joinTitleEm")}</em>
          </h1>
          <p className="sub">{t(lang, "joinSub")}</p>
        </div>
      </header>

      <section className="wrap form-wrap">
        <Reveal>
          <JoinForm lang={lang} groups={data.groups} />
        </Reveal>
        {data.whatsapp && (
          <p className="form-note">
            {t(lang, "fDirect")}{" "}
            <a
              href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(lang, "fDirectLink")}
            </a>
          </p>
        )}
      </section>

      <section className="join-sec wrap" style={{ paddingTop: 0 }}>
        <Reveal className="join-panel">
          <div className="glow" />
          <h2>{t(lang, "afterTitle")}</h2>
          <p>{t(lang, "afterText")}</p>
          <div className="join-steps" style={{ marginTop: 10 }}>
            <div className="jstep">
              <Icon id="i-form" />
              <div className="t">{t(lang, "step1T")}</div>
              <div className="s">{t(lang, "step1S")}</div>
            </div>
            <div className="jstep">
              <Icon id="i-chat" />
              <div className="t">{t(lang, "step2T")}</div>
              <div className="s">{t(lang, "step2S")}</div>
            </div>
            <div className="jstep">
              <Icon id="i-check" />
              <div className="t">{t(lang, "step3T")}</div>
              <div className="s">{t(lang, "step3S")}</div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
