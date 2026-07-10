import type { Metadata } from "next";
import { getAppData } from "@/lib/appData";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import JoinForm from "@/components/JoinForm";

export const revalidate = 120;
export const metadata: Metadata = { title: "انضم إلينا | مجموعة دسمان الكشفية" };

export default async function JoinPage() {
  const data = await getAppData();

  return (
    <main>
      <header className="page-head topo">
        <div className="wrap">
          <h1>
            ابدأ <em>رحلتك</em>
          </h1>
          <p className="sub">املأ النموذج وهيتواصل معك القائد المسؤول خلال يومين</p>
        </div>
      </header>

      <section className="wrap form-wrap">
        <Reveal>
          <JoinForm groups={data.groups} />
        </Reveal>
        {data.whatsapp && (
          <p className="form-note">
            تفضّل التواصل المباشر؟{" "}
            <a
              href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              كلمنا واتساب
            </a>
          </p>
        )}
      </section>

      <section className="join-sec wrap" style={{ paddingTop: 0 }}>
        <Reveal className="join-panel">
          <div className="glow" />
          <h2>إيه اللي بعد الطلب؟</h2>
          <p>ثلاث خطوات بسيطة تفصل ابنك أو بنتك عن أول مغامرة كشفية.</p>
          <div className="join-steps" style={{ marginTop: 10 }}>
            <div className="jstep">
              <Icon id="i-form" />
              <div className="t">1. املأ الطلب</div>
              <div className="s">نموذج بسيط ياخد دقيقتين</div>
            </div>
            <div className="jstep">
              <Icon id="i-chat" />
              <div className="t">2. نتواصل معك</div>
              <div className="s">القائد المسؤول يرد خلال يومين</div>
            </div>
            <div className="jstep">
              <Icon id="i-check" />
              <div className="t">3. أهلاً بك معنا</div>
              <div className="s">أول نشاط واستلام الزي الكشفي</div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
