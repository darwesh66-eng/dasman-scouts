"use client";

// ─────────────────────────────────────────────────────────────
//  لوحة تحكم مجموعة دسمان الكشفية
//  تكتب في نفس صف app_config (id = 1) الذي تقرأ منه صفحات الموقع،
//  وتدير طلبات الانضمام في جدول join_requests — نفس بنية اللوحة القديمة.
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { getSupabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/upload";
import {
  defaultData,
  GROUP_AGES,
  type AppData,
  type Group,
  type Leader,
  type NewsItem,
  type CalendarEvent,
  type GalleryItem,
  type Achievement,
  type HomeVideo,
  type Scout,
} from "@/lib/appData";

/* ══ helpers ══ */
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function Field({
  label,
  value,
  onChange,
  type = "text",
  dir,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: "ltr";
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="f">
      <label>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} dir={dir} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ImgField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadFile(file));
    } catch {
      alert("فشل رفع الملف، حاول مرة أخرى");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };
  return (
    <div className="f">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="thumb" />
        )}
        <input dir="ltr" value={value} placeholder="https://…" onChange={(e) => onChange(e.target.value)} />
        <label className="btn-sm btn-add" style={{ whiteSpace: "nowrap", cursor: "pointer" }}>
          {busy ? "جارٍ الرفع…" : "رفع صورة"}
          <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
        </label>
        {value && (
          <button type="button" className="btn-sm btn-del" onClick={() => onChange("")}>
            إزالة
          </button>
        )}
      </div>
    </div>
  );
}

/* ══ join requests row type ══ */
interface JoinRow {
  id: string;
  name_ar: string;
  phone: string;
  age: string;
  group_id: string | null;
  message: string | null;
  submitted_at: string;
  status: "pending" | "accepted" | "rejected";
}

