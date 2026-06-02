"use client";

import { useEffect, useState } from "react";
import "./dashboard.css";

/* ------------------------------------------------------------------ *
 * Types & storage
 * ------------------------------------------------------------------ */

type Mood = "great" | "good" | "ok" | "low" | "";

interface DayEntry {
  date: string; // YYYY-MM-DD
  steps: number;
  sleep: number; // hours
  water: number; // glasses
  weight: number; // kg
  mood: Mood;
}

interface Profile {
  name: string;
  goalSteps: number;
  goalSleep: number;
  goalWater: number;
}

interface AppData {
  profile: Profile;
  days: Record<string, DayEntry>; // keyed by date
}

const STORAGE_KEY = "quietworld.dashboard.v1";

const DEFAULT_PROFILE: Profile = {
  name: "",
  goalSteps: 8000,
  goalSleep: 8,
  goalWater: 8,
};

function todayKey(): string {
  // Local date as YYYY-MM-DD
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function emptyDay(date: string): DayEntry {
  return { date, steps: 0, sleep: 0, water: 0, weight: 0, mood: "" };
}

function loadData(): AppData {
  if (typeof window === "undefined")
    return { profile: DEFAULT_PROFILE, days: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: DEFAULT_PROFILE, days: {} };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      days: parsed.days ?? {},
    };
  } catch {
    return { profile: DEFAULT_PROFILE, days: {} };
  }
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

type Tab = "today" | "trends" | "plan";

