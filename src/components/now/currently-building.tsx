"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { now } from "@/data/now";

const CELLS = 20;

export function CurrentlyBuilding() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const target = Math.round((now.progress / 100) * CELLS);
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return setFilled(target);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setFilled(i);
      if (i >= target) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [inView, reduce, target]);

  const updated = new Date(`${now.updated}T00:00:00`);
  const days = Math.max(0, Math.floor((Date.now() - updated.getTime()) / 86_400_000));

  return (
    <section aria-label="Currently building" className="py-16 md:py-24">
      <div className="container-os">
        <div ref={ref} className="panel grid gap-8 p-6 md:grid-cols-12 md:items-center md:p-10">
          <div className="md:col-span-5">
            <div className="label">Currently building</div>
            <div className="mt-4 font-mono text-[clamp(1rem,2.6vw,1.6rem)] leading-none tracking-tight" aria-label={`${now.progress}% progress`}>
              <span className="text-accent">{"█".repeat(filled)}</span>
              <span className="text-line-strong">{"░".repeat(CELLS - filled)}</span>
            </div>
          </div>
          <div className="md:col-span-4">
            <p className="text-2xl font-medium tracking-tight md:text-3xl">{now.focus}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 font-mono text-[11px] uppercase tracking-[0.14em] md:col-span-3">
            <div>
              <dt className="text-dim">Status</dt>
              <dd className="mt-1.5 flex items-center gap-2 text-accent">
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" />
                {now.status}
              </dd>
            </div>
            <div>
              <dt className="text-dim">Last updated</dt>
              <dd className="mt-1.5 text-fg" suppressHydrationWarning>
                {updated.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                <span className="block text-dim" suppressHydrationWarning>
                  {days === 0 ? "today" : `${days}d ago`}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
