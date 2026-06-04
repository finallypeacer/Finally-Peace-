"use client";

import { useEffect, useState } from "react";
import "./dashboard.css";

type BurialType = "cremation" | "burial" | "green" | "aquamation" | "";

interface Profile { name: string; }
interface Wishes {
  burial: BurialType;
  livestream: boolean;
  obituary: boolean;
  message: string;
}
interface Beneficiary { name: string; relation: string; phone: string; }
interface AppData { profile: Profile; wishes: Wishes; beneficiary: Beneficiary; }

const DEFAULT: AppData = {
  profile: { name: "" },
  wishes: { burial: "", livestream: true, obituary: true, message: "" },
  beneficiary: { name: "", relation: "", phone: "" },
};

const KEY = "finally-peace.app.v1";

function load(): AppData {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return DEFAULT;
    const p = JSON.parse(r) as Partial<AppData>;
    return {
      profile: { ...DEFAULT.profile, ...(p.profile ?? {}) },
      wishes: { ...DEFAULT.wishes, ...(p.wishes ?? {}) },
      beneficiary: { ...DEFAULT.beneficiary, ...(p.beneficiary ?? {}) },
    };
  } catch { return DEFAULT; }
}

type Tab = "overview" | "wishes" | "plan";

export default function Dashboard() {
  const [data, setData] = useState<AppData>(DEFAULT);
  const [tab, setTab] = useState<Tab>("overview");
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => { setData(load()); setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1400);
      return () => clearTimeout(t);
    } catch {}
  }, [data, ready]);

  if (!ready) return <div className="dash-loading">Loading…</div>;

  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-brand">
            <span className="dash-logo">FP</span>
            <span className="dash-brand-name">Finally Peace</span>
          </div>
          <a href="/" className="dash-exit" aria-label="Back">✕</a>
        </div>
        <div className="dash-greeting">
          <h1>{greet}{data.profile.name ? `, ${data.profile.name}` : ""}.</h1>
          <p className={`dash-saved ${flash ? "show" : ""}`}>
            {flash ? "✓ Saved" : "Saved on this device"}
          </p>
        </div>
        <div className="dash-status-pill">
          <span className="dash-dot" />
          Coverage active
        </div>
      </header>

      <main className="dash-main">
        {tab === "overview" && <OverviewTab data={data} onData={setData} />}
        {tab === "wishes"   && <WishesTab   wishes={data.wishes} onChange={(w) => setData(d => ({ ...d, wishes: { ...d.wishes, ...w } }))} />}
        {tab === "plan"     && <PlanTab     data={data} onData={setData} />}
      </main>

      <nav className="dash-tabs">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          <IcoGrid /> Overview
        </button>
        <button className={tab === "wishes" ? "active" : ""} onClick={() => setTab("wishes")}>
          <IcoHeart /> My Wishes
        </button>
        <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>
          <IcoDoc /> My Plan
        </button>
      </nav>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   OVERVIEW TAB
