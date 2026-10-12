"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Fades + lifts content once when it scrolls into view. */
export function Reveal({ children, delay = 0, y = 24, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Line-by-line masked text reveal for large headings.
 * The in-view trigger lives on the wrapper: the lines start translated out of
 * their overflow-hidden masks, so observing them directly would never fire.
 */
export function RevealLines({ lines, className, lineClassName, delay = 0 }: { lines: readonly string[]; className?: string; lineClassName?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`block ${className ?? ""}`}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <span key={line + i} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            variants={{ hidden: { y: "105%" }, show: { y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
