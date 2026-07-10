import type { Metadata, Viewport } from "next";
import { Cairo, Sora } from "next/font/google";
import { getAppData } from "@/lib/appData";
import IconSprite from "@/components/IconSprite";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactFab from "@/components/ContactFab";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "مجموعة دسمان الكشفية | Dasman Scout Group",
  description:
    "الموقع الرسمي لمجموعة دسمان الكشفية — فرق كشفية وإرشادية للبنين والبنات في الكويت",
};

export const viewport: Viewport = {
  themeColor: "#1b3a6b",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAppData();
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${sora.variable}`}>
      <body>
        <IconSprite />
        <Nav logoUrl={data.logoSettings?.url ?? ""} />
        {children}
        <Footer />
        <ContactFab whatsapp={data.whatsapp} />
      </body>
    </html>
  );
}