────────────────────────────────────────────────────────── */
function OverviewTab({ data, onData }: { data: AppData; onData: (d: AppData) => void }) {
  const months = 6; // demo: 6 months in
  const pct = Math.round((months / 24) * 100);

  return (
    <div className="dash-cards">
      {!data.profile.name && (
        <div className="dash-card dash-card-intro">
          <label className="dash-field">
            <span>What should we call you?</span>
            <input
              type="text"
              placeholder="Your first name"
              value={data.profile.name}
              onChange={(e) => onData({ ...data, profile: { name: e.target.value } })}
            />
          </label>
        </div>
      )}

      {/* Coverage status card */}
      <div className="dash-card dash-cov-status">
        <div className="dash-cov-top">
          <div>
            <div className="dash-cov-eyebrow">COVERAGE STATUS</div>
            <div className="dash-cov-active">
              <span className="dash-dot" />
              Active &amp; Protected
            </div>
          </div>
          <div className="dash-price-badge">$15<span>/mo</span></div>
        </div>
        <div className="dash-timeline">
          <div className="dash-timeline-top">
            <span>Path to full coverage</span>
            <span className="dash-timeline-num">{months} / 24 months</span>
          </div>
          <div className="dash-progress"><div className="dash-progress-fill" style={{ width: `${pct}%` }} /></div>
          <div className="dash-timeline-note">Full natural-cause coverage unlocks at month 24</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="dash-card dash-stats-row">
        <div className="dash-stat">
          <div className="dash-stat-ico"><IcoShield /></div>
          <div className="dash-stat-val">Locked</div>
          <div className="dash-stat-lbl">Rate for life</div>
        </div>
        <div className="dash-stat-sep" />
        <div className="dash-stat">
          <div className="dash-stat-ico"><IcoCal /></div>
          <div className="dash-stat-val">1st</div>
          <div className="dash-stat-lbl">Next payment</div>
        </div>
        <div className="dash-stat-sep" />
        <div className="dash-stat">
          <div className="dash-stat-ico"><IcoPeople /></div>
          <div className="dash-stat-val">{data.beneficiary.name || "—"}</div>
          <div className="dash-stat-lbl">Beneficiary</div>
        </div>
      </div>

      {/* My Wishes snapshot */}
      <div className="dash-card dash-wishes-snap">
        <div className="dash-card-head">
          <IcoHeart />
          <span className="dash-card-title">My Wishes</span>
        </div>
        <div className="dash-snap-row">
          <span className="dash-snap-key">Burial type</span>
          <span className="dash-snap-val">
            {data.wishes.burial ? burialLabel(data.wishes.burial) : <em className="dash-empty">Not set yet</em>}
          </span>
        </div>
        <div className="dash-snap-row">
          <span className="dash-snap-key">Live-stream</span>
          <span className="dash-snap-val">{data.wishes.livestream ? "Yes" : "No"}</span>
        </div>
        <div className="dash-snap-row">
          <span className="dash-snap-key">Obituary</span>
          <span className="dash-snap-val">{data.wishes.obituary ? "2 publications" : "No"}</span>
        </div>
        <div className="dash-snap-row">
          <span className="dash-snap-key">Message</span>
          <span className="dash-snap-val">
            {data.wishes.message ? `"${data.wishes.message.slice(0, 40)}${data.wishes.message.length > 40 ? "…" : ""}"` : <em className="dash-empty">None written yet</em>}
          </span>
        </div>
      </div>

      {/* Concierge quick-access */}
      <div className="dash-card dash-concierge-quick">
        <div className="dash-cq-icon"><IcoPhone /></div>
        <div className="dash-cq-text">
          <div className="dash-cq-title">24/7 Concierge</div>
          <div className="dash-cq-sub">One call handles everything.</div>
        </div>
        <a href="tel:+18554784569" className="dash-cq-btn">Call now</a>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   WISHES TAB
────────────────────────────────────────────────────────── */
function WishesTab({ wishes, onChange }: { wishes: Wishes; onChange: (p: Partial<Wishes>) => void }) {
  const options: { key: BurialType; label: string; sub: string; icon: React.ReactNode }[] = [
    { key: "cremation", label: "Cremation",          sub: "Ashes returned to family",          icon: <IcoCremation /> },
    { key: "burial",    label: "Traditional burial", sub: "Full casket service",                icon: <IcoBurial /> },
    { key: "green",     label: "Green burial",       sub: "Natural, eco-friendly",             icon: <IcoGreen /> },
    { key: "aquamation",label: "Aquamation",         sub: "Water-based, gentle on earth",      icon: <IcoWater /> },
  ];

  return (
    <div className="dash-cards">
      <div className="dash-card">
        <div className="dash-card-head">
          <span className="dash-card-title">How would you like to be remembered?</span>
        </div>
        <p className="dash-sub-text">Your choice is honoured exactly — regardless of faith or tradition.</p>
        <div className="dash-burial-grid">
          {options.map((o) => (
            <button
              key={o.key}
              className={`dash-burial-btn ${wishes.burial === o.key ? "active" : ""}`}
              onClick={() => onChange({ burial: wishes.burial === o.key ? "" : o.key })}
            >
              <span className="dash-burial-ico">{o.icon}</span>
              <span className="dash-burial-label">{o.label}</span>
              <span className="dash-burial-sub">{o.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <span className="dash-card-title">Memorial preferences</span>
        </div>
        <div className="dash-toggle-row">
          <div>
            <div className="dash-tog-label">Live-stream the memorial</div>
            <div className="dash-tog-sub">Let distant family attend online</div>
          </div>
          <button
            className={`dash-toggle ${wishes.livestream ? "on" : ""}`}
            onClick={() => onChange({ livestream: !wishes.livestream })}
          />
        </div>
        <div className="dash-toggle-row">
          <div>
            <div className="dash-tog-label">Obituary in 2 publications</div>
            <div className="dash-tog-sub">Included in your subscription</div>
          </div>
          <button
            className={`dash-toggle ${wishes.obituary ? "on" : ""}`}
            onClick={() => onChange({ obituary: !wishes.obituary })}
          />
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <span className="dash-card-title">Message to your family</span>
        </div>
        <p className="dash-sub-text">Private until needed. Words for the people you love.</p>
        <textarea
          className="dash-textarea"
          placeholder="What do you want them to know…"
          value={wishes.message}
          onChange={(e) => onChange({ message: e.target.value })}
          rows={5}
        />
        <div className="dash-lock-note">
          <IcoLock /> Encrypted &amp; private on this device
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PLAN TAB
────────────────────────────────────────────────────────── */
function PlanTab({ data, onData }: { data: AppData; onData: (d: AppData) => void }) {
  const coverage = [
    { key: "funeral",   label: "Funeral — your way",  note: "Cremation, burial, service, paperwork" },
    { key: "legal",     label: "Legal help",           note: "Will, POA, estate paperwork" },
    { key: "debt",      label: "Debt navigation",      note: "$15,000 family runway + specialists" },
    { key: "transport", label: "Transportation",       note: "Anywhere in Canada + repatriation" },
  ];
  const CovIco: Record<string, React.ReactNode> = {
    funeral: <IcoBurial />, legal: <IcoDoc />, debt: <IcoDebt />, transport: <IcoTransport />,
  };

  return (
    <div className="dash-cards">
      <div className="dash-card dash-plan-hero">
        <div className="dash-plan-badge">QUIETWORLD SUBSCRIPTION</div>
        <div className="dash-plan-price">
          <span className="cur">$</span><span className="num">15</span><span className="per">/mo</span>
        </div>
        <div className="dash-plan-status"><span className="dash-dot" /> Active · rate locked for life</div>
        <div className="dash-plan-next">Next payment: 1st of next month</div>
      </div>

      {/* Beneficiary */}
      <div className="dash-card">
        <div className="dash-card-head">
          <IcoPeople /><span className="dash-card-title">Beneficiary</span>
        </div>
        <div className="dash-bene-fields">
          <label className="dash-field">
            <span>Full name</span>
            <input type="text" placeholder="e.g. Jane Doe" value={data.beneficiary.name}
              onChange={(e) => onData({ ...data, beneficiary: { ...data.beneficiary, name: e.target.value } })} />
          </label>
          <label className="dash-field">
            <span>Relationship</span>
            <input type="text" placeholder="e.g. Spouse" value={data.beneficiary.relation}
              onChange={(e) => onData({ ...data, beneficiary: { ...data.beneficiary, relation: e.target.value } })} />
          </label>
          <label className="dash-field">
            <span>Phone number</span>
            <input type="tel" placeholder="+1 (555) 000-0000" value={data.beneficiary.phone}
              onChange={(e) => onData({ ...data, beneficiary: { ...data.beneficiary, phone: e.target.value } })} />
          </label>
        </div>
      </div>

      {/* Coverage list */}
      <div className="dash-card">
        <div className="dash-card-head"><span className="dash-card-title">What&apos;s covered</span></div>
        <ul className="dash-cov-list">
          {coverage.map((c) => (
            <li key={c.key}>
              <span className="dash-cov-ico">{CovIco[c.key]}</span>
              <div>
                <div className="dash-cov-label">{c.label}</div>
                <div className="dash-cov-note">{c.note}</div>
              </div>
              <span className="dash-cov-check">✓</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-card dash-concierge">
        <div className="dash-card-head">
          <IcoPhone />
          <span className="dash-card-title">24/7 Concierge</span>
        </div>
        <p>One number for {data.profile.name || "your family"} when it matters most.</p>
        <a href="tel:+18554784569" className="dash-concierge-btn">Call · 1-855-478-4569</a>
        <a href="mailto:FinallyPeacer@gmail.com" className="dash-concierge-btn dash-concierge-btn-ghost">
          Email · FinallyPeacer@gmail.com
        </a>
      </div>

      <div className="dash-disclaimer">Your data is saved privately on this device only.</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */
function burialLabel(b: BurialType) {
  return ({ cremation: "Cremation", burial: "Traditional burial", green: "Green burial", aquamation: "Aquamation" } as Record<string, string>)[b] || "";
}

/* ── Inline SVG icons ── */
const s = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, width: 18, height: 18 };
const ss = { ...s, width: 20, height: 20 };

function IcoGrid()      { return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function IcoHeart()     { return <svg {...s}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function IcoDoc()       { return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IcoShield()    { return <svg {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IcoCal()       { return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IcoPeople()    { return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IcoPhone()     { return <svg {...ss}><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.37 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function IcoLock()      { return <svg {...{ ...s, width: 12, height: 12 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function IcoCremation() { return <svg {...ss}><path d="M12 3c-2 2.5-4 5-4 8h8c0-3-2-5.5-4-8z"/><rect x="7" y="11" width="10" height="3" rx="1"/><path d="M9 14v5"/><path d="M15 14v5"/><line x1="7" y1="19" x2="17" y2="19"/></svg>; }
function IcoBurial()    { return <svg {...ss}><path d="M12 2C9 2 7 4 7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7c0-3-2-5-5-5z"/><line x1="12" y1="7" x2="12" y2="14"/><line x1="9" y1="10" x2="15" y2="10"/></svg>; }
function IcoGreen()     { return <svg {...ss}><path d="M12 22V12"/><path d="M5 3a16 16 0 0 1 14 10H5z"/><path d="M3 14a16 16 0 0 1 9 8"/></svg>; }
function IcoWater()     { return <svg {...ss}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 0-4 10"/></svg>; }
function IcoDebt()      { return <svg {...ss}><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1 2-2.5 2.5V15"/></svg>; }
function IcoTransport() { return <svg {...ss}><path d="M5 17H3v-5l2-5h13l3 5v5h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="9" y1="17" x2="15" y2="17"/></svg>; }
