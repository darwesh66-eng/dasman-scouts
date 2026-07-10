import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cairo, Sora } from "next/font/google";
import { getAppData } from "@/lib/appData";
import { LANGS, isLang, type Lang } from "@/lib/i18n";
import IconSprite from "@/components/IconSprite";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactFab from "@/components/ContactFab";
import "../../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#1b3a6b" };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const common = {
    icons: { icon: "/favicon.svg" },
    manifest: "/manifest.json",
  };
  return lang === "en"
    ? {
        ...common,
        title: "Dasman Scout Group",
        description:
          "Official website of Dasman Scout Group — scout and guide troops for boys and girls in Kuwait",
      }
    : {
        ...common,
        title: "مجموعة دسمان الكشفية | Dasman Scout Group",
        description:
          "الموقع الرسمي لمجموعة دسمان الكشفية — فرق كشفية وإرشادية للبنين والبنات في دولة الكويت",
      };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const l = lang as Lang;
  const data = await getAppData();

  return (
    <html lang={l} dir={l === "ar" ? "rtl" : "ltr"} className={`${cairo.variable} ${sora.variable}`}>
      <body>
        <IconSprite />
        <Nav lang={l} logoUrl={data.logoSettings?.url ?? ""} />
        {children}
        <Footer lang={l} />
        <ContactFab lang={l} whatsapp={data.whatsapp} />
      </body>
    </html>
  );
}
