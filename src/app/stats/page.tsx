"use client";
import { useEffect, useRef, useState } from "react";
import "./stats.css";

/* ------------------------------------------------------------------ *
 * Demo analytics — seeded numbers that drift up over time so the
 * dashboard feels live. Replace with real data when a backend exists.
 * ------------------------------------------------------------------ */

const SIGNUPS_BASE = 450;
const CLICKS_BASE = 8240;

function drift(base: number, perDay: number): number {
  if (typeof window === "undefined") return base;
  try {
    const KEY = "fp.stats.t0";
    let t0 = Number(localStorage.getItem(KEY));
    if (!t0) { t0 = Date.now(); localStorage.setItem(KEY, String(t0)); }
    const days = (Date.now() - t0) / 86_400_000;
    return base + Math.floor(days * perDay);
  } catch { return base; }
}

const SIGNUPS_7D = [38, 52, 47, 61, 73, 58, 81];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TOP_CITIES = [
  { city: "Toronto", country: "CA", count: 86 },
  { city: "New York", country: "US", count: 71 },
  { city: "London", country: "UK", count: 58 },
  { city: "Vancouver", country: "CA", count: 44 },
  { city: "Los Angeles", country: "US", count: 39 },
  { city: "Sydney", country: "AU", count: 31 },
  { city: "Chicago", country: "US", count: 27 },
  { city: "Dublin", country: "IE", count: 22 },
];

const COUNTRIES = [
  { code: "US", name: "United States", pct: 38 },
  { code: "CA", name: "Canada", pct: 31 },
  { code: "UK", name: "United Kingdom", pct: 14 },
  { code: "AU", name: "Australia", pct: 9 },
  { code: "IE", name: "Ireland", pct: 5 },
  { code: "··", name: "Other", pct: 3 },
];

const DEVICES = [
  { label: "Mobile", pct: 68, color: "#2563eb" },
  { label: "Desktop", pct: 26, color: "#60a5fa" },
  { label: "Tablet", pct: 6, color: "#bfdbfe" },
];

/* Click hotspots on the page mockup (x/y in %, size px, delay s) */
const HOTSPOTS = [
  { x: 50, y: 73, r: 78, delay: 0,   ping: true  }, // Join the waitlist (primary)
  { x: 34, y: 60, r: 54, delay: 0.6, ping: true  }, // See the plans
  { x: 88, y: 12, r: 46, delay: 1.1, ping: true  }, // Open the app (nav)
  { x: 63, y: 60, r: 38, delay: 1.7, ping: false }, // How it works
  { x: 50, y: 38, r: 30, delay: 2.2, ping: false }, // hero
  { x: 60, y: 12, r: 26, delay: 2.6, ping: false }, // nav FAQ
];

const TOP_CLICKS = [
  { label: "“Join the waitlist”", tag: "Primary CTA", count: 1240 },
  { label: "“See the plans”", tag: "Hero button", count: 872 },
  { label: "“Open the app”", tag: "Nav", count: 541 },
  { label: "“How it works”", tag: "Hero button", count: 408 },
  { label: "“The plan”", tag: "Nav link", count: 296 },
  { label: "“FAQ”", tag: "Nav link", count: 184 },
];

/* ---- Deterministic signup list (450 emails) ---- */
const FIRST = ["james","mary","robert","patricia","john","jennifer","michael","linda","david","elizabeth","william","barbara","richard","susan","joseph","jessica","thomas","sarah","charles","karen","chris","nancy","daniel","lisa","matthew","betty","anthony","sandra","mark","ashley","donald","emily","steven","kimberly","paul","donna","andrew","michelle","josh","carol","kevin","amanda","brian","melissa","george","deborah","ryan","stephanie","aiden","olivia","liam","emma","noah","ava","lucas","sophia","ethan","isabella","mason","mia"];
const LAST = ["smith","johnson","williams","brown","jones","garcia","miller","davis","rodriguez","martinez","hernandez","lopez","gonzalez","wilson","anderson","taylor","thomas","moore","jackson","martin","lee","perez","thompson","white","harris","sanchez","clark","ramirez","lewis","robinson","walker","young","allen","king","wright","scott","torres","nguyen","hill","flores","green","adams","nelson","baker","hall","rivera","campbell","mitchell","carter","roberts","patel","kim","chen","murphy","cooper","reed","bailey","cox","ward","morgan"];
const DOMAINS = ["gmail.com","outlook.com","yahoo.com","icloud.com","proton.me","hotmail.com"];
const SIGNUP_CITIES = ["Toronto","New York","London","Vancouver","Los Angeles","Sydney","Chicago","Dublin","Boston","Calgary","Manchester","Melbourne","Seattle","Ottawa","Austin","Leeds","Brisbane","Denver","Montréal","Glasgow"];

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Signup { name: string; email: string; masked: string; city: string; initials: string; mins: number; hue: number; }

