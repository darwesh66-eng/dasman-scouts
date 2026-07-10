"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { getSupabase } from "@/lib/supabaseClient";
import { GROUP_AGES, type Group } from "@/lib/appData";
import { t, pick, type Lang } from "@/lib/i18n";

const TROOP_ICONS: Record<string, string> = {
  ashbal: "i-paw",
  fatyan: "i-tent",
  zahrat: "i-flower",
  murshidat: "i-compass",
};

type Section = "boys" | "girls";

export default function JoinForm({ lang, groups }: { lang: Lang; groups: Group[] }) {
  const boys = groups.filter((g) => ["ashbal", "fatyan"].includes(g.id));
  const girls = groups.filter((g) => ["zahrat", "murshidat"].includes(g.id));

  const [section, setSection] = useState<Section>("boys");
  const troops = section === "boys" ? boys : girls;
  const [troopId, setTroopId] = useState(boys[0]?.id ?? "ashbal");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const pickSection = (s: Section) => {
    setSection(s);
    const first = (s === "boys" ? boys : girls)[0]?.id;
    setTroopId(first ?? (s === "boys" ? "ashbal" : "zahrat"));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const sb = getSupabase();
      const { error } = await sb.from("join_requests").insert({
        name_ar: name.trim(),
        phone: phone.trim(),
        age: age.trim(),
        group_id: troopId,
        message: message.trim() || null,
        submitted_at: new Date().toISOString(),
        status: "pending",
      });
      setState(error ? "error" : "done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="form-card" style={{ textAlign: "center" }}>
        <span className="badge ember" style={{ margin: "0 auto 18px" }}>
          <Icon id="i-check" />
        </span>
        <h3 style={{ fontSize: 22, fontWeight: 900, color: "var(--navy-deep)", marginBottom: 10 }}>
          {t(lang, "fDoneT")}
        </h3>
        <p style={{ color: "var(--ink-2)", fontWeight: 600, lineHeight: 1.9 }}>{t(lang, "fDoneS")}</p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="field">
        <label>
          {t(lang, "fName")} <span className="req">*</span>
        </label>
        <input
          type="text"
          placeholder={t(lang, "fNamePh")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label>
          {t(lang, "fSection")} <span className="req">*</span>
        </label>
        <div className="seg">
          <span>
            <input
              type="radio"
              name="sec"
              id="sec-boys"
              checked={section === "boys"}
              onChange={() => pickSection("boys")}
            />
            <label className="opt" htmlFor="sec-boys">
              <Icon id="i-tent" /> {t(lang, "fBoys")}
            </label>
          </span>
          <span>
            <input
              type="radio"
              name="sec"
              id="sec-girls"
              checked={section === "girls"}
              onChange={() => pickSection("girls")}
            />
            <label className="opt" htmlFor="sec-girls">
              <Icon id="i-flower" /> {t(lang, "fGirls")}
            </label>
          </span>
        </div>
      </div>

      <div className="field">
        <label>
          {t(lang, "fTroop")} <span className="req">*</span>
        </label>
        <div className="seg">
          {troops.map((tr) => (
            <span key={tr.id}>
              <input
                type="radio"
                name="troop"
                id={`troop-${tr.id}`}
                checked={troopId === tr.id}
                onChange={() => setTroopId(tr.id)}
              />
              <label className="opt col" htmlFor={`troop-${tr.id}`}>
                <span className="nm">
                  <Icon id={TROOP_ICONS[tr.id] ?? "i-fleur"} /> {pick(lang, tr.nameAr, tr.nameEn)}
                </span>
                {GROUP_AGES[tr.id] && <small>{GROUP_AGES[tr.id][lang]}</small>}
              </label>
            </span>
          ))}
        </div>
      </div>

      <div className="field">
        <label>
          {t(lang, "fAge")} <span className="req">*</span>
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={6}
          max={18}
          placeholder={t(lang, "fAgePh")}
          required
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      <div className="field">
        <label>
          {t(lang, "fPhone")} <span className="req">*</span>
        </label>
        <input
          type="tel"
          inputMode="tel"
          dir="ltr"
          placeholder="+965 5XXX XXXX"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="hint">{t(lang, "fPhoneHint")}</div>
      </div>

      <div className="field">
        <label>{t(lang, "fNotes")}</label>
        <textarea
          rows={3}
          placeholder={t(lang, "fNotesPh")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {state === "error" && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            background: "#fdeaea",
            color: "#b3261e",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {t(lang, "fError")}
        </div>
      )}

      <button className="btn btn-e" disabled={state === "sending"}>
        {state === "sending" ? t(lang, "fSending") : t(lang, "fSubmit")}{" "}
        <span className="ico">
          <Icon id="i-form" />
        </span>
      </button>
    </form>
  );
}
