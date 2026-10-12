"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Command } from "lucide-react";
import { useEffect, useState } from "react";
import { useOS } from "@/components/command-palette/os-context";
import { Magnetic } from "@/components/ui/magnetic";
import { now } from "@/data/now";
import { profile } from "@/data/profile";
import { SystemDiagram } from "./system-diagram";

const ease = [0.16, 1, 0.3, 1] as const;

function Clock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: profile.timezone, hour12: false });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t ?? "--:--:--"} IST</span>;
}

export function Hero() {
  const { openPalette, go } = useOS();
  const reduce = useReducedMotion();
  const line = (i: number) => ({
    initial: reduce ? false : { y: "110%" },
    animate: { y: 0 },
    transition: { duration: 1.1, delay: 0.15 + i * 0.09, ease },
  });
  const fade = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: d, ease },
  });

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16" aria-label="Introduction">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]" aria-hidden />

      {/* architecture visualization */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full items-center justify-end opacity-25 md:w-[70%] xl:w-[44%] xl:opacity-100">
        <SystemDiagram className="h-[78%] max-h-[640px] w-auto translate-x-[18%] md:translate-x-[6%] xl:translate-x-0 xl:pr-[var(--gutter)]" />
      </div>

      <div className="container-os relative flex flex-1 flex-col justify-between gap-10 py-10 md:py-14">
        {/* top status bar */}
        <motion.div {...fade(0.05)} className="grid grid-cols-2 gap-x-6 gap-y-4 font-mono text-[10.5px] uppercase tracking-[0.16em] sm:max-w-md xl:max-w-[54%] xl:grid-cols-4">
          <div>
            <div className="text-dim">System status</div>
            <div className="mt-1 flex items-center gap-2 text-fg">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" /> Online
            </div>
          </div>
          <div>
            <div className="text-dim">Location</div>
            <div className="mt-1 text-fg">{profile.location}</div>
          </div>
          <div>
            <div className="text-dim">Local time</div>
            <div className="mt-1 text-fg">
              <Clock />
            </div>
          </div>
          <div>
            <div className="text-dim">Currently</div>
            <div className="mt-1 text-fg">Building intelligent systems</div>
          </div>
        </motion.div>

        <div>
          <motion.div {...fade(0.1)} className="mb-6 flex flex-col gap-2 md:mb-10">
            <p className="text-2xl font-medium leading-none tracking-tight md:text-[2.1rem]">
              {profile.name.split(" ")[0].toUpperCase()}
              <br />
              <span className="text-muted">{profile.name.split(" ").slice(1).join(" ").toUpperCase()}</span>
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{profile.roles.join(" · ")}</p>
          </motion.div>

          <h1 className="relative text-mega font-medium xl:text-[length:min(8.6vw,9.25rem)]" aria-label={`${profile.name}. I build intelligent systems.`}>
            {["I BUILD", "INTELLIGENT", "SYSTEMS."].map((w, i) => (
              <span key={w} className="block overflow-hidden" aria-hidden>
                <motion.span {...line(i)} className={`block ${i === 1 ? "text-transparent [-webkit-text-stroke:1px_#F5F5F5] md:[-webkit-text-stroke:1.5px_#F5F5F5]" : ""}`}>
                  {i === 2 ? (
                    <>
                      SYSTEMS<span className="text-accent">.</span>
                    </>
                  ) : (
                    w
                  )}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        <div className="flex flex-col gap-8 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
          <motion.ul {...fade(0.6)} className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.2em] text-muted">
            {profile.disciplines.map((d, i) => (
              <li key={d} className="flex items-center gap-2">
                <span className="text-dim">0{i + 1}</span>
                <span className="text-fg">{d}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div {...fade(0.75)} className="flex flex-wrap gap-3">
            <Magnetic>
              <button className="btn-primary" onClick={() => go("#work")}>
                Explore my work <ArrowDown size={14} />
              </button>
            </Magnetic>
            <Magnetic>
              <button className="btn-ghost" onClick={() => openPalette()}>
                <Command size={13} /> Open {profile.shortName}.OS
              </button>
            </Magnetic>
          </motion.div>
        </div>
      </div>

      <div className="relative overflow-hidden border-y border-line py-3" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-10">
              {["LLM pipelines", "RAG", "Forecasting", "Static analysis", "FastAPI", "Go", "Computer vision", "Reinforcement learning", `Now: ${now.focus}`, "Published on PyPI", "Published on Zenodo"].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t}
                  <span className="text-accent">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
