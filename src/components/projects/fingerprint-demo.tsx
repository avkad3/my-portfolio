"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The Maps Competitor Intelligence de-duplication rule, made interactive:
 * business identity + normalised text (case, punctuation, emoji and URLs removed),
 * with dates excluded because Maps shows relative dates that change between scrapes.
 * Posts below are illustrative, like the project's own fictional demo dataset.
 */
const BUSINESS = "Blue Door Café · Bandra";

const STORED = [
  { text: "Monsoon special! 20% off all hot beverages this week ☕ https://bluedoor.example/menu", date: "3 weeks ago" },
  { text: "Now open for Sunday brunch, 9 AM to 1 PM.", date: "2 months ago" },
];

const INCOMING = [
  { label: "Re-scrape, date shifted", text: "Monsoon special! 20% off all hot beverages this week ☕ https://bluedoor.example/menu", date: "1 month ago" },
  { label: "Same post, edited punctuation", text: "monsoon special — 20% off ALL hot beverages this week!!", date: "1 month ago" },
  { label: "Genuinely new post", text: "Live acoustic night this Friday from 7 PM. Book a table!", date: "2 days ago" },
];

function normalise(s: string) {
  return s
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\p{Extended_Pictographic}️]/gu, " ")
    .replace(/[^\p{L}\p{N}%\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fnv(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}

const fingerprint = (text: string) => fnv(`${BUSINESS}|${normalise(text)}`);

export function FingerprintDemo() {
  const [pick, setPick] = useState(0);
  const [seen, setSeen] = useState<Record<string, number>>({});
  const stored = useMemo(() => STORED.map((p) => ({ ...p, fp: fingerprint(p.text) })), []);
  const incoming = INCOMING[pick];
  const fp = fingerprint(incoming.text);
  const match = stored.find((s) => s.fp === fp);

  return (
    <div className="panel overflow-hidden font-mono text-[12px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 text-[11px] text-muted">
        <span>
          <span className="text-fg">dedup</span> · {BUSINESS}
        </span>
        <span className="text-dim">illustrative posts</span>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-line px-5 py-3">
        {INCOMING.map((p, i) => (
          <button key={p.label} onClick={() => setPick(i)} className={cn("chip", pick === i && "border-accent/60 text-accent")} aria-pressed={pick === i}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-line md:grid-cols-2">
        <div className="min-w-0 bg-surface p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-dim">incoming scrape</div>
          <p className="mt-2 font-sans text-[14px] leading-relaxed text-fg">{incoming.text}</p>
          <div className="mt-2 text-dim">{incoming.date} · date ignored</div>
          <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-dim">normalised</div>
          <p className="mt-1 break-words text-muted">{normalise(incoming.text)}</p>
          <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-dim">fingerprint</div>
          <p className="mt-1 text-accent">{fp}</p>
        </div>

        <div className="min-w-0 bg-surface p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-dim">repository · posts.fingerprint UNIQUE</div>
          <ul className="mt-2 space-y-2">
            {stored.map((s) => (
              <li key={s.fp} className={cn("rounded border p-2.5 transition-colors", match?.fp === s.fp ? "border-accent/60 bg-accent/[0.06]" : "border-line")}>
                <div className="truncate font-sans text-[13px] text-fg/85">{s.text}</div>
                <div className="mt-1 flex justify-between text-[11px] text-dim">
                  <span>{s.fp}</span>
                  <span>times_seen {1 + (seen[s.fp] ?? 0)}</span>
                </div>
              </li>
            ))}
          </ul>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${pick}-${match?.fp ?? "new"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("mt-4 rounded px-3 py-2.5", match ? "bg-warn/10 text-warn" : "bg-accent/10 text-accent")}
              aria-live="polite"
            >
              {match ? "DUPLICATE → skipped, times_seen + 1" : "NEW → stored, queued for AI analysis"}
            </motion.div>
          </AnimatePresence>
          {match ? (
            <button className="mt-3 text-[11px] text-muted underline-offset-2 hover:text-fg hover:underline" onClick={() => setSeen((x) => ({ ...x, [match.fp]: (x[match.fp] ?? 0) + 1 }))}>
              run this scrape again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