function buildSignups(n: number): Signup[] {
  const rnd = mulberry32(20260608);
  const out: Signup[] = [];
  let mins = 4;
  for (let i = 0; i < n; i++) {
    const f = FIRST[Math.floor(rnd() * FIRST.length)];
    const l = LAST[Math.floor(rnd() * LAST.length)];
    const d = DOMAINS[Math.floor(rnd() * DOMAINS.length)];
    const sep = rnd() < 0.5 ? "." : "";
    const numTail = rnd() < 0.4 ? String(Math.floor(rnd() * 90) + 10) : "";
    const local = `${f}${sep}${l}${numTail}`;
    const email = `${local}@${d}`;
    const visible = local.slice(0, 2);
    const masked = `${visible}${"•".repeat(Math.max(3, Math.min(7, local.length - 2)))}@${d}`;
    const name = `${f[0].toUpperCase()}${f.slice(1)} ${l[0].toUpperCase()}.`;
    const initials = `${f[0]}${l[0]}`.toUpperCase();
    const city = SIGNUP_CITIES[Math.floor(rnd() * SIGNUP_CITIES.length)];
    out.push({ name, email, masked, city, initials, mins, hue: Math.floor(rnd() * 360) });
    mins += Math.floor(rnd() * 70) + 8;
  }
  return out;
}

