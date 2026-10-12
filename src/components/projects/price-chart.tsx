"use client";

import * as d3 from "d3";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Mirrors CMPIS's dashboard logic on synthetic data — CMPIS itself ships with a
 * seeded synthetic six-month history, so this demo does the same.
 */
const VENDORS = [
  { id: "A", name: "Vendor A", color: "#3DF2A6" },
  { id: "B", name: "Vendor B", color: "#5AB8FF" },
  { id: "C", name: "Vendor C", color: "#8A8A8A" },
];

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function series() {
  const weeks = 26;
  return VENDORS.map((v, vi) => {
    const rnd = seeded(97 + vi * 31);
    let p = 392 + vi * 9;
    return {
      ...v,
      points: Array.from({ length: weeks }, (_, i) => {
        p += (rnd() - 0.48) * 6 + Math.sin(i / 4 + vi) * 1.6;
        return { week: i, price: Math.round(p) };
      }),
    };
  });
}

const W = 640;
const H = 260;
const M = { t: 16, r: 16, b: 28, l: 44 };

export default function PriceChart() {
  const data = useMemo(series, []);
  const [hidden, setHidden] = useState<string[]>([]);
  const [hoverWeek, setHoverWeek] = useState<number | null>(null);

  const all = data.flatMap((d) => d.points.map((p) => p.price));
  const avg = Math.round(d3.mean(all)!);
  const latest = data.map((d) => ({ ...d, now: d.points[d.points.length - 1].price }));
  const lowest = latest.reduce((a, b) => (b.now < a.now ? b : a));
  const [quote, setQuote] = useState(Math.round(avg * 1.03));

  const x = d3.scaleLinear().domain([0, 25]).range([M.l, W - M.r]);
  const y = d3.scaleLinear().domain([d3.min(all)! - 8, d3.max(all)! + 8]).range([H - M.b, M.t]).nice();
  const line = d3
    .line<{ week: number; price: number }>()
    .x((d) => x(d.week))
    .y((d) => y(d.price))
    .curve(d3.curveMonotoneX);

  const dev = ((quote - avg) / avg) * 100;
  const status = dev <= 0 ? "green" : dev <= 5 ? "yellow" : "red";
  const STATUS = {
    green: { c: "#3DF2A6", t: "Fair — at or below the six-month average" },
    yellow: { c: "#F2C94C", t: "Slightly above average — negotiate" },
    red: { c: "#FF5C5C", t: "Overpriced versus market history" },
  }[status];

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="font-mono text-[11px] text-muted">
          <span className="text-fg">Cement 50kg</span> · 6-month history · ₹/bag
        </div>
        <div className="flex gap-1.5">
          {data.map((v) => {
            const off = hidden.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => setHidden((h) => (off ? h.filter((x) => x !== v.id) : [...h, v.id]))}
                className={cn("chip py-0.5", off && "opacity-40")}
                aria-pressed={!off}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: v.color }} />
                {v.name}
              </button>
            );
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Synthetic six-month cement price history for three vendors; average ₹${avg}.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const wx = ((e.clientX - r.left) / r.width) * W;
          setHoverWeek(Math.max(0, Math.min(25, Math.round(x.invert(wx)))));
        }}
        onPointerLeave={() => setHoverWeek(null)}
      >
        {y.ticks(5).map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="#1c1c1c" />
            <text x={M.l - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#5a5a5a" className="font-mono">
              {t}
            </text>
          </g>
        ))}
        {["M1", "M2", "M3", "M4", "M5", "M6"].map((m, i) => (
          <text key={m} x={x(i * (25 / 6) + 25 / 12)} y={H - 8} textAnchor="middle" fontSize="10" fill="#5a5a5a" className="font-mono">
            {m}
          </text>
        ))}
        <line x1={M.l} x2={W - M.r} y1={y(avg)} y2={y(avg)} stroke="#F5F5F5" strokeOpacity={0.35} strokeDasharray="3 4" />
        <text x={W - M.r} y={y(avg) - 6} textAnchor="end" fontSize="10" fill="#bdbdbd" className="font-mono">
          avg ₹{avg}
        </text>
        <line x1={M.l} x2={W - M.r} y1={y(quote)} y2={y(quote)} stroke={STATUS.c} strokeOpacity={0.8} />
        <text x={M.l + 6} y={y(quote) - 6} fontSize="10" fill={STATUS.c} className="font-mono">
          your quote ₹{quote}
        </text>
        {data
          .filter((v) => !hidden.includes(v.id))
          .map((v) => (
            <path key={v.id} d={line(v.points)!} fill="none" stroke={v.color} strokeWidth={1.5} strokeOpacity={v.id === "C" ? 0.7 : 1} />
          ))}
        {hoverWeek !== null ? (
          <g>
            <line x1={x(hoverWeek)} x2={x(hoverWeek)} y1={M.t} y2={H - M.b} stroke="#333" />
            {data
              .filter((v) => !hidden.includes(v.id))
              .map((v) => (
                <circle key={v.id} cx={x(hoverWeek)} cy={y(v.points[hoverWeek].price)} r={3} fill={v.color} />
              ))}
            <text x={Math.min(x(hoverWeek) + 8, W - 120)} y={M.t + 12} fontSize="10" fill="#F5F5F5" className="font-mono">
              wk {hoverWeek + 1}: {data.filter((v) => !hidden.includes(v.id)).map((v) => `${v.id} ₹${v.points[hoverWeek].price}`).join("  ")}
            </text>
          </g>
        ) : null}
      </svg>

      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-[1fr_auto]">
        <div className="bg-surface px-5 py-4">
          <label htmlFor="quote" className="flex items-center justify-between font-mono text-[11px] text-muted">
            <span>Drag to test a vendor quote</span>
            <span className="text-fg">₹{quote}</span>
          </label>
          <input
            id="quote"
            type="range"
            min={avg - 25}
            max={avg + 40}
            value={quote}
            onChange={(e) => setQuote(+e.target.value)}
            className="mt-3 w-full accent-[#3DF2A6]"
          />
        </div>
        <div className="flex items-center gap-3 bg-surface px-5 py-4" aria-live="polite">
          <div className="flex gap-1.5" aria-hidden>
            {(["green", "yellow", "red"] as const).map((s) => (
              <span
                key={s}
                className="h-3 w-3 rounded-full transition-all"
                style={{
                  background: s === status ? STATUS.c : "#1f1f1f",
                  boxShadow: s === status ? `0 0 12px ${STATUS.c}` : "none",
                }}
              />
            ))}
          </div>
          <div className="font-mono text-[11px] leading-tight">
            <div style={{ color: STATUS.c }}>
              {dev >= 0 ? "+" : ""}
              {dev.toFixed(1)}% vs avg
            </div>
            <div className="text-muted">{STATUS.t}</div>
            <div className="text-dim">lowest now: {lowest.name} ₹{lowest.now}</div>
          </div>
        </div>
      </div>
      <p className="border-t border-line px-5 py-2 font-mono text-[10px] text-dim">Synthetic demo data with illustrative thresholds, matching how CMPIS seeds its own demo.</p>
    </div>
  );
}
