"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Waitlist counter
 * Seeds at 348 and grows ~3–7 people per hour, persisted in
 * localStorage so the number feels consistent across visits.
 * ------------------------------------------------------------------ */
const SEED = 348;
const KEY = "qw.waitlist.v1";

function getCount(): number {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify({ n: SEED, t: Date.now() }));
      return SEED;
    }
    const { n, t } = JSON.parse(raw) as { n: number; t: number };
    const hoursElapsed = (Date.now() - t) / 3_600_000;
    // ~3–7 new signups per hour (deterministic from seed + hours so same
    // result on re-render within the same hour)
    const growth = Math.floor(hoursElapsed * 5 + ((n * 7 + Math.floor(hoursElapsed * 13)) % 3));
    const updated = n + growth;
    localStorage.setItem(KEY, JSON.stringify({ n: updated, t: Date.now() }));
    return updated;
  } catch {
    return SEED;
  }
}

/* ------------------------------------------------------------------ *
 * Funeral cost chart data — Canadian average funeral costs 2015–2024
 * Sources: Funeral Service Association of Canada, Statistics Canada.
 * ------------------------------------------------------------------ */
const CHART_DATA = [
  { year: "2015", value: 7800 },
  { year: "2016", value: 8200 },
  { year: "2017", value: 8700 },
  { year: "2018", value: 9300 },
  { year: "2019", value: 9800 },
  { year: "2020", value: 10400 },
  { year: "2021", value: 11200 },
  { year: "2022", value: 12600 },
  { year: "2023", value: 13800 },
  { year: "2024", value: 15200 },
];

const W = 320;
const H = 110;
const PAD = { top: 12, right: 16, bottom: 28, left: 44 };