function timeAgo(mins: number): string {
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const ALL_SIGNUPS = buildSignups(450);

export default function StatsPage() {
  const [signups, setSignups] = useState(SIGNUPS_BASE);
  const [clicks, setClicks] = useState(CLICKS_BASE);

  useEffect(() => {
    setSignups(drift(SIGNUPS_BASE, 10));
    setClicks(drift(CLICKS_BASE, 180));
  }, []);

  const conversion = ((signups / clicks) * 100).toFixed(1);
  const today = SIGNUPS_7D[SIGNUPS_7D.length - 1];

  return (
    <div className="st-wrap">
      {/* Navy hero band */}
      <div className="st-hero">
        <div className="st-hero-inner">
          <header className="st-header">
            <a href="/" className="st-logo">
              <svg viewBox="0 0 86 52" width="64" height="34" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="stg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
                <ellipse cx="21" cy="26" rx="17" ry="13" fill="none" stroke="url(#stg)" strokeWidth="6" strokeLinecap="round"/>
                <ellipse cx="55" cy="26" rx="17" ry="13" fill="none" stroke="url(#stg)" strokeWidth="6" strokeLinecap="round"/>
              </svg>
              <span className="st-logo-name">Finally Peace</span>
            </a>
            <span className="st-badge"><span className="st-live-dot" /> Live</span>
          </header>

          <div className="st-title-row">
            <div className="st-eyebrow">Dashboard</div>
            <h1>Waitlist <span className="serif">analytics.</span></h1>
            <p>A real-time look at signups, reach, and engagement.</p>
          </div>
        </div>
      </div>

      {/* KPI cards — float over the hero */}
      <div className="st-kpis">
        <KPI label="Email signups" value={signups.toLocaleString()} delta="+12.4%" up icon={<IcoMail />} />
        <KPI label="Page clicks" value={clicks.toLocaleString()} delta="+8.1%" up icon={<IcoClick />} />
        <KPI label="Conversion rate" value={`${conversion}%`} delta="+0.6%" up icon={<IcoTrend />} />
        <KPI label="Signups today" value={today.toString()} delta="+18%" up icon={<IcoBolt />} />
      </div>

      <div className="st-main">
        {/* Signups over time */}
        <div className="st-card">
          <div className="st-card-head">
            <h2>Signups · last 7 days</h2>
            <span className="st-card-sub">{SIGNUPS_7D.reduce((a, b) => a + b, 0)} this week</span>
          </div>
          <BarChart data={SIGNUPS_7D} labels={DAY_LABELS} />
        </div>

        {/* Click activity heatmap */}
        <div className="st-card">
          <div className="st-card-head">
            <h2>Click activity</h2>
            <span className="st-card-sub">where visitors tap</span>
          </div>
          <div className="st-clickmap">
            {/* Mini page mockup */}
            <div className="st-mockup">
              <div className="st-mock-nav">
                <span className="st-mock-logo" />
                <span className="st-mock-links">
                  <i /><i /><i /><i />
                </span>
                <span className="st-mock-navbtn" />
              </div>
              <div className="st-mock-hero">
                <span className="st-mock-pill" />
                <span className="st-mock-h1" />
                <span className="st-mock-h1 short" />
                <span className="st-mock-p" />
                <span className="st-mock-p short" />
                <div className="st-mock-btns">
                  <span className="st-mock-btn primary" />
                  <span className="st-mock-btn" />
                </div>
                <span className="st-mock-cta" />
              </div>

              {/* Heat blobs + pings */}
              {HOTSPOTS.map((h, i) => (
                <span key={i}
                  className={`st-heat ${h.ping ? "ping" : ""}`}
                  style={{
                    left: `${h.x}%`, top: `${h.y}%`,
                    width: `${h.r}px`, height: `${h.r}px`,
                    animationDelay: `${h.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Top clicked elements */}
            <ul className="st-click-list">
              {TOP_CLICKS.map((c, i) => {
                const max = TOP_CLICKS[0].count;
                return (
                  <li key={i}>
                    <span className="st-click-dot" style={{ opacity: 0.35 + 0.65 * (c.count / max) }} />
                    <span className="st-click-info">
                      <span className="st-click-label">{c.label}</span>
                      <span className="st-click-tag">{c.tag}</span>
                    </span>
                    <span className="st-click-count">{c.count.toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="st-grid-2">
          {/* Top cities */}
          <div className="st-card">
            <div className="st-card-head"><h2>Top cities</h2></div>
            <ul className="st-city-list">
              {TOP_CITIES.map((c, i) => {
                const max = TOP_CITIES[0].count;
                return (
                  <li key={c.city}>
                    <span className="st-city-rank">{i + 1}</span>
                    <span className="st-city-name">{c.city} <em>{c.country}</em></span>
                    <span className="st-city-bar"><span style={{ width: `${(c.count / max) * 100}%` }} /></span>
                    <span className="st-city-count">{c.count}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Countries */}
          <div className="st-card">
            <div className="st-card-head"><h2>By country</h2></div>
            <ul className="st-country-list">
              {COUNTRIES.map(c => (
                <li key={c.name}>
                  <span className="st-code">{c.code}</span>
                  <span className="st-country-name">{c.name}</span>
                  <span className="st-country-bar"><span style={{ width: `${c.pct}%` }} /></span>
                  <span className="st-country-pct">{c.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Devices */}
        <div className="st-card">
          <div className="st-card-head"><h2>Devices</h2></div>
          <div className="st-device-bar">
            {DEVICES.map(d => (
              <span key={d.label} className="st-device-seg" style={{ width: `${d.pct}%`, background: d.color }} title={`${d.label} ${d.pct}%`} />
            ))}
          </div>
          <div className="st-device-legend">
            {DEVICES.map(d => (
              <span key={d.label}><i style={{ background: d.color }} /> {d.label} <strong>{d.pct}%</strong></span>
            ))}
          </div>
        </div>

        {/* Recent signups list */}
        <div className="st-card">
          <div className="st-card-head">
            <h2>Recent signups</h2>
            <span className="st-card-sub">{ALL_SIGNUPS.length} total</span>
          </div>
          <div className="st-signups">
            {ALL_SIGNUPS.map((s, i) => (
              <div className="st-signup" key={i}>
                <span className="st-avatar" style={{ background: `linear-gradient(135deg, hsl(${s.hue} 70% 58%), hsl(${(s.hue + 40) % 360} 72% 46%))` }}>
                  {s.initials}
                </span>
                <span className="st-signup-info">
                  <span className="st-signup-name">{s.name}</span>
                  <span className="st-signup-email">{s.masked}</span>
                </span>
                <span className="st-signup-city">{s.city}</span>
                <span className="st-signup-time">{timeAgo(s.mins)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="st-foot">Demo analytics · emails masked for privacy</p>
      </div>
    </div>
  );
}

function KPI({ label, value, delta, up, icon }: { label: string; value: string; delta: string; up?: boolean; icon: React.ReactNode }) {
  return (
    <div className="st-kpi">
      <div className="st-kpi-top">
        <span className="st-kpi-ico">{icon}</span>
        <span className={`st-kpi-delta ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {delta}</span>
      </div>
      <div className="st-kpi-value">{value}</div>
      <div className="st-kpi-label">{label}</div>
    </div>
  );
}

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const [grown, setGrown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGrown(true); }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const max = Math.max(...data);
  return (
    <div className="st-chart" ref={ref}>
      {data.map((v, i) => (
        <div className="st-chart-col" key={i}>
          <span className="st-chart-val">{v}</span>
          <div className="st-chart-track">
            <div className="st-chart-bar" style={{ height: grown ? `${(v / max) * 100}%` : "0%" }} />
          </div>
          <span className="st-chart-lbl">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* Icons */
const s = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, width: 18, height: 18 };
function IcoMail()  { return <svg {...s}><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>; }
function IcoClick() { return <svg {...s}><path d="M9 9l5 12 1.8-5.2L21 14 9 9z"/><path d="M7.2 2.2 8 5"/><path d="m5.1 5.1 1.4 1.4"/><path d="M2.2 7.2 5 8"/></svg>; }
function IcoTrend() { return <svg {...s}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>; }
function IcoBolt()  { return <svg {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
