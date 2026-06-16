"use client";
import { useEffect, useRef, useState } from "react";
import "./stats.css";

/* ------------------------------------------------------------------ *
 * Demo analytics — seeded numbers that drift up slightly over time so
 * the dashboard feels live. Replace with real data when a backend exists.
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

const SIGNUPS_7D = [38, 52, 47, 61, 73, 58, 81]; // Mon–Sun
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
  { name: "United States", flag: "🇺🇸", pct: 38 },
  { name: "Canada", flag: "🇨🇦", pct: 31 },
  { name: "United Kingdom", flag: "🇬🇧", pct: 14 },
  { name: "Australia", flag: "🇦🇺", pct: 9 },
  { name: "Ireland", flag: "🇮🇪", pct: 5 },
  { name: "Other", flag: "🌍", pct: 3 },
];

const DEVICES = [
  { label: "Mobile", pct: 68, color: "#2563eb" },
  { label: "Desktop", pct: 26, color: "#60a5fa" },
  { label: "Tablet", pct: 6, color: "#bfdbfe" },
];

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
      <header className="st-header">
        <a href="/" className="st-logo">
          <svg viewBox="0 0 86 52" width="64" height="34" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="stg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1d4ed8"/>
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
        <h1>Waitlist analytics</h1>
        <p>Real-time overview of signups and engagement.</p>
      </div>

      {/* KPI cards */}
      <div className="st-kpis">
        <KPI label="Email signups" value={signups.toLocaleString()} delta="+12.4%" up icon={<IcoMail />} />
        <KPI label="Page clicks" value={clicks.toLocaleString()} delta="+8.1%" up icon={<IcoClick />} />
        <KPI label="Conversion rate" value={`${conversion}%`} delta="+0.6%" up icon={<IcoTrend />} />
        <KPI label="Signups today" value={today.toString()} delta="+18%" up icon={<IcoBolt />} />
      </div>

      {/* Signups over time */}
      <div className="st-card">
        <div className="st-card-head">
          <h2>Signups · last 7 days</h2>
          <span className="st-card-sub">{SIGNUPS_7D.reduce((a, b) => a + b, 0)} this week</span>
        </div>
        <BarChart data={SIGNUPS_7D} labels={DAY_LABELS} />
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
                <span className="st-flag">{c.flag}</span>
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

      <p className="st-foot">Demo analytics · updates as data comes in</p>
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
