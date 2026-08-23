// ─────────────────────────────────────────────────────────────
//  App content layer — reads the same `app_config` single row
//  (id = 1) that the admin panel writes, via Supabase REST.
//  Shapes mirror the legacy AppContext types so existing admin
//  data keeps working unchanged.
// ─────────────────────────────────────────────────────────────

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mepqecczssrarczveolo.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_Cd2oZIqROd-ccS4w5fbdsg_eH4w2VCh";

export interface Group {
  id: string;
  color: string;
  emoji: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}
export interface GalleryItem {
  id: string;
  type: "image" | "instagram" | "youtube";
  url: string;
  captionAr: string;
  captionEn: string;
}
export interface NewsItem {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  image: string;
  date: string;
  published: boolean;
}
export interface Achievement {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  year: string;
}
export interface CalendarEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  date: string;
  time: string;
  groupId: string;
}
export interface Leader {
  id: string;
  nameAr?: string;
  nameEn?: string;
  role?: string;
  roleAr?: string;
  photo?: string;
}
export interface HomeVideo {
  id: string;
  type: "upload" | "youtube" | "instagram";
  url: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
}
export interface Testimonial {
  id: string;
  nameAr?: string;
  nameEn?: string;
  roleAr?: string;
  roleEn?: string;
  textAr: string;
  textEn?: string;
}
export interface Scout {
  id: string;
  groupId: string;
  visible: boolean;
  nameAr?: string;
  nameEn?: string;
  photo?: string;
}
export interface AppData {
  siteName: { ar: string; en: string; subtitle: string };
  about: {
    ar: { history: string; mission: string; vision: string };
    en: { history: string; mission: string; vision: string };
  };
  heroImages: string[];
  logoSettings: { url: string };
  whatsapp: string;
  instagram: string;
  groups: Group[];
  scouts: Scout[];
  leaders: Leader[];
  gallery: GalleryItem[];
  news: NewsItem[];
  events: CalendarEvent[];
  achievements: Achievement[];
  homeVideos: HomeVideo[];
  testimonials: Testimonial[];
}

export const defaultData: AppData = {
  siteName: { ar: "مجموعة دسمان الكشفية", en: "Dasman Scout Group", subtitle: "Dasman Scouts" },
  about: {
    ar: {
      history:
        "مجموعة كشفية كويتية تأسست لتربية النشء على قيم الكشافة الأصيلة: الاعتماد على النفس، خدمة المجتمع، وحب الوطن.",
      mission:
        "إعداد جيل واعٍ قادر على القيادة وتحمّل المسؤولية من خلال أنشطة كشفية هادفة.",
      vision:
        "أن نكون المجموعة الكشفية الرائدة في الكويت في بناء الشخصية المتوازنة.",
    },
    en: {
      history:
        "A Kuwaiti scout group founded to raise youth on authentic scouting values.",
      mission:
        "Preparing a conscious generation capable of leadership and responsibility.",
      vision: "To be Kuwait's leading scout group in building balanced character.",
    },
  },
  heroImages: [],
  logoSettings: { url: "" },
  whatsapp: "",
  instagram: "",
  groups: [],
  scouts: [],
  leaders: [],
  gallery: [],
  news: [],
  events: [],
  achievements: [],
  homeVideos: [],
  testimonials: [],
};

/** Boys vs girls sections, in display order. */
export const BOY_GROUP_IDS = ["ashbal", "fatyan"];
export const GIRL_GROUP_IDS = ["zahrat", "murshidat"];

/** Age labels per known group id (fallback when not derivable from data). */
export const GROUP_AGES: Record<string, { ar: string; en: string }> = {
  ashbal: { ar: "من 8 إلى 11 سنة", en: "Ages 8–11" },
  fatyan: { ar: "من 11 إلى 15 سنة", en: "Ages 11–15" },
  zahrat: { ar: "من 8 إلى 11 سنة", en: "Ages 8–11" },
  murshidat: { ar: "من 11 إلى 15 سنة", en: "Ages 11–15" },
};

export async function getAppData(): Promise<AppData> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/app_config?select=data&id=eq.1`,
      {
        headers: { apikey: SUPABASE_ANON_KEY },
        next: { revalidate: 120 },
      },
    );
    if (!res.ok) return defaultData;
    const rows = (await res.json()) as Array<{ data: Partial<AppData> }>;
    const remote = rows[0]?.data;
    if (!remote) return defaultData;
    // shallow merge is enough: admin always writes complete sub-objects
    return { ...defaultData, ...remote, about: { ...defaultData.about, ...remote.about } };
  } catch {
    return defaultData;
  }
}