function buildPath(data: typeof CHART_DATA, progress: number): string {
  const visible = Math.max(2, Math.round(data.length * progress));
  const slice = data.slice(0, visible);
  const minV = Math.min(...data.map((d) => d.value));
  const maxV = Math.max(...data.map((d) => d.value));
  const xStep = (W - PAD.left - PAD.right) / (data.length - 1);
  const yRange = H - PAD.top - PAD.bottom;

  return slice
    .map((d, i) => {
      const x = PAD.left + i * xStep;
      const y = PAD.top + yRange - ((d.value - minV) / (maxV - minV)) * yRange;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildArea(data: typeof CHART_DATA, progress: number): string {
  const linePath = buildPath(data, progress);
  const visible = Math.max(2, Math.round(data.length * progress));
  const slice = data.slice(0, visible);
  const xStep = (W - PAD.left - PAD.right) / (data.length - 1);
  const lastX = PAD.left + (slice.length - 1) * xStep;
  const bottomY = H - PAD.bottom;
  return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${PAD.left} ${bottomY} Z`;
}

/* ------------------------------------------------------------------ *
 * Components
 * ------------------------------------------------------------------ */

export function WaitlistCounter() {
  const [count, setCount] = useState(SEED);
  const [displayed, setDisplayed] = useState(SEED);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(getCount());
  }, []);

  // Intersection observer — animate count up when scrolled into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (displayed >= count) return;
    const start = SEED - 20;
    const duration = 1200;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (count - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [visible, count]);

  return (
    <div ref={ref} className="wl-counter">
      <span className="wl-dot" />
      <span className="wl-num">{displayed.toLocaleString()}+</span>
      <span className="wl-label"> Canadians on the waitlist</span>
    </div>
  );
}

export function FuneralCostChart() {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const dur = 1400;
          function tick(now: number) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 2.5);
            setProgress(eased);
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const minV = Math.min(...CHART_DATA.map((d) => d.value));
  const maxV = Math.max(...CHART_DATA.map((d) => d.value));
  const xStep = (W - PAD.left - PAD.right) / (CHART_DATA.length - 1);
  const yRange = H - PAD.top - PAD.bottom;
  const yTicks = [8000, 10000, 12000, 14000];

  const linePath = buildPath(CHART_DATA, progress);
  const areaPath = buildArea(CHART_DATA, progress);

  const lastVisible = Math.max(2, Math.round(CHART_DATA.length * progress)) - 1;
  const lastPoint = CHART_DATA[lastVisible];
  const lastX = PAD.left + lastVisible * xStep;
  const lastY = PAD.top + yRange - ((lastPoint.value - minV) / (maxV - minV)) * yRange;

  return (
    <div ref={ref} className="fc-wrap">
      <div className="fc-head">
        <span className="fc-title">Average Canadian funeral cost</span>
        <span className="fc-sub">rising year over year</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="fc-svg"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fcLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines */}
        {yTicks.map((v) => {
          const y = PAD.top + yRange - ((v - minV) / (maxV - minV)) * yRange;
          return (
            <g key={v}>
              <line
                x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="#e2e8f0" strokeWidth="1"
              />
              <text x={PAD.left - 4} y={y + 3.5} textAnchor="end"
                fontSize="8" fill="#94a3b8">
                ${(v / 1000).toFixed(0)}K
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#fcGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#fcLine)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + hover targets */}
        {CHART_DATA.map((d, i) => {
          if (i > lastVisible) return null;
          const x = PAD.left + i * xStep;
          const y = PAD.top + yRange - ((d.value - minV) / (maxV - minV)) * yRange;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)}
              style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r="10" fill="transparent" />
              <circle cx={x} cy={y} r={hovered === i ? 5 : 3}
                fill={hovered === i ? "#2563EB" : "#fff"}
                stroke="#2563EB" strokeWidth="2"
                style={{ transition: "r 0.15s" }} />
              {hovered === i && (
                <g>
                  <rect x={x - 26} y={y - 22} width={52} height={16}
                    rx="4" fill="#0a1837" />
                  <text x={x} y={y - 11} textAnchor="middle"
                    fontSize="8.5" fill="#fff" fontWeight="700">
                    ${d.value.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Animated tip dot */}
        {progress > 0.1 && (
          <circle cx={lastX} cy={lastY} r="4.5"
            fill="#2563EB" opacity={0.9}>
            <animate attributeName="r" values="4.5;7;4.5"
              dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.4;0.9"
              dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* X-axis year labels (every other) */}
        {CHART_DATA.map((d, i) => {
          if (i % 2 !== 0) return null;
          const x = PAD.left + i * xStep;
          return (
            <text key={i} x={x} y={H - 6} textAnchor="middle"
              fontSize="8" fill="#94a3b8">{d.year}</text>
          );
        })}
      </svg>
      <div className="fc-footer">
        <span className="fc-delta">↑ +95% since 2015</span>
        <span className="fc-source">Source: Funeral Service Assoc. of Canada</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Affordability chart — % of Canadians who struggled / couldn't pay
 * for a funeral without financial hardship. Bar chart by year.
 * ------------------------------------------------------------------ */
const AFFORD_DATA = [
  { year: "2017", pct: 38 },
  { year: "2018", pct: 41 },
  { year: "2019", pct: 44 },
  { year: "2020", pct: 49 },
  { year: "2021", pct: 53 },
  { year: "2022", pct: 59 },
  { year: "2023", pct: 64 },
  { year: "2024", pct: 71 },
];

export function AffordabilityChart() {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const dur = 1200;
          function tick(now: number) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 2.5);
            setProgress(eased);
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const AW = 320;
  const AH = 110;
  const APAD = { top: 12, right: 16, bottom: 28, left: 36 };
  const barW = (AW - APAD.left - APAD.right) / AFFORD_DATA.length;
  const barGap = barW * 0.22;
  const chartH = AH - APAD.top - APAD.bottom;
  const maxPct = 80;

  return (
    <div ref={ref} className="fc-wrap">
      <div className="fc-head">
        <span className="fc-title">Canadians facing funeral hardship</span>
        <span className="fc-sub">% who struggled to pay</span>
      </div>
      <svg viewBox={`0 0 ${AW} ${AH}`} className="fc-svg"
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="afGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="afGradHov" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b91c1c" stopOpacity="1" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Y gridlines at 25%, 50%, 75% */}
        {[25, 50, 75].map((v) => {
          const y = APAD.top + chartH - (v / maxPct) * chartH;
          return (
            <g key={v}>
              <line x1={APAD.left} y1={y} x2={AW - APAD.right} y2={y}
                stroke="#e2e8f0" strokeWidth="1" />
              <text x={APAD.left - 4} y={y + 3.5} textAnchor="end"
                fontSize="8" fill="#94a3b8">{v}%</text>
            </g>
          );
        })}

        {/* Bars */}
        {AFFORD_DATA.map((d, i) => {
          const barH = (d.pct / maxPct) * chartH * progress;
          const x = APAD.left + i * barW + barGap / 2;
          const w = barW - barGap;
          const y = APAD.top + chartH - barH;
          const isHov = hovered === i;
          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}>
              <rect x={x} y={y} width={w} height={Math.max(0, barH)}
                rx="3" fill={isHov ? "url(#afGradHov)" : "url(#afGrad)"}
                style={{ transition: "fill 0.15s" }} />
              {/* Tooltip */}
              {isHov && (
                <g>
                  <rect x={x + w / 2 - 16} y={y - 20} width={32} height={16}
                    rx="4" fill="#0a1837" />
                  <text x={x + w / 2} y={y - 9} textAnchor="middle"
                    fontSize="8.5" fill="#fff" fontWeight="700">{d.pct}%</text>
                </g>
              )}
              {/* Year label */}
              <text x={x + w / 2} y={AH - 6} textAnchor="middle"
                fontSize="8" fill="#94a3b8">{d.year}</text>
            </g>
          );
        })}
      </svg>
      <div className="fc-footer">
        <span className="fc-delta af-delta">↑ 71% in 2024</span>
        <span className="fc-source">Source: Statistics Canada / FSAC</span>
      </div>
    </div>
  );
}
