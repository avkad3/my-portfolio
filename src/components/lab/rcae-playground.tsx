"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/** The published RCAE scoring formula, made playable. Weights come from the paper/README. */
const FACTORS = [
  { id: "turnover", label: "Turnover clustering", weight: 0.3, hint: "Tables finishing in the same 15-min window" },
  { id: "cascade", label: "Cascade risk", weight: 0.25, hint: "Large-party lateness hitting the next booking" },
  { id: "kitchen", label: "Kitchen load", weight: 0.25, hint: "Orders starting in the same 20-min window" },
  { id: "dead", label: "Dead time", weight: 0.2, hint: "Gaps too short to clean, too long to fill" },
] as const;

const SCENARIOS: Record<string, number[]> = {
  "Quiet Tuesday": [1, 1, 1, 0.7],
  "Friday 8 PM": [0.25, 0.5, 0.25, 1],
  "Large party, tight turn": [0.75, 0.1, 0.5, 0.4],
};

function band(s: number) {
  if (s >= 0.7) return { label: "OPTIMAL", conf: "HIGH", color: "#3DF2A6" };
  if (s >= 0.5) return { label: "ACCEPTABLE", conf: "MEDIUM", color: "#5AB8FF" };
  if (s >= 0.3) return { label: "CAUTION", conf: "LOW", color: "#F2C94C" };
  return { label: "HIGH RISK", conf: "LOW", color: "#FF5C5C" };
}

export function RcaePlayground() {
  const [v, setV] = useState<number[]>([1, 1, 0.75, 0.7]);
  const score = FACTORS.reduce((a, f, i) => a + f.weight * v[i], 0);
  const b = band(score);
  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="panel p-5 md:p-6">
        <div className="mb-5 flex flex-wrap gap-1.5">
          {Object.entries(SCENARIOS).map(([name, vals]) => (
            <button key={name} className="chip hover:border-accent/40 hover:text-fg" onClick={() => setV(vals)}>
              {name}
            </button>
          ))}
        </div>
        <div className="space-y-6">
          {FACTORS.map((f, i) => (
            <div key={f.id}>
              <div className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
                <label htmlFor={`rcae-${f.id}`} className="uppercase tracking-[0.14em] text-fg">
                  {f.label} <span className="text-dim">× {f.weight.toFixed(2)}</span>
                </label>
                <span className="tabular-nums text-accent">{v[i].toFixed(2)}</span>
              </div>
              <input
                id={`rcae-${f.id}`}
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={v[i]}
                onChange={(e) => setV((old) => old.map((x, j) => (j === i ? +e.target.value : x)))}
                className="mt-2 w-full accent-[#3DF2A6]"
              />
              <div className="mt-1 text-[12px] text-muted">{f.hint} · 1.0 = no stress</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel flex flex-col items-center justify-center p-6 text-center" aria-live="polite">
        <svg viewBox="0 0 180 180" className="w-44" aria-hidden>
          <circle cx="90" cy="90" r={R} fill="none" stroke="#1f1f1f" strokeWidth="8" />
          <motion.circle
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke={b.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - score), stroke: b.color }}
            transform="rotate(-90 90 90)"
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          <text x="90" y="92" textAnchor="middle" fontSize="34" fill="#F5F5F5" fontWeight="500">
            {score.toFixed(2)}
          </text>
          <text x="90" y="114" textAnchor="middle" fontSize="9" fill="#8A8A8A" letterSpacing="2" className="font-mono">
            RCAE SCORE
          </text>
        </svg>
        <div className="mt-4 font-mono text-sm tracking-[0.18em]" style={{ color: b.color }}>
          {b.label}
        </div>
        <div className="mt-1 font-mono text-[11px] text-muted">confidence {b.conf} · recommend {score >= 0.5 ? "YES" : "NO"}</div>
        <pre className="mt-6 w-full overflow-x-auto rounded border border-line bg-black/40 p-3 text-left font-mono text-[10.5px] leading-relaxed text-muted">
          {FACTORS.map((f, i) => `${f.weight.toFixed(2)} × ${v[i].toFixed(2)}`).join("\n+ ")}
          {`\n= ${score.toFixed(4)}`}
        </pre>
      </div>
    </div>
  );
}