const TABS = [
  { id: "general", label: "عام", icon: "i-fleur" },
  { id: "about", label: "من نحن", icon: "i-star" },
  { id: "groups", label: "الفرق", icon: "i-tent" },
  { id: "scouts", label: "الكشافون", icon: "i-users" },
  { id: "leaders", label: "القادة", icon: "i-medal" },
  { id: "news", label: "الأخبار", icon: "i-form" },
  { id: "events", label: "الفعاليات", icon: "i-cal" },
  { id: "gallery", label: "المعرض", icon: "i-camera" },
  { id: "videos", label: "الفيديوهات", icon: "i-play" },
  { id: "achievements", label: "الإنجازات", icon: "i-medal" },
  { id: "requests", label: "طلبات الانضمام", icon: "i-chat" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function AdminApp() {
  const sb = useMemo(() => getSupabase(), []);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [data, setData] = useState<AppData>(defaultData);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [tab, setTab] = useState<TabId>("general");
  const [requests, setRequests] = useState<JoinRow[]>([]);

  /* auth */
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [sb]);

  /* load content + requests when authed */
  useEffect(() => {
    if (!authed) return;
    sb.from("app_config")
      .select("data")
      .eq("id", 1)
      .single()
      .then(({ data: row }) => {
        if (row?.data) {
          const remote = row.data as Partial<AppData>;
          setData({ ...defaultData, ...remote, about: { ...defaultData.about, ...remote.about } });
        }
      });
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const loadRequests = useCallback(async () => {
    const { data: rows } = await sb
      .from("join_requests")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (rows) setRequests(rows as JoinRow[]);
  }, [sb]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error)
      setLoginErr(
        error.message.toLowerCase().includes("invalid")
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : error.message,
      );
  };

  /* mutate helper */
  const patch = useCallback((p: Partial<AppData>) => {
    setData((d) => ({ ...d, ...p }));
    setDirty(true);
  }, []);

  const save = async () => {
    setSaving(true);
    // join requests live in their own table; admins are managed by Supabase Auth
    const clean = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    delete clean.joinRequests;
    delete clean.admins;
    const { error } = await sb
      .from("app_config")
      .upsert({ id: 1, data: clean, updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSaving(false);
    if (error) {
      alert(`تعذر الحفظ: ${error.message}`);
    } else {
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    }
  };

  /* request actions */
  const setReqStatus = async (id: string, status: JoinRow["status"]) => {
    await sb.from("join_requests").update({ status }).eq("id", id);
    void loadRequests();
  };
  const delReq = async (id: string) => {
    if (!confirm("حذف هذا الطلب نهائياً؟")) return;
    await sb.from("join_requests").delete().eq("id", id);
    void loadRequests();
  };

  /* ── render ── */
  if (authed === null)
    return (
      <div className="login-wrap">
        <div className="empty-hint">جارٍ التحميل…</div>
      </div>
    );

  if (!authed)
    return (
      <div className="login-wrap topo">
        <div className="login-card">
          <span className="badge ember">
            <Icon id="i-fleur" />
          </span>
          <h1>لوحة التحكم</h1>
          <div className="s">مجموعة دسمان الكشفية</div>
          <form onSubmit={login}>
            <Field label="البريد الإلكتروني" value={email} onChange={setEmail} type="email" dir="ltr" />
            <Field label="كلمة المرور" value={password} onChange={setPassword} type="password" dir="ltr" />
            {loginErr && <div className="err">{loginErr}</div>}
            <button className="btn btn-e" style={{ width: "100%", justifyContent: "center" }}>
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="brandline">
          <span className="mark">
            <Icon id="i-fleur" />
          </span>{" "}
          لوحة التحكم
        </div>
        {TABS.map((tb) => (
          <button key={tb.id} className={`tab ${tab === tb.id ? "on" : ""}`} onClick={() => setTab(tb.id)}>
            <Icon id={tb.icon} /> {tb.label}
            {tb.id === "requests" && pendingCount > 0 && (
              <span className="chip-status pending" style={{ marginInlineStart: "auto" }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <div className="spacer" />
        <div className="meta">{userEmail}</div>
        <button className="tab" onClick={() => sb.auth.signOut()}>
          <Icon id="i-arrow" /> تسجيل الخروج
        </button>
      </aside>

      <main className="adm-main">
        {tab === "general" && (
          <>
            <h1>الإعدادات العامة</h1>
            <p className="sub">اسم الموقع والشعار وصور الواجهة وبيانات التواصل</p>
            <div className="adm-card">
              <h3>
                <Icon id="i-fleur" /> اسم الموقع
              </h3>
              <div className="adm-grid3">
                <Field label="الاسم بالعربية" value={data.siteName.ar} onChange={(v) => patch({ siteName: { ...data.siteName, ar: v } })} />
                <Field label="الاسم بالإنجليزية" value={data.siteName.en} onChange={(v) => patch({ siteName: { ...data.siteName, en: v } })} />
                <Field label="السطر التعريفي" value={data.siteName.subtitle} onChange={(v) => patch({ siteName: { ...data.siteName, subtitle: v } })} />
              </div>
            </div>
            <div className="adm-card">
              <h3>
                <Icon id="i-camera" /> الشعار وصورة الواجهة
              </h3>
              <ImgField label="شعار المجموعة" value={data.logoSettings?.url ?? ""} onChange={(v) => patch({ logoSettings: { ...data.logoSettings, url: v } })} />
              <ImgField
                label="صورة الواجهة الرئيسية (الأولى تُستخدم في أعلى الصفحة)"
                value={data.heroImages?.[0] ?? ""}
                onChange={(v) => patch({ heroImages: v ? [v, ...(data.heroImages?.slice(1) ?? [])] : data.heroImages?.slice(1) ?? [] })}
              />
            </div>
            <div className="adm-card">
              <h3>
                <Icon id="i-chat" /> التواصل
              </h3>
              <div className="adm-grid2">
                <Field label="رقم واتساب (بصيغة دولية)" value={data.whatsapp} onChange={(v) => patch({ whatsapp: v })} dir="ltr" placeholder="+9655XXXXXXX" />
                <Field label="رابط إنستغرام" value={data.instagram} onChange={(v) => patch({ instagram: v })} dir="ltr" />
              </div>
            </div>
          </>
        )}

        {tab === "about" && (
          <>
            <h1>من نحن</h1>
            <p className="sub">نبذة المجموعة ورسالتها ورؤيتها باللغتين</p>
            {(["ar", "en"] as const).map((l) => (
              <div className="adm-card" key={l}>
                <h3>
                  <Icon id="i-star" /> {l === "ar" ? "بالعربية" : "بالإنجليزية"}
                </h3>
                <Field label="النبذة / التاريخ" rows={3} value={data.about[l].history} onChange={(v) => patch({ about: { ...data.about, [l]: { ...data.about[l], history: v } } })} />
                <div className="adm-grid2">
                  <Field label="الرسالة" rows={3} value={data.about[l].mission} onChange={(v) => patch({ about: { ...data.about, [l]: { ...data.about[l], mission: v } } })} />
                  <Field label="الرؤية" rows={3} value={data.about[l].vision} onChange={(v) => patch({ about: { ...data.about, [l]: { ...data.about[l], vision: v } } })} />
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "groups" && (
          <>
            <h1>الفرق</h1>
            <p className="sub">أسماء الفرق الأربع وأوصافها — تظهر في الصفحة الرئيسية ونموذج الانضمام</p>
            {data.groups.map((g) => (
              <div className="adm-item" key={g.id}>
                <div className="adm-item-head">
                  <span className="ttl">
                    {g.nameAr} {GROUP_AGES[g.id] ? `· ${GROUP_AGES[g.id].ar}` : ""}
                  </span>
                </div>
                <div className="adm-grid2">
                  <Field label="الاسم بالعربية" value={g.nameAr} onChange={(v) => patch({ groups: data.groups.map((x) => (x.id === g.id ? { ...x, nameAr: v } : x)) })} />
                  <Field label="الاسم بالإنجليزية" value={g.nameEn} onChange={(v) => patch({ groups: data.groups.map((x) => (x.id === g.id ? { ...x, nameEn: v } : x)) })} />
                  <Field label="الوصف بالعربية" rows={2} value={g.descriptionAr} onChange={(v) => patch({ groups: data.groups.map((x) => (x.id === g.id ? { ...x, descriptionAr: v } : x)) })} />
                  <Field label="الوصف بالإنجليزية" rows={2} value={g.descriptionEn} onChange={(v) => patch({ groups: data.groups.map((x) => (x.id === g.id ? { ...x, descriptionEn: v } : x)) })} />
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "scouts" && (
          <ListTab<Scout>
            title="الكشافون"
            sub="أعضاء الفرق — عددهم الظاهر يُحتسب في إحصائيات الواجهة"
            items={data.scouts}
            onChange={(scouts) => patch({ scouts })}
            create={() => ({ id: uid(), nameAr: "", nameEn: "", groupId: "ashbal", visible: true, photo: "" })}
            titleOf={(s) => s.nameAr || "كشاف جديد"}
            render={(s, up) => (
              <>
                <div className="adm-grid3">
                  <Field label="الاسم بالعربية" value={s.nameAr ?? ""} onChange={(v) => up({ nameAr: v })} />
                  <Field label="الاسم بالإنجليزية" value={s.nameEn ?? ""} onChange={(v) => up({ nameEn: v })} />
                  <div className="f">
                    <label>الفرقة</label>
                    <select value={s.groupId} onChange={(e) => up({ groupId: e.target.value })}>
                      {data.groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 700 }}>
                  <input type="checkbox" checked={s.visible} onChange={(e) => up({ visible: e.target.checked })} style={{ width: "auto" }} />
                  ظاهر في الموقع
                </label>
              </>
            )}
          />
        )}

        {tab === "leaders" && (
          <ListTab<Leader>
            title="القادة"
            sub="يظهرون في صفحة من نحن"
            items={data.leaders}
            onChange={(leaders) => patch({ leaders })}
            create={() => ({ id: uid(), nameAr: "", nameEn: "", role: "", photo: "" })}
            titleOf={(l) => l.nameAr || "قائد جديد"}
            render={(l, up) => (
              <>
                <div className="adm-grid3">
                  <Field label="الاسم بالعربية" value={l.nameAr ?? ""} onChange={(v) => up({ nameAr: v })} />
                  <Field label="الاسم بالإنجليزية" value={l.nameEn ?? ""} onChange={(v) => up({ nameEn: v })} />
                  <Field label="الدور (مثال: القائد العام)" value={l.role ?? ""} onChange={(v) => up({ role: v })} />
                </div>
                <ImgField label="الصورة" value={l.photo ?? ""} onChange={(v) => up({ photo: v })} />
              </>
            )}
          />
        )}

        {tab === "news" && (
          <ListTab<NewsItem>
            title="الأخبار"
            sub="الأخبار المنشورة تظهر في صفحة الأخبار والفعاليات"
            items={data.news}
            onChange={(news) => patch({ news })}
            create={() => ({ id: uid(), titleAr: "", titleEn: "", contentAr: "", contentEn: "", image: "", date: new Date().toISOString().split("T")[0], published: false })}
            titleOf={(n) => n.titleAr || "خبر جديد"}
            render={(n, up) => (
              <>
                <div className="adm-grid2">
                  <Field label="العنوان بالعربية" value={n.titleAr} onChange={(v) => up({ titleAr: v })} />
                  <Field label="العنوان بالإنجليزية" value={n.titleEn} onChange={(v) => up({ titleEn: v })} />
                  <Field label="المحتوى بالعربية" rows={3} value={n.contentAr} onChange={(v) => up({ contentAr: v })} />
                  <Field label="المحتوى بالإنجليزية" rows={3} value={n.contentEn} onChange={(v) => up({ contentEn: v })} />
                </div>
                <div className="adm-grid2">
                  <Field label="التاريخ" type="date" dir="ltr" value={n.date} onChange={(v) => up({ date: v })} />
                  <div className="f">
                    <label>الحالة</label>
                    <select value={n.published ? "1" : "0"} onChange={(e) => up({ published: e.target.value === "1" })}>
                      <option value="0">مسودة</option>
                      <option value="1">منشور</option>
                    </select>
                  </div>
                </div>
                <ImgField label="الصورة" value={n.image} onChange={(v) => up({ image: v })} />
              </>
            )}
          />
        )}

        {tab === "events" && (
          <ListTab<CalendarEvent>
            title="الفعاليات"
            sub="الفعاليات القادمة تظهر تلقائياً حسب تاريخها"
            items={data.events}
            onChange={(events) => patch({ events })}
            create={() => ({ id: uid(), titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", date: new Date().toISOString().split("T")[0], time: "", groupId: "" })}
            titleOf={(e) => e.titleAr || "فعالية جديدة"}
            render={(ev, up) => (
              <>
                <div className="adm-grid2">
                  <Field label="العنوان بالعربية" value={ev.titleAr} onChange={(v) => up({ titleAr: v })} />
                  <Field label="العنوان بالإنجليزية" value={ev.titleEn} onChange={(v) => up({ titleEn: v })} />
                </div>
                <div className="adm-grid3">
                  <Field label="التاريخ" type="date" dir="ltr" value={ev.date} onChange={(v) => up({ date: v })} />
                  <Field label="الوقت (مثال: 5:00 مساءً)" value={ev.time} onChange={(v) => up({ time: v })} />
                  <div className="f">
                    <label>الفرقة المعنية</label>
                    <select value={ev.groupId} onChange={(e) => up({ groupId: e.target.value })}>
                      <option value="">جميع الفرق</option>
                      {data.groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          />
        )}

        {tab === "gallery" && (
          <ListTab<GalleryItem>
            title="المعرض"
            sub="الصور تظهر في صفحة المعرض وفي الصفحة الرئيسية"
            items={data.gallery}
            onChange={(gallery) => patch({ gallery })}
            create={() => ({ id: uid(), type: "image", url: "", captionAr: "", captionEn: "" })}
            titleOf={(g) => g.captionAr || "صورة جديدة"}
            render={(g, up) => (
              <>
                <ImgField label="الصورة" value={g.url} onChange={(v) => up({ url: v })} />
                <div className="adm-grid2">
                  <Field label="التعليق بالعربية" value={g.captionAr} onChange={(v) => up({ captionAr: v })} />
                  <Field label="التعليق بالإنجليزية" value={g.captionEn} onChange={(v) => up({ captionEn: v })} />
                </div>
              </>
            )}
          />
        )}

        {tab === "videos" && (
          <ListTab<HomeVideo>
            title="الفيديوهات"
            sub="تظهر في قسم المقاطع المميزة بالصفحة الرئيسية (يوتيوب أو إنستغرام أو رابط مباشر)"
            items={data.homeVideos}
            onChange={(homeVideos) => patch({ homeVideos })}
            create={() => ({ id: uid(), type: "youtube", url: "", titleAr: "", titleEn: "" })}
            titleOf={(v) => v.titleAr || "مقطع جديد"}
            render={(v, up) => (
              <>
                <div className="adm-grid3">
                  <div className="f">
                    <label>النوع</label>
                    <select value={v.type} onChange={(e) => up({ type: e.target.value as HomeVideo["type"] })}>
                      <option value="youtube">يوتيوب</option>
                      <option value="instagram">إنستغرام</option>
                      <option value="upload">رابط مباشر</option>
                    </select>
                  </div>
                  <Field label="العنوان بالعربية" value={v.titleAr} onChange={(x) => up({ titleAr: x })} />
                  <Field label="العنوان بالإنجليزية" value={v.titleEn} onChange={(x) => up({ titleEn: x })} />
                </div>
                <Field label="الرابط" dir="ltr" value={v.url} onChange={(x) => up({ url: x })} placeholder="https://youtube.com/watch?v=…" />
              </>
            )}
          />
        )}

        {tab === "achievements" && (
          <ListTab<Achievement>
            title="الإنجازات"
            sub="تظهر في صفحة من نحن وتُحتسب في إحصائيات الواجهة"
            items={data.achievements}
            onChange={(achievements) => patch({ achievements })}
            create={() => ({ id: uid(), titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", icon: "", year: String(new Date().getFullYear()) })}
            titleOf={(a) => a.titleAr || "إنجاز جديد"}
            render={(a, up) => (
              <div className="adm-grid3">
                <Field label="العنوان بالعربية" value={a.titleAr} onChange={(v) => up({ titleAr: v })} />
                <Field label="العنوان بالإنجليزية" value={a.titleEn} onChange={(v) => up({ titleEn: v })} />
                <Field label="السنة" dir="ltr" value={a.year} onChange={(v) => up({ year: v })} />
              </div>
            )}
          />
        )}

        {tab === "requests" && (
          <>
            <h1>طلبات الانضمام</h1>
            <p className="sub">الطلبات الواردة من نموذج الموقع — القبول والرفض هنا للتنظيم فقط</p>
            {requests.length === 0 && <div className="empty-hint">لا توجد طلبات بعد.</div>}
            {requests.map((r) => {
              const group = data.groups.find((g) => g.id === r.group_id);
              return (
                <div className="adm-item" key={r.id}>
                  <div className="adm-item-head">
                    <span className="ttl">{r.name_ar}</span>
                    <span className={`chip-status ${r.status}`}>
                      {r.status === "pending" ? "قيد المراجعة" : r.status === "accepted" ? "مقبول" : "مرفوض"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600, lineHeight: 2 }}>
                    الفرقة: {group?.nameAr ?? r.group_id ?? "—"} · العمر: <span className="num">{r.age}</span> · الهاتف:{" "}
                    <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" dir="ltr" style={{ color: "var(--navy)", fontWeight: 800 }}>
                      {r.phone}
                    </a>
                    <br />
                    {r.message && <>ملاحظات: {r.message}</>}
                    <span style={{ opacity: 0.7 }}>
                      {" "}
                      · وصل في <span className="num">{new Date(r.submitted_at).toLocaleDateString("ar-KW")}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="btn-sm btn-ok" onClick={() => setReqStatus(r.id, "accepted")}>
                      قبول
                    </button>
                    <button className="btn-sm btn-warn" onClick={() => setReqStatus(r.id, "rejected")}>
                      رفض
                    </button>
                    <button className="btn-sm btn-del" onClick={() => delReq(r.id)}>
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>

      {(dirty || saving || savedFlash) && tab !== "requests" && (
        <div className="savebar">
          <div className="inner">
            <span className="msg">
              {saving ? "جارٍ الحفظ…" : savedFlash ? "تم الحفظ ✓ التغييرات ستظهر في الموقع خلال دقيقتين" : "لديك تغييرات غير محفوظة"}
            </span>
            {dirty && !saving && (
              <button className="btn btn-e" onClick={save}>
                حفظ التغييرات
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ generic list tab ══ */
function ListTab<T extends { id: string }>({
  title,
  sub,
  items,
  onChange,
  create,
  titleOf,
  render,
}: {
  title: string;
  sub: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  titleOf: (item: T) => string;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <>
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
      <button className="btn-sm btn-add" style={{ marginBottom: 16 }} onClick={() => onChange([create(), ...items])}>
        + إضافة
      </button>
      {items.length === 0 && <div className="empty-hint">لا توجد عناصر بعد — ابدأ بالإضافة.</div>}
      {items.map((item) => (
        <div className="adm-item" key={item.id}>
          <div className="adm-item-head">
            <span className="ttl">{titleOf(item)}</span>
            <button
              className="btn-sm btn-del"
              onClick={() => {
                if (confirm("حذف هذا العنصر؟")) onChange(items.filter((x) => x.id !== item.id));
              }}
            >
              حذف
            </button>
          </div>
          {render(item, (p) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...p } : x))))}
        </div>
      ))}
    </>
  );
}
