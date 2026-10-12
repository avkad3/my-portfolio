"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const RAMP = ".,-~:;=!*#$@";
const COLS = 64;
const ROWS = 30;

/** A shaded torus rendered as text — runs only while visible. */
export function AsciiPreview() {
  const preRef = useRef<HTMLPreElement>(null);
  const inView = useInView(preRef, { margin: "0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    let A = 1;
    let B = 0.6;
    let raf = 0;
    let last = 0;
    const frame = (t: number) => {
      if (t - last > 45) {
        last = t;
        const out = new Array(COLS * ROWS).fill(" ");
        const z = new Float32Array(COLS * ROWS);
        const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
        for (let j = 0; j < 6.28; j += 0.07) {
          const ct = Math.cos(j), st = Math.sin(j);
          for (let i = 0; i < 6.28; i += 0.02) {
            const sp = Math.sin(i), cp = Math.cos(i);
            const h = ct + 2;
            const D = 1 / (sp * h * sA + st * cA + 5);
            const tt = sp * h * cA - st * sA;
            const x = Math.floor(COLS / 2 + 30 * D * (cp * h * cB - tt * sB));
            const y = Math.floor(ROWS / 2 + 15 * D * (cp * h * sB + tt * cB));
            const o = x + COLS * y;
            const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS && D > z[o]) {
              z[o] = D;
              out[o] = RAMP[Math.max(0, N)];
            }
          }
        }
        let s = "";
        for (let r = 0; r < ROWS; r++) s += out.slice(r * COLS, r * COLS + COLS).join("") + "\n";
        if (preRef.current) preRef.current.textContent = s;
        A += 0.045;
        B += 0.025;
      }
      if (!reduce && inView) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  return (
    <pre
      ref={preRef}
      aria-label="Animated ASCII rendering of a rotating torus"
      role="img"
      className="select-none overflow-hidden whitespace-pre text-center font-mono text-[9px] leading-[1.05] text-accent/90 sm:text-[11px]"
    />
  );
}
