import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { LOGO_DATA } from '@/logoData';
import { isFirebaseConfigured } from '@/firebaseConfig';

// ─────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────
export type Lang = 'ar' | 'en';

export interface Leader {
  id: string;
  nameAr: string;
  nameEn: string;
  photo: string;
  role: string;
  roleEn: string;
  groupId: string;
}
export interface Group {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  emoji: string;
  descriptionAr: string;
  descriptionEn: string;
}
export interface Scout {
  id: string;
  nameAr: string;
  nameEn: string;
  photo: string;
  groupId: string;
  visible: boolean;
  grade?: string;
}
export interface ActivityMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumb: string;
  caption: string;
}
export interface Activity {
  id: string;
  nameAr: string;
  nameEn: string;
  photo: string;
  date: string;
  descriptionAr: string;
  descriptionEn: string;
  media: ActivityMedia[];
}
export interface GalleryItem {
  id: string;
  type: 'image' | 'instagram' | 'youtube';
  url: string;
  captionAr: string;
  captionEn: string;
}
export interface ArchiveYear {
  id: string;
  year: string;
  descriptionAr: string;
  descriptionEn: string;
  coverPhoto: string;
  items: GalleryItem[];
}
export interface AdminUser {
  username: string;
  password: string;
  isMain: boolean;
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
export interface SiteColors {
  primary: string;
  secondary: string;
  bgColor: string;
}
export interface LogoSettings {
  url: string;
  navSize: number;
  footerSize: number;
  shape: 'circle' | 'rounded' | 'square';
  innerScale: number;
  showInNav: boolean;
  showInFooter: boolean;
}
export interface SiteName {
  ar: string;
  en: string;
  subtitle: string;
}
export interface HomeVideo {
  id: string;
  type: 'upload' | 'youtube' | 'instagram';
  url: string;
  titleAr: string;
  titleEn: string;
}
export interface ScoutOfMonth {
  scoutId: string;
  groupId: string;
  month: string;
  monthEn: string;
  reasonAr: string;
  reasonEn: string;
}
export interface JoinRequest {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  age: string;
  groupId: string;
  message: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface WelcomePopup {
  enabled: boolean;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  btnTextAr: string;
  btnTextEn: string;
  image: string;
  delayMs: number;
  showOnce: boolean;
}
export interface MediaSettings {
  heroHeight: number;
  cardImageHeight: number;
  scoutPhotoSize: number;
  cardBorderRadius: number;
  cardBorderWidth: number;
  cardBorderColor: string;
  imageFit: 'cover' | 'contain';
  showCardShadow: boolean;
  heroOverlayOpacity: number;
  galleryFit: 'cover' | 'contain' | 'natural';
}
export interface AppData {
  admins: AdminUser[];
  heroImages: string[];
  about: {
    ar: { history: string; mission: string; vision: string };
    en: { history: string; mission: string; vision: string };
  };
  groups: Group[];
  leaders: Leader[];
  scouts: Scout[];
  activities: Activity[];
  gallery: GalleryItem[];
  archive: ArchiveYear[];
  news: NewsItem[];
  achievements: Achievement[];
  events: CalendarEvent[];
  siteColors: SiteColors;
  logoSettings: LogoSettings;
  siteName: SiteName;
  homeVideos: HomeVideo[];
  scoutsOfMonth: ScoutOfMonth[];
  mediaSettings: MediaSettings;
  whatsapp: string;
  instagram: string;
  schoolUrl: string;
  scoutFieldsConfig: { grade: boolean };
  welcomePopup: WelcomePopup;
  joinRequests: JoinRequest[];
}

// ─────────────────────────────────────────
//  DEFAULT DATA
// ─────────────────────────────────────────
const defaultData: AppData = {
  admins: [{ username: 'darwesh2511', password: '97814592', isMain: true }],
  heroImages: [],
  about: {
    ar: {
      history:
        'تأسست مجموعة دسمان الكشفية منذ سنوات طويلة وهي تُعدّ من أعرق المجموعات الكشفية في الكويت، حيث أسهمت في بناء أجيال واعية تحمل قيم الكشافة الأصيلة.',
      mission:
        'تنمية شخصية الفتى والفتاة من الناحية الجسدية والعقلية والروحية والاجتماعية؛ ليكونوا مواطنين صالحين قادرين على خدمة وطنهم ومجتمعهم.',
      vision:
        'أن نكون مجموعة كشفية رائدة تُخرّج قيادات مؤهلة تستطيع أن تواجه تحديات المستقبل وتُشارك في بناء مجتمع أفضل.',
    },
    en: {
      history:
        'Dasman Scout Group has been a cornerstone of scouting in Kuwait for many years, shaping generations of young leaders with genuine scout values.',
      mission:
        'To develop the physical, intellectual, spiritual, and social character of youth, enabling them to become responsible citizens who serve their country and community.',
      vision:
        'To be a leading scout group that produces qualified leaders capable of meeting future challenges and contributing to a better society.',
    },
  },
  groups: [
    {
      id: 'ashbal',
      nameAr: 'أشبال',
      nameEn: 'Cubs',
      color: '#F59E0B',
      emoji: '🦁',
      descriptionAr: 'فرقة الأشبال للأعمار من 8 إلى 11 سنة، تُركّز على الأنشطة الترفيهية والتعليمية والمهارات الأساسية.',
      descriptionEn: 'Cubs troop for ages 8–11, focusing on fun activities, basic skills, and early scouting values.',
    },
    {
      id: 'fatyan',
      nameAr: 'فتيان',
      nameEn: 'Scouts',
      color: '#3B82F6',
      emoji: '⚜️',
      descriptionAr: 'فرقة الفتيان للأعمار من 11 إلى 15 سنة، تُركّز على المهارات الكشفية المتقدمة والخدمة المجتمعية.',
      descriptionEn: 'Scouts troop for ages 11–15, focusing on advanced scouting skills and community service.',
    },
    {
      id: 'zahrat',
      nameAr: 'زهرات',
      nameEn: 'Brownies',
      color: '#10B981',
      emoji: '🌸',
      descriptionAr: 'فرقة الزهرات للفتيات من 8 إلى 11 سنة، تُركّز على تنمية المهارات الإبداعية والاجتماعية.',
      descriptionEn: 'Brownies troop for girls ages 8–11, focusing on creativity and social skills development.',
    },
    {
      id: 'murshidat',
      nameAr: 'مرشدات',
      nameEn: 'Guides',
      color: '#8B5CF6',
      emoji: '🌟',
      descriptionAr: 'فرقة المرشدات للفتيات من 11 إلى 15 سنة، تُركّز على القيادة وخدمة المجتمع.',
      descriptionEn: 'Guides troop for girls ages 11–15, focusing on leadership and community service.',
    },
  ],
  leaders: [],
  scouts: [],
  activities: [],
  gallery: [],
  archive: [],
  news: [],
  achievements: [],
  events: [],
  siteColors: { primary: '#1B3A6B', secondary: '#5BA4CF', bgColor: '#F7F4EF' },
  logoSettings: {
    url: LOGO_DATA,
    navSize: 46,
    footerSize: 46,
    shape: 'circle',
    innerScale: 100,
    showInNav: true,
    showInFooter: true,
  },
  siteName: {
    ar: 'مجموعة دسمان الكشفية',
    en: 'Dasman Scout Group',
    subtitle: 'Dasman Bilingual School',
  },
  homeVideos: [],
  scoutsOfMonth: [],
  mediaSettings: {
    heroHeight: 100,
    cardImageHeight: 190,
    scoutPhotoSize: 72,
    cardBorderRadius: 14,
    cardBorderWidth: 0,
    cardBorderColor: '#5BA4CF',
    imageFit: 'cover',
    showCardShadow: true,
    heroOverlayOpacity: 0.65,
    galleryFit: 'cover',
  },
  whatsapp: '',
  instagram: 'https://www.instagram.com/scouts_dasman/',
  schoolUrl: 'https://www.dbs.edu.kw/',
  scoutFieldsConfig: { grade: false },
  joinRequests: [],
  welcomePopup: {
    enabled: false,
    titleAr: 'أهلاً وسهلاً بكم 👋',
    titleEn: 'Welcome! 👋',
    bodyAr: 'أهلاً بكم في موقع مجموعة دسمان الكشفية. اكتشفوا معنا رحلة الكشافة وانضموا لعائلتنا الكبيرة.',
    bodyEn: 'Welcome to Dasman Scout Group. Discover the adventure of scouting and join our big scout family.',
    btnTextAr: 'ابدأ الاستكشاف ⚜️',
    btnTextEn: 'Start Exploring ⚜️',
    image: '',
    delayMs: 1500,
    showOnce: true,
  },
};

// ─────────────────────────────────────────
//  DEEP MERGE HELPER
// ─────────────────────────────────────────
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as Record<string, unknown>;
  for (const key in source) {
    const sv = source[key];
    const tv = (target as Record<string, unknown>)[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else if (sv !== undefined) {
      result[key] = sv;
    }
  }
  return result as T;
}

// ─────────────────────────────────────────
//  APPLY CSS VARS FROM DATA
// ─────────────────────────────────────────
function applyCssVars(d: AppData) {
  const root = document.documentElement;
  root.style.setProperty('--primary', d.siteColors.primary);
  root.style.setProperty('--secondary', d.siteColors.secondary);
  root.style.setProperty('--bg', d.siteColors.bgColor);
  root.style.setProperty('--primary-light', d.siteColors.primary + '18');
  root.style.setProperty('--secondary-light', d.siteColors.secondary + '20');
  root.style.setProperty('--hero-h', `${d.mediaSettings.heroHeight}vh`);
  root.style.setProperty('--card-img-h', `${d.mediaSettings.cardImageHeight}px`);
  root.style.setProperty('--scout-photo', `${d.mediaSettings.scoutPhotoSize}px`);
  root.style.setProperty('--card-border-w', `${d.mediaSettings.cardBorderWidth}px`);
  root.style.setProperty('--card-border-c', d.mediaSettings.cardBorderColor);
  root.style.setProperty('--card-radius', `${d.mediaSettings.cardBorderRadius}px`);
  root.style.setProperty('--img-fit', d.mediaSettings.imageFit);
  root.style.setProperty('--hero-overlay', String(d.mediaSettings.heroOverlayOpacity));
}

// ─────────────────────────────────────────
//  CONTEXT TYPE
// ─────────────────────────────────────────
interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  data: AppData;
  setData: (d: AppData) => void;
  isAdmin: boolean;
  currentUser: AdminUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  t: (ar: string, en: string) => string;
  firebaseReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// ─────────────────────────────────────────
//  PROVIDER
// ─────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [dataState, setDataState] = useState<AppData>(defaultData);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(!isFirebaseConfigured());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dasman_scout_data_v2');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AppData>;
        const merged = deepMerge(defaultData, parsed);
        setDataState(merged);
        applyCssVars(merged);
      } catch {
        // ignore corrupt data
      }
    }

    // Load lang preference
    const storedLang = localStorage.getItem('dasman_lang') as Lang | null;
    if (storedLang === 'ar' || storedLang === 'en') setLangState(storedLang);

    // Restore session
    const session = sessionStorage.getItem('dasman_admin');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch {
        // ignore
      }
    }

    // Firebase integration
    if (isFirebaseConfigured()) {
      loadFromFirebase();
    }
  }, []);

  const loadFromFirebase = async () => {
    try {
      const { loadFromFirestore } = await import('@/lib/firestoreService');
      const remote = await loadFromFirestore();
      if (remote) {
        const merged = deepMerge(defaultData, remote as Partial<AppData>);
        setDataState(merged);
        applyCssVars(merged);
      }
    } catch (err) {
      console.warn('Firebase load failed:', err);
    } finally {
      setFirebaseReady(true);
    }
  };

  const setData = useCallback((d: AppData) => {
    setDataState(d);
    applyCssVars(d);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem('dasman_scout_data_v2', JSON.stringify(d));
      // Save to Firestore in background if configured
      if (isFirebaseConfigured()) {
        import('@/lib/firestoreService')
          .then(({ saveToFirestore }) => saveToFirestore(d))
          .catch(console.warn);
      }
    }, 400);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('dasman_lang', l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const login = useCallback(
    (username: string, password: string): boolean => {
      const user = dataState.admins.find(
        (a) => a.username === username && a.password === password,
      );
      if (user) {
        setCurrentUser(user);
        sessionStorage.setItem('dasman_admin', JSON.stringify(user));
        return true;
      }
      return false;
    },
    [dataState.admins],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('dasman_admin');
  }, []);

  const t = useCallback(
    (ar: string, en: string) => (lang === 'ar' ? ar : en),
    [lang],
  );

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        data: dataState,
        setData,
        isAdmin: currentUser !== null,
        currentUser,
        login,
        logout,
        t,
        firebaseReady,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
