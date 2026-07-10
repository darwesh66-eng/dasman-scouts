import type { Metadata } from "next";
import { Cairo, Sora } from "next/font/google";
import IconSprite from "@/components/IconSprite";
import "../../globals.css";
import "./admin.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة التحكم | مجموعة دسمان الكشفية",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${sora.variable}`}>
      <body className="admin-body">
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
