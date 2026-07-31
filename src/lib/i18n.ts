// ─────────────────────────────────────────────
//  Bilingual dictionary — Modern Standard Arabic (فصحى) + English.
//  DB content is already bilingual (nameAr/nameEn…); this covers UI strings.
// ─────────────────────────────────────────────

export type Lang = "ar" | "en";
export const LANGS: Lang[] = ["ar", "en"];
export const isLang = (v: string): v is Lang => v === "ar" || v === "en";

const dict = {
  // nav
  navHome: { ar: "الرئيسية", en: "Home" },
  navAbout: { ar: "من نحن", en: "About" },
  navGallery: { ar: "المعرض", en: "Gallery" },
  navNews: { ar: "الأخبار والفعاليات", en: "News & Events" },
  navJoin: { ar: "انضم إلينا", en: "Join Us" },
  brand: { ar: "مجموعة دسمان الكشفية", en: "Dasman Scout Group" },
  footer: { ar: "مجموعة دسمان الكشفية · دولة الكويت", en: "Dasman Scout Group · Kuwait" },
  contactUs: { ar: "تواصل معنا", en: "Contact us" },

  // hero
  kicker: { ar: "مدرسة دسمان ثنائية اللغة", en: "Dasman Bilingual School" },
  heroTitle1: { ar: "كل رحلة عظيمة", en: "Every great journey" },
  heroTitle2: { ar: "تبدأ", en: "begins with a" },
  heroTitleEm: { ar: "بخطوة", en: "step" },
  heroTag: {
    ar: "في مجموعة دسمان الكشفية يتعلم أبناؤكم وبناتكم الاعتماد على النفس والقيادة وحب الوطن، في بيئة آمنة وبإشراف قادة مؤهلين.",
    en: "At Dasman Scout Group, your sons and daughters learn self-reliance, leadership, and love of country, in a safe environment guided by qualified leaders.",
  },
  ctaStart: { ar: "ابدأ رحلتك معنا", en: "Start your journey" },
  ctaTroops: { ar: "تعرف على الفرق", en: "Meet the troops" },
  statScouts: { ar: "كشاف وكشافة", en: "Scouts" },
  statTroops: { ar: "فرق كشفية", en: "Scout troops" },
  statAwards: { ar: "إنجازاً وجائزة", en: "Awards & honors" },
  statLeaders: { ar: "قادة وقائدات", en: "Leaders" },

  // trails
  trailsTitle: { ar: "فرقنا الكشفية", en: "Our Scout Troops" },
  trailsSub: {
    ar: "مسار مستقل للبنين ومسار مستقل للبنات، ولكل مرحلة عمرية فرقتها",
    en: "A separate track for boys and one for girls, with a troop for every age group",
  },
  boysSection: { ar: "قسم البنين", en: "Boys Section" },
  boysSub: { ar: "الكشافة", en: "Scouts" },
  girlsSection: { ar: "قسم البنات", en: "Girls Section" },
  girlsSub: { ar: "المرشدات", en: "Guides" },

  // gallery
  galTitle: { ar: "من قلب المغامرة", en: "From the Heart of Adventure" },
  galSub: { ar: "لقطات حقيقية من أنشطتنا وفعالياتنا", en: "Real moments from our activities and events" },
  galCta: { ar: "شاهد المعرض كاملاً", en: "View the full gallery" },
  galPageTitle1: { ar: "معرض", en: "Moments" },
  galPageTitleEm: { ar: "اللحظات", en: "Gallery" },
  galPageSub: { ar: "خلف كل صورة حكاية ومغامرة وابتسامة", en: "Behind every photo is a story, an adventure, and a smile" },
  galEmpty: {
    ar: "المعرض قيد التجهيز… قريباً نشارككم أجمل لحظاتنا",
    en: "The gallery is being prepared… we will share our best moments soon",
  },

  // a11y / controls
  playVideo: { ar: "تشغيل المقطع", en: "Play video" },
  closeLabel: { ar: "إغلاق", en: "Close" },
  prevLabel: { ar: "السابق", en: "Previous" },
  nextLabel: { ar: "التالي", en: "Next" },
  skipToContent: { ar: "تخطٍ إلى المحتوى", en: "Skip to content" },

  // videos
  vidTitle: { ar: "مقاطع مميزة", en: "Featured Videos" },
  vidSub: { ar: "شاهدوا لحظاتنا كما عشناها", en: "Watch our moments as we lived them" },

  // join panel / steps
  joinPanelTitle: { ar: "هل أنتم مستعدون للخطوة الأولى؟", en: "Ready for the first step?" },
  joinPanelText: {
    ar: "سجلوا أبناءكم وبناتكم في مجموعة دسمان الكشفية ليبدأوا رحلة بناء الشخصية والقيادة.",
    en: "Enroll your sons and daughters in Dasman Scout Group to begin their journey of character and leadership.",
  },
  joinCta: { ar: "قدم طلب انضمام", en: "Apply to join" },
  step1T: { ar: "١. املأ الطلب", en: "1. Fill the form" },
  step1S: { ar: "نموذج بسيط لا يستغرق دقيقتين", en: "A simple form that takes two minutes" },
  step2T: { ar: "٢. نتواصل معكم", en: "2. We contact you" },
  step2S: { ar: "يرد القائد المسؤول خلال يومين", en: "The responsible leader replies within two days" },
  step3T: { ar: "٣. أهلاً بكم معنا", en: "3. Welcome aboard" },
  step3S: { ar: "أول نشاط واستلام الزي الكشفي", en: "First activity and receiving the scout uniform" },

  // homepage: about + news blocks
  aboutHomeKicker: { ar: "من نحن", en: "About us" },
  aboutCta: { ar: "اقرأ المزيد عنا", en: "Read more about us" },
  newsHomeTitle: { ar: "آخر الأخبار", en: "Latest News" },
  newsHomeSub: {
    ar: "تابعوا أحدث أنشطة المجموعة وإنجازاتها",
    en: "Follow the group's newest activities and achievements",
  },
  newsCta: { ar: "كل الأخبار والفعاليات", en: "All news & events" },

  // about page
  aboutTitle1: { ar: "حكاية", en: "The Dasman" },
  aboutTitleEm: { ar: "دسمان", en: "Story" },
  aboutSub: {
    ar: "من أول اجتماع لمجموعة صغيرة إلى عائلة كشفية متكاملة",
    en: "From a small first gathering to a complete scouting family",
  },
  aboutH2: { ar: "عن مجموعة دسمان الكشفية", en: "About Dasman Scout Group" },
  aboutTracks: {
    ar: "تنتظم فرقنا في مسارين مستقلين: قسم البنين (الأشبال والفتيان) وقسم البنات (الزهرات والمرشدات)، ولكل فرقة برنامجها وأنشطتها وقيادتها الخاصة.",
    en: "Our troops are organized in two independent tracks: the Boys Section (Cubs and Scouts) and the Girls Section (Brownies and Guides), each with its own program, activities, and leadership.",
  },
  mission: { ar: "رسالتنا", en: "Our Mission" },
  vision: { ar: "رؤيتنا", en: "Our Vision" },
  valuesTitle: { ar: "قيمنا", en: "Our Values" },
  valuesSub: { ar: "المبادئ التي نربي عليها", en: "The principles we instill" },
  val1T: { ar: "الانتماء", en: "Belonging" },
  val1S: { ar: "حب الوطن وخدمة المجتمع أساس كل نشاط نقوم به.", en: "Love of country and community service underpin everything we do." },
  val2T: { ar: "القيادة", en: "Leadership" },
  val2S: { ar: "نبني قادة يعتمدون على أنفسهم ويتحملون المسؤولية.", en: "We build self-reliant leaders who take responsibility." },
  val3T: { ar: "العمل الجماعي", en: "Teamwork" },
  val3S: { ar: "روح الفريق الواحد في المخيم والنشاط والحياة.", en: "One-team spirit in camp, activity, and life." },
  leadersTitle: { ar: "قادتنا", en: "Our Leaders" },
  leadersSub: { ar: "نخبة من القادة والقائدات المؤهلين", en: "A select team of qualified leaders" },
  achTitle: { ar: "إنجازاتنا", en: "Our Achievements" },
  achSub: { ar: "محطات نفخر بها", en: "Milestones we are proud of" },

  // news page
  newsTitle1: { ar: "آخر", en: "Latest" },
  newsTitleEm: { ar: "أخبارنا", en: "News" },
  newsSub: { ar: "كل جديد المجموعة وفعالياتنا القادمة", en: "All the group's updates and upcoming events" },
  newsEmpty: { ar: "لا توجد أخبار منشورة حالياً — ترقبوا جديدنا قريباً", en: "No published news yet — stay tuned" },
  eventsTitle: { ar: "الفعاليات القادمة", en: "Upcoming Events" },
  eventsSub: { ar: "استعدوا معنا لما هو قادم", en: "Get ready for what is next" },
  eventsEmpty: { ar: "لا توجد فعاليات قادمة معلنة حالياً", en: "No upcoming events announced yet" },

  // join page + form
  joinTitle1: { ar: "ابدأ", en: "Start Your" },
  joinTitleEm: { ar: "رحلتك", en: "Journey" },
  joinSub: {
    ar: "املأ النموذج وسيتواصل معك القائد المسؤول خلال يومين",
    en: "Fill the form and the responsible leader will contact you within two days",
  },
  fName: { ar: "اسم المشترك", en: "Participant name" },
  fNamePh: { ar: "الاسم الثلاثي", en: "Full name" },
  fSection: { ar: "القسم", en: "Section" },
  fBoys: { ar: "بنين — الكشافة", en: "Boys — Scouts" },
  fGirls: { ar: "بنات — المرشدات", en: "Girls — Guides" },
  fTroop: { ar: "الفرقة", en: "Troop" },
  fAge: { ar: "العمر", en: "Age" },
  fAgePh: { ar: "مثال: 9", en: "e.g. 9" },
  fPhone: { ar: "رقم ولي الأمر (واتساب)", en: "Guardian's number (WhatsApp)" },
  fPhoneHint: { ar: "سنتواصل معكم على هذا الرقم لتأكيد التسجيل", en: "We will contact you on this number to confirm registration" },
  fNotes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  fNotesPh: { ar: "أي معلومات تودون إضافتها عن المشترك", en: "Anything you would like to add" },
  fSubmit: { ar: "إرسال طلب الانضمام", en: "Submit application" },
  fSending: { ar: "جارٍ الإرسال…", en: "Sending…" },
  fDoneT: { ar: "وصلنا طلبكم!", en: "Application received!" },
  fDoneS: {
    ar: "سيتواصل معكم القائد المسؤول عبر واتساب خلال يومين لتأكيد التسجيل.",
    en: "The responsible leader will contact you on WhatsApp within two days to confirm registration.",
  },
  fError: {
    ar: "حدث خطأ أثناء الإرسال، حاولوا مرة أخرى أو تواصلوا معنا عبر واتساب.",
    en: "Something went wrong. Please try again or contact us on WhatsApp.",
  },
  fDirect: { ar: "تفضلون التواصل المباشر؟", en: "Prefer direct contact?" },
  fDirectLink: { ar: "راسلونا عبر واتساب", en: "Message us on WhatsApp" },
  afterTitle: { ar: "ماذا بعد الطلب؟", en: "What happens next?" },
  afterText: {
    ar: "ثلاث خطوات بسيطة تفصل ابنكم أو ابنتكم عن أول مغامرة كشفية.",
    en: "Three simple steps between your child and their first scouting adventure.",
  },
} as const;

export type DictKey = keyof typeof dict;

export function t(lang: Lang, key: DictKey): string {
  return dict[key][lang];
}

/** Pick the right field from bilingual DB content. */
export function pick(lang: Lang, ar: string | undefined, en: string | undefined): string {
  return (lang === "ar" ? ar : en) || ar || en || "";
}