export default function Dashboard() {
  const [data, setData] = useState<AppData>({
    profile: DEFAULT_PROFILE,
    days: {},
  });
  const [tab, setTab] = useState<Tab>("today");
  const [loaded, setLoaded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const today = todayKey();

  // Load once on mount (client only).
  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  // Persist whenever data changes (after initial load).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedFlash(true);
      const t = setTimeout(() => setSavedFlash(false), 1200);
      return () => clearTimeout(t);
    } catch {
      /* storage full / disabled — ignore */
    }
  }, [data, loaded]);

  const day = data.days[today] ?? emptyDay(today);

  function updateDay(patch: Partial<DayEntry>) {
    setData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [today]: { ...emptyDay(today), ...prev.days[today], ...patch },
      },
    }));
  }

  function updateProfile(patch: Partial<Profile>) {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }

  if (!loaded) {
    return <div className="dash-loading">Loading your dashboard…</div>;
  }

  return (
    <div className="dash">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-brand">
            <span className="dash-logo">QW</span>
            <span className="dash-brand-name">QuietWorld</span>
          </div>
          <a href="/" className="dash-exit" aria-label="Back to website">
            ✕
          </a>
        </div>
        <div className="dash-greeting">
          <h1>
            {greeting()}
            {data.profile.name ? `, ${data.profile.name}` : ""}.
          </h1>
          <p className={`dash-saved ${savedFlash ? "show" : ""}`}>
            {savedFlash ? "✓ Saved to this device" : "Saved on this device"}
          </p>
        </div>
      </header>

      <main className="dash-main">
        {tab === "today" && (
          <TodayTab
            day={day}
            profile={data.profile}
            onChange={updateDay}
            onProfile={updateProfile}
          />
        )}
        {tab === "trends" && (
          <TrendsTab days={data.days} profile={data.profile} />
        )}
        {tab === "plan" && <PlanTab name={data.profile.name} />}
      </main>

      {/* Bottom tab nav */}
      <nav className="dash-tabs">
        <button
          className={tab === "today" ? "active" : ""}
          onClick={() => setTab("today")}
        >
          <span className="dash-tab-ico">◎</span>Today
        </button>
        <button
          className={tab === "trends" ? "active" : ""}
          onClick={() => setTab("trends")}
        >
          <span className="dash-tab-ico">📈</span>Trends
        </button>
        <button
          className={tab === "plan" ? "active" : ""}
          onClick={() => setTab("plan")}
        >
          <span className="dash-tab-ico">🛡️</span>My plan
        </button>
      </nav>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ *
 * Today tab — editable trackers
 * ------------------------------------------------------------------ */

function TodayTab({
  day,
  profile,
  onChange,
  onProfile,
}: {
  day: DayEntry;
  profile: Profile;
  onChange: (p: Partial<DayEntry>) => void;
  onProfile: (p: Partial<Profile>) => void;
}) {
  const moods: { key: Mood; label: string; emoji: string }[] = [
    { key: "great", label: "Great", emoji: "😄" },
    { key: "good", label: "Good", emoji: "🙂" },
    { key: "ok", label: "Okay", emoji: "😐" },
    { key: "low", label: "Low", emoji: "😔" },
  ];

  return (
    <div className="dash-cards">
      {!profile.name && (
        <div className="dash-card dash-card-intro">
          <label className="dash-field">
            <span>What should we call you?</span>
            <input
              type="text"
              placeholder="Your first name"
              value={profile.name}
              onChange={(e) => onProfile({ name: e.target.value })}
            />
          </label>
        </div>
      )}

      {/* Steps */}
      <Stepper
        icon="🚶"
        title="Steps"
        unit="steps"
        value={day.steps}
        step={500}
        max={50000}
        goal={profile.goalSteps}
        onChange={(v) => onChange({ steps: v })}
      />

      {/* Sleep */}
      <Stepper
        icon="😴"
        title="Sleep"
        unit="hours"
        value={day.sleep}
        step={0.5}
        max={16}
        goal={profile.goalSleep}
        decimals={1}
        onChange={(v) => onChange({ sleep: v })}
      />

      {/* Water */}
      <Stepper
        icon="💧"
        title="Water"
        unit="glasses"
        value={day.water}
        step={1}
        max={20}
        goal={profile.goalWater}
        onChange={(v) => onChange({ water: v })}
      />

      {/* Weight */}
      <div className="dash-card">
        <div className="dash-card-head">
          <span className="dash-card-ico">⚖️</span>
          <span className="dash-card-title">Weight</span>
        </div>
        <div className="dash-weight">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={400}
            value={day.weight || ""}
            placeholder="—"
            onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })}
          />
          <span className="dash-weight-unit">kg</span>
        </div>
      </div>

      {/* Mood */}
      <div className="dash-card">
        <div className="dash-card-head">
          <span className="dash-card-ico">💬</span>
          <span className="dash-card-title">Mood today</span>
        </div>
        <div className="dash-moods">
          {moods.map((m) => (
            <button
              key={m.key}
              className={`dash-mood ${day.mood === m.key ? "active" : ""}`}
              onClick={() =>
                onChange({ mood: day.mood === m.key ? "" : m.key })
              }
            >
              <span className="dash-mood-emoji">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stepper({
  icon,
  title,
  unit,
  value,
  step,
  max,
  goal,
  decimals = 0,
  onChange,
}: {
  icon: string;
  title: string;
  unit: string;
  value: number;
  step: number;
  max: number;
  goal: number;
  decimals?: number;
  onChange: (v: number) => void;
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  const fmt = (n: number) =>
    decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  const clamp = (n: number) => Math.max(0, Math.min(max, n));

  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <span className="dash-card-ico">{icon}</span>
        <span className="dash-card-title">{title}</span>
        <span className="dash-card-goal">Goal {fmt(goal)}</span>
      </div>
      <div className="dash-stepper">
        <button
          className="dash-step-btn"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`Decrease ${title}`}
        >
          −
        </button>
        <div className="dash-step-value">
          <strong>{fmt(value)}</strong>
          <span>{unit}</span>
        </div>
        <button
          className="dash-step-btn"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`Increase ${title}`}
        >
          +
        </button>
      </div>
      <div className="dash-progress">
        <div className="dash-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="dash-progress-label">{pct}% of goal</div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Trends tab — last 7 days
 * ------------------------------------------------------------------ */

function TrendsTab({
  days,
  profile,
}: {
  days: Record<string, DayEntry>;
  profile: Profile;
}) {
  const last7 = lastNDates(7);
  const entries = last7.map((d) => days[d] ?? emptyDay(d));

  const totalSteps = entries.reduce((s, e) => s + e.steps, 0);
  const avgSleep =
    entries.filter((e) => e.sleep > 0).length > 0
      ? entries.reduce((s, e) => s + e.sleep, 0) /
        entries.filter((e) => e.sleep > 0).length
      : 0;
  const daysLogged = entries.filter(
    (e) => e.steps || e.sleep || e.water || e.weight || e.mood,
  ).length;

  return (
    <div className="dash-cards">
      <div className="dash-card dash-summary">
        <div className="dash-sum-item">
          <div className="dash-sum-num">{totalSteps.toLocaleString()}</div>
          <div className="dash-sum-label">steps this week</div>
        </div>
        <div className="dash-sum-item">
          <div className="dash-sum-num">{avgSleep ? avgSleep.toFixed(1) : "—"}</div>
          <div className="dash-sum-label">avg hrs sleep</div>
        </div>
        <div className="dash-sum-item">
          <div className="dash-sum-num">{daysLogged}/7</div>
          <div className="dash-sum-label">days logged</div>
        </div>
      </div>

      <BarChart
        title="Steps — last 7 days"
        goal={profile.goalSteps}
        data={entries.map((e) => ({ label: shortDay(e.date), value: e.steps }))}
      />
      <BarChart
        title="Sleep — last 7 days"
        goal={profile.goalSleep}
        unit="h"
        data={entries.map((e) => ({ label: shortDay(e.date), value: e.sleep }))}
      />
      <BarChart
        title="Water — last 7 days"
        goal={profile.goalWater}
        data={entries.map((e) => ({ label: shortDay(e.date), value: e.water }))}
      />
    </div>
  );
}

function BarChart({
  title,
  data,
  goal,
  unit = "",
}: {
  title: string;
  data: { label: string; value: number }[];
  goal: number;
  unit?: string;
}) {
  const max = Math.max(goal, ...data.map((d) => d.value), 1);
  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <span className="dash-card-title">{title}</span>
      </div>
      <div className="dash-chart">
        {data.map((d, i) => (
          <div className="dash-bar-col" key={i}>
            <div className="dash-bar-track">
              <div
                className={`dash-bar ${d.value >= goal && d.value > 0 ? "hit" : ""}`}
                style={{ height: `${Math.round((d.value / max) * 100)}%` }}
                title={`${d.value}${unit}`}
              />
            </div>
            <div className="dash-bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Plan tab — QuietWorld subscription & coverage
 * ------------------------------------------------------------------ */

function PlanTab({ name }: { name: string }) {
  const coverage = [
    { icon: "⚱️", label: "Funeral — your way", note: "Cremation, burial, service, paperwork" },
    { icon: "📄", label: "Legal help", note: "Will, POA, estate paperwork" },
    { icon: "🛟", label: "Debt navigation", note: "$15,000 family runway + specialists" },
    { icon: "✈️", label: "Transportation", note: "Anywhere in Canada + repatriation" },
  ];

  return (
    <div className="dash-cards">
      <div className="dash-card dash-plan-hero">
        <div className="dash-plan-badge">QUIETWORLD SUBSCRIPTION</div>
        <div className="dash-plan-price">
          <span className="cur">$</span>
          <span className="num">25</span>
          <span className="per">/mo</span>
        </div>
        <div className="dash-plan-status">
          <span className="dash-dot" /> Active · rate locked for life
        </div>
        <div className="dash-plan-next">Next payment: 1st of next month</div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <span className="dash-card-title">What&apos;s covered</span>
        </div>
        <ul className="dash-coverage">
          {coverage.map((c) => (
            <li key={c.label}>
              <span className="dash-cov-ico">{c.icon}</span>
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
          <span className="dash-card-ico">📞</span>
          <span className="dash-card-title">Your concierge</span>
        </div>
        <p>
          One number for {name || "your family"} when it matters most. We handle
          the funeral home, casket, transport, paperwork — everything.
        </p>
        <a href="tel:+18005551234" className="dash-concierge-btn">
          Call concierge · 1-800-555-1234
        </a>
        <a href="/#plans" className="dash-link">
          Manage subscription →
        </a>
      </div>

      <div className="dash-disclaimer">
        Demo data shown for preview. Your health entries are saved privately on
        this device only.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Date helpers
 * ------------------------------------------------------------------ */

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const pad = (x: number) => String(x).padStart(2, "0");
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }
  return out;
}

function shortDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dt.getDay()];
}
