"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { trackGlow } from "@/components/ui/glow";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { experience } from "@/data/experience";

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="py-24 md:py-36" aria-label="Experience">
      <div className="container-os">
        <SectionHeader index="02" kicker="Experience" title={["WHERE I'VE", "SHIPPED."]} />

        <ol ref={ref} className="relative">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-line md:left-[calc(25%-1px)]" aria-hidden>
            <motion.div className="h-full w-full origin-top bg-accent" style={{ scaleY: fill }} />
          </div>

          {experience.map((role, idx) => (
            <li key={role.company} className="relative grid gap-6 pb-20 pl-8 last:pb-0 md:grid-cols-4 md:gap-10 md:pl-0">
              <span className="absolute left-0 top-2 grid h-[15px] w-[15px] place-items-center rounded-full border border-line-strong bg-bg md:left-[calc(25%-8px)]" aria-hidden>
                <span className={`h-[5px] w-[5px] rounded-full ${idx === 0 ? "bg-accent" : "bg-muted"}`} />
              </span>

              <div className="md:sticky md:top-28 md:self-start md:pr-10 md:text-right">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{role.period}</div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{role.domain}</div>
              </div>

              <div className="md:col-span-3 md:pl-10">
                <h3 className="text-[clamp(2rem,5vw,4rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                  <RevealLines lines={[role.company]} />
                </h3>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-muted">{role.role}</p>
                <Reveal>
                  <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg/80">{role.summary}</p>
                </Reveal>

                <div className={`mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line ${role.workstreams.length > 1 ? "lg:grid-cols-3" : ""}`}>
                  {role.workstreams.map((w, i) => {
                    const body = (
                      <>
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-lg font-medium leading-tight">{w.title}</h4>
                            {w.project ? <ArrowUpRight size={16} className="shrink-0 text-dim transition-colors group-hover:text-accent" /> : null}
                          </div>
                          {w.metric ? (
                            <div className="mt-6 flex items-baseline gap-3 border-y border-line py-4">
                              <span className="text-4xl font-medium tracking-tight text-accent">{w.metric.value}</span>
                              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{w.metric.label}</span>
                            </div>
                          ) : null}
                          <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted">
                            {w.points.map((p) => (
                              <li key={p} className="flex gap-2.5">
                                <span className="mt-[9px] h-px w-3 shrink-0 bg-line-strong" />
                                {p}
                              </li>
                            ))}
                          </ul>
                          {w.stack.length ? (
                            <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                              {w.stack.map((s) => (
                                <span key={s} className="rounded border border-line px-2 py-0.5 font-mono text-[10.5px] text-muted">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : null}
                      </>
                    );
                    const cls = "glow group flex h-full flex-col p-6";
                    return (
                      <Reveal key={w.title} delay={i * 0.08} className="bg-bg">
                        {w.project ? (
                          <Link href={`/projects/${w.project}`} onPointerMove={trackGlow} className={cls}>
                            {body}
                          </Link>
                        ) : (
                          <div onPointerMove={trackGlow} className={cls}>
                            {body}
                          </div>
                        )}
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
