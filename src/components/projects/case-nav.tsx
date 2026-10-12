"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** Sticky progress rail: Problem → Approach → … → Technology. */
export function CaseNav({ steps }: { steps: { id: string; label: string }[] }) {
  const [active, setActive] = useState(steps[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    steps.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [steps]);

  const idx = steps.findIndex((s) => s.id === active);
  return (
    <nav aria-label="Case study sections" className="sticky top-24 hidden lg:block">
      <ol className="space-y-0">
        {steps.map((s, i) => (
          <li key={s.id} className="flex flex-col">
            <a href={`#${s.id}`} className={cn("flex items-center gap-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors", i === idx ? "text-accent" : i < idx ? "text-fg" : "text-dim hover:text-muted")}>
              <span className={cn("h-1.5 w-1.5 rounded-full transition-colors", i <= idx ? "bg-accent" : "bg-line-strong")} />
              {s.label}
            </a>
            {i < steps.length - 1 ? <span className={cn("ml-[2.5px] h-5 w-px transition-colors", i < idx ? "bg-accent" : "bg-line")} aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
