"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackGlow } from "@/components/ui/glow";
import { Reveal } from "@/components/ui/reveal";
import { impact } from "@/data/profile";

function CountUp({ to, duration = 1800 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(to);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString("en-US")}
    </span>
  );
}

export function Impact() {
  return (
    <section aria-labelledby="impact-title" className="relative py-24 md:py-36">
      <div className="container-os">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-index">// OUTPUT</span>
            <h2 id="impact-title" className="mt-3 max-w-xl text-2xl font-medium tracking-tight text-fg md:text-3xl">
              Measured impact from shipped systems.
            </h2>
          </div>
          <p className="label">Source · SAVIC Technologies · 2026</p>
        </Reveal>

        <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {impact.map((m, i) => (
            <Link
              key={m.label}
              href={`/projects/${m.project}`}
              onPointerMove={trackGlow}
              className="glow group relative flex min-h-[260px] flex-col justify-between border-b border-r border-line p-6 md:min-h-[320px] md:p-8"
            >
              <div className="flex items-center justify-between font-mono text-[11px] text-dim">
                <span>[{String(i + 1).padStart(2, "0")}]</span>
                <ArrowUpRight size={14} className="opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" />
              </div>
              <div>
                <div className="text-[clamp(3.25rem,6.5vw,5.5rem)] font-medium leading-none tracking-[-0.05em]">
                  <CountUp to={m.value} />
                  <span className="text-accent">{m.suffix}</span>
                </div>
                <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-fg">{m.label}</div>
                <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-muted">{m.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
