"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const STAGES = ["Purchase order", "Validation", "Supplier review", "Decision", "Sales order", "Inventory", "Fulfillment"];
const OUTCOMES = [
  { id: "approve", label: "APPROVE", color: "#3DF2A6", detail: "All 12 lines approved" },
  { id: "partial", label: "PARTIAL", color: "#F2C94C", detail: "9 of 12 lines approved" },
  { id: "reject", label: "REJECT", color: "#FF5C5C", detail: "Stock unavailable — PO returned" },
] as const;

/** Animated walk-through of the order-to-cash state machine (illustrative PO). */
export function OrderFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const outcome = OUTCOMES[run % OUTCOMES.length];
  const stopAt = outcome.id === "reject" ? 3 : STAGES.length - 1;

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= stopAt + 2) {
          setRun((r) => r + 1);
          return 0;
        }
        return s + 1;
      });
    }, 750);
    return () => clearInterval(id);
  }, [inView, reduce, stopAt]);

  const shown = reduce ? STAGES.length - 1 : step;

  return (
    <div ref={ref} className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[11px]">
        <span className="text-muted">
          <span className="text-fg">PO-{1042 + run}</span> · order-to-cash
        </span>
        <span className="flex gap-1.5">
          {OUTCOMES.map((o, i) => (
            <button
              key={o.id}
              className={cn("chip py-0.5", outcome.id === o.id && "text-fg")}
              style={outcome.id === o.id ? { borderColor: o.color, color: o.color } : undefined}
              onClick={() => {
                setRun(i);
                setStep(0);
              }}
            >
              {o.label}
            </button>
          ))}
        </span>
      </div>
      <ol className="relative p-5 md:p-6">
        {STAGES.map((s, i) => {
          const reached = i <= Math.min(shown, stopAt);
          const current = i === Math.min(shown, stopAt);
          const blocked = outcome.id === "reject" && i > 3;
          const isDecision = i === 3;
          return (
            <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
              {i < STAGES.length - 1 ? (
                <span className="absolute left-[9px] top-5 h-full w-px bg-line">
                  <span className="block w-full bg-accent transition-all duration-500" style={{ height: reached && i < Math.min(shown, stopAt) ? "100%" : "0%", background: blocked ? "#333" : undefined }} />
                </span>
              ) : null}
              <span
                className="relative z-10 mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full border transition-colors duration-300"
                style={{
                  borderColor: reached ? (isDecision ? outcome.color : "#3DF2A6") : "#333",
                  background: current ? (isDecision ? outcome.color : "#3DF2A6") : "#0b0b0b",
                }}
              >
                {current && !reduce ? <span className="absolute inset-0 animate-ping rounded-full" style={{ background: isDecision ? outcome.color : "#3DF2A6", opacity: 0.3 }} /> : null}
              </span>
              <div className={cn("flex flex-1 flex-wrap items-baseline justify-between gap-x-4 transition-opacity duration-300", reached ? "opacity-100" : "opacity-35", blocked && "line-through opacity-20")}>
                <span className="font-mono text-[12px] uppercase tracking-[0.14em]">{isDecision ? `Approve / Reject / Partial` : s}</span>
                {isDecision && reached ? (
                  <span className="font-mono text-[11px]" style={{ color: outcome.color }}>
                    → {outcome.label} · {outcome.detail}
                  </span>
                ) : i === 1 && reached ? (
                  <span className="font-mono text-[11px] text-muted">material ✓ stock ✓</span>
                ) : i === 0 && reached ? (
                  <span className="font-mono text-[11px] text-muted">.xlsx / .pdf parsed</span>
                ) : i === 5 && reached ? (
                  <span className="font-mono text-[11px] text-muted">stock reserved</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
