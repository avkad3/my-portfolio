"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { projectsUsing, stack } from "@/data/skills";
import { cn } from "@/lib/cn";

const S = 820;
const C = S / 2;
const R_CAT = 150;
const R_TECH = 300;

function useRadial() {
  return useMemo(() => {
    const total = stack.reduce((a, c) => a + c.items.length, 0) + stack.length; // gap per category
    let cursor = -Math.PI / 2;
    const step = (Math.PI * 2) / total;
    return stack.map((cat) => {
      const start = cursor;
      const techs = cat.items.map((t, i) => {
        const a = start + step * (i + 0.5);
        return { name: t, a, x: C + Math.cos(a) * R_TECH, y: C + Math.sin(a) * R_TECH, used: projectsUsing(t).length };
      });
      cursor += step * (cat.items.length + 1);
      const mid = start + (step * cat.items.length) / 2;
      return { ...cat, a: mid, x: C + Math.cos(mid) * R_CAT, y: C + Math.sin(mid) * R_CAT, techs };
    });
  }, []);
}

export function StackExe() {
  const radial = useRadial();
  const [active, setActive] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const used = active ? projectsUsing(active) : [];

  return (
    <section id="stack" className="py-24 md:py-36" aria-label="Technology stack">
      <div className="container-os">
        <SectionHeader
          index="05"
          kicker="Stack"
          title={["STACK.EXE"]}
          aside={<p className="max-w-xl text-muted">No skill bars. Hover any technology to see the shipped projects that actually used it.</p>}
        />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-7 lg:block">
            <svg viewBox={`-60 -40 ${S + 120} ${S + 80}`} className="h-auto w-full" role="group" aria-label="Radial network of technologies grouped by category">
              <circle cx={C} cy={C} r={R_TECH} fill="none" stroke="#1a1a1a" />
              <circle cx={C} cy={C} r={R_CAT} fill="none" stroke="#1a1a1a" strokeDasharray="2 6" />
              {radial.map((c) =>
                c.techs.map((t) => {
                  const on = active === t.name || cat === c.id;
                  return (
                    <path
                      key={t.name}
                      d={`M${c.x},${c.y} Q${C + Math.cos(t.a) * (R_CAT + 60)},${C + Math.sin(t.a) * (R_CAT + 60)} ${t.x},${t.y}`}
                      fill="none"
                      stroke={on ? "#3DF2A6" : "#1f1f1f"}
                      strokeOpacity={on ? 0.8 : 1}
                      style={{ transition: "stroke .25s" }}
                    />
                  );
                }),
              )}
              {radial.map((c) => (
                <line key={c.id} x1={C} y1={C} x2={c.x} y2={c.y} stroke={cat === c.id ? "#3DF2A6" : "#262626"} />
              ))}
              <g>
                <circle cx={C} cy={C} r={44} fill="#0b0b0b" stroke="#333" />
                <text x={C} y={C + 4} textAnchor="middle" fontSize="12" letterSpacing="2" className="font-mono" fill="#F5F5F5">
                  A.OS
                </text>
              </g>
              {radial.map((c) => (
                <g key={c.id} onPointerEnter={() => setCat(c.id)} onPointerLeave={() => setCat(null)} className="cursor-default">
                  <circle cx={c.x} cy={c.y} r={30} fill="#0b0b0b" stroke={cat === c.id ? "#3DF2A6" : "#333"} />
                  <text x={c.x} y={c.y - 2} textAnchor="middle" fontSize="10" className="font-mono" fill="#3DF2A6">
                    {c.code}
                  </text>
                  <text x={c.x} y={c.y + 11} textAnchor="middle" fontSize="8.5" className="font-mono" fill="#8A8A8A" letterSpacing="0.5">
                    {c.label.toUpperCase().slice(0, 12)}
                  </text>
                </g>
              ))}
              {radial.map((c) =>
                c.techs.map((t) => {
                  const on = active === t.name || cat === c.id;
                  const deg = (t.a * 180) / Math.PI;
                  const flip = deg > 90 && deg < 270;
                  return (
                    <g
                      key={t.name}
                      onPointerEnter={() => setActive(t.name)}
                      onPointerLeave={() => setActive(null)}
                      className="cursor-pointer"
                    >
                      <circle cx={t.x} cy={t.y} r={t.used ? 4.5 : 3} fill={on ? "#3DF2A6" : t.used ? "#8A8A8A" : "#3a3a3a"} />
                      <circle cx={t.x} cy={t.y} r={14} fill="transparent" />
                      <text
                        transform={`translate(${t.x},${t.y}) rotate(${flip ? deg + 180 : deg}) translate(${flip ? -12 : 12},0)`}
                        textAnchor={flip ? "end" : "start"}
                        dominantBaseline="middle"
                        fontSize="12"
                        className="font-mono"
                        fill={on ? "#F5F5F5" : "#7a7a7a"}
                        style={{ transition: "fill .2s" }}
                      >
                        {t.name}
                      </text>
                    </g>
                  );
                }),
              )}
            </svg>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="panel h-[240px] overflow-y-auto p-5 lg:h-[300px]" aria-live="polite">
                <div className="label text-[10px]">Used in</div>
                <AnimatePresence mode="wait">
                  <motion.div key={active ?? "none"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    {!active ? (
                      <p className="mt-3 text-sm text-muted">Hover or focus a technology.</p>
                    ) : (
                      <>
                        <div className="mt-3 text-2xl font-medium tracking-tight">{active}</div>
                        {used.length ? (
                          <ul className="mt-4 space-y-2">
                            {used.map((p) => (
                              <li key={p.slug}>
                                <Link href={p.caseStudy ? `/projects/${p.slug}` : "#work"} className="group flex items-center justify-between gap-3 border-b border-line pb-2 text-sm">
                                  <span>{p.name}</span>
                                  <ArrowUpRight size={13} className="text-dim group-hover:text-accent" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-muted">In the toolkit; not tied to a specific project listed here.</p>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-6 space-y-5">
                {stack.map((c) => (
                  <div key={c.id}>
                    <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">
                      <span className="text-accent">{c.code}</span> {c.label}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.items.map((t) => (
                        <button
                          key={t}
                          onPointerEnter={() => setActive(t)}
                          onFocus={() => setActive(t)}
                          onClick={() => setActive(t)}
                          className={cn("chip", active === t ? "border-accent/60 text-accent" : "hover:text-fg")}
                        >
                          {t}
                          {projectsUsing(t).length ? <span className="text-dim">{projectsUsing(t).length}</span> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
