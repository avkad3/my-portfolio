"use client";

import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { cn } from "@/lib/cn";

type MapNode = d3.SimulationNodeDatum & { id: string; type: "project" | "tech"; label: string; r: number; project?: Project; weight: number };
type MapLink = d3.SimulationLinkDatum<MapNode> & { source: string | MapNode; target: string | MapNode };

const W = 1000;
const H = 640;

const KIND_COLOR: Record<Project["kind"], string> = {
  flagship: "#3DF2A6",
  system: "#F5F5F5",
  savic: "#5AB8FF",
  archive: "#8A8A8A",
};

function useLayout() {
  return useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.stack) counts.set(t, (counts.get(t) ?? 0) + 1);
    const techs = [...counts.entries()].filter(([, c]) => c >= 2).map(([t]) => t);

    const nodes: MapNode[] = [
      ...projects.map<MapNode>((p) => ({
        id: `p:${p.slug}`,
        type: "project",
        label: p.name,
        project: p,
        r: p.kind === "flagship" ? 30 : p.kind === "archive" ? 14 : 22,
        weight: 1,
      })),
      ...techs.map<MapNode>((t) => ({ id: `t:${t}`, type: "tech", label: t, r: 3 + (counts.get(t) ?? 1) * 1.1, weight: counts.get(t) ?? 1 })),
    ];
    const links: MapLink[] = projects.flatMap((p) => p.stack.filter((t) => techs.includes(t)).map((t) => ({ source: `p:${p.slug}`, target: `t:${t}` })));

    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<MapNode, MapLink>(links).id((d) => d.id).distance(95).strength(0.35))
      .force("charge", d3.forceManyBody<MapNode>().strength((d) => (d.type === "project" ? -900 : -160)))
      .force("collide", d3.forceCollide<MapNode>((d) => d.r + (d.type === "project" ? 34 : 18)))
      .force("x", d3.forceX(W / 2).strength(0.06))
      .force("y", d3.forceY(H / 2).strength(0.09))
      .stop();
    for (let i = 0; i < 400; i++) sim.tick();
    // Fit the settled layout to the canvas so it uses the full frame.
    const xs = d3.extent(nodes, (n) => n.x!) as [number, number];
    const ys = d3.extent(nodes, (n) => n.y!) as [number, number];
    const fx = d3.scaleLinear().domain(xs).range([90, W - 90]);
    const fy = d3.scaleLinear().domain(ys).range([50, H - 90]);
    for (const n of nodes) {
      n.x = fx(n.x!);
      n.y = fy(n.y!);
    }
    return { nodes, links: links as (MapLink & { source: MapNode; target: MapNode })[] };
  }, []);
}

export default function SystemMap() {
  const { nodes, links } = useLayout();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("p:pycodeatlas");

  const focus = hover ?? selected;
  const neighbours = useMemo(() => {
    const s = new Set<string>([focus]);
    for (const l of links) {
      if (l.source.id === focus) s.add(l.target.id);
      if (l.target.id === focus) s.add(l.source.id);
    }
    return s;
  }, [focus, links]);

  const selProject = nodes.find((n) => n.id === selected)?.project;

  return (
    <div className="panel grid overflow-hidden lg:grid-cols-[1fr_340px]">
      <div className="dot-bg relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="group" aria-label="System map of projects and the technologies connecting them">
          {links.map((l, i) => {
            const on = neighbours.has(l.source.id) && neighbours.has(l.target.id) && (l.source.id === focus || l.target.id === focus);
            return (
              <line
                key={i}
                x1={l.source.x}
                y1={l.source.y}
                x2={l.target.x}
                y2={l.target.y}
                stroke={on ? "#3DF2A6" : "#232323"}
                strokeOpacity={on ? 0.7 : 1}
                strokeWidth={on ? 1.2 : 1}
                style={{ transition: "stroke .3s, stroke-opacity .3s" }}
              />
            );
          })}
          {nodes.map((n) => {
            const on = neighbours.has(n.id);
            const dim = !on;
            if (n.type === "tech") {
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  onPointerEnter={() => setHover(n.id)}
                  onPointerLeave={() => setHover(null)}
                  style={{ opacity: dim ? 0.6 : 1, transition: "opacity .3s" }}
                  className="cursor-default"
                >
                  <circle r={n.r} fill={on ? "#3DF2A6" : "#3a3a3a"} />
                  <text y={-n.r - 6} textAnchor="middle" fontSize="11" className="pointer-events-none font-mono" fill={on ? "#F5F5F5" : "#777"}>
                    {n.label}
                  </text>
                </g>
              );
            }
            const p = n.project!;
            const isSel = selected === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(null)}
                onClick={() => setSelected(n.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(n.id))}
                tabIndex={0}
                role="button"
                aria-pressed={isSel}
                aria-label={`${p.name}: ${p.tagline}`}
                className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-accent"
                style={{ opacity: dim ? 0.7 : 1, transition: "opacity .3s" }}
              >
                <circle r={n.r + 8} fill="none" stroke={KIND_COLOR[p.kind]} strokeOpacity={isSel ? 0.5 : 0} strokeDasharray="2 4">
                  {isSel ? <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite" /> : null}
                </circle>
                <circle r={n.r} fill="#0b0b0b" stroke={KIND_COLOR[p.kind]} strokeOpacity={on ? 0.9 : 0.4} strokeWidth={1.2} />
                {p.private ? (
                  <path d="M-4 -1 h8 v6 h-8z M-2.5 -1 v-2.5 a2.5 2.5 0 0 1 5 0 v2.5" fill="none" stroke="#8a8a8a" strokeWidth={1} />
                ) : (
                  <circle r={p.kind === "flagship" ? 4 : 2.5} fill={KIND_COLOR[p.kind]} />
                )}
                <text y={n.r + 18} textAnchor="middle" fontSize={p.kind === "archive" ? 11 : 13} fill={on ? "#F5F5F5" : "#8A8A8A"} className="pointer-events-none" fontWeight={500}>
                  {p.name.length > 26 ? p.name.replace(" System", "") : p.name}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute bottom-3 left-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
          {([
            ["flagship", "Flagship"],
            ["system", "Systems"],
            ["savic", "SAVIC internship"],
          ] as const).map(([k, l]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border" style={{ borderColor: KIND_COLOR[k] }} />
              {l}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3a3a3a]" /> Shared technology
          </span>
        </div>
      </div>

      <aside className="relative min-h-[320px] border-t border-line p-6 lg:border-l lg:border-t-0" aria-live="polite">
        <AnimatePresence mode="wait">
          {selProject ? (
            <motion.div key={selProject.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex h-full flex-col">
              <div className="label text-[10px]" style={{ color: KIND_COLOR[selProject.kind] }}>
                {selProject.badge ?? selProject.status}
              </div>
              <h3 className="mt-3 text-2xl font-medium leading-tight tracking-tight">{selProject.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{selProject.tagline}</p>
              {selProject.metric ? (
                <div className="mt-5 flex items-baseline gap-2 border-y border-line py-3">
                  <span className="text-3xl font-medium text-accent">{selProject.metric.value}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{selProject.metric.label}</span>
                </div>
              ) : null}
              <ul className="mt-5 space-y-1.5 text-[13px] text-fg/80">
                {selProject.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-accent">›</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {selProject.stack.map((s) => (
                  <span key={s} className="rounded border border-line px-2 py-0.5 font-mono text-[10.5px] text-muted">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-6">
                {selProject.private ? (
                  <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
                    <Lock size={12} /> Private repository
                  </span>
                ) : selProject.caseStudy ? (
                  <Link href={`/projects/${selProject.slug}`} className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-fg">
                    <span className="link-u">Open case study</span>
                    <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ) : selProject.links.github ? (
                  <a href={selProject.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em]">
                    <span className="link-u">View on GitHub</span> <ArrowUpRight size={14} />
                  </a>
                ) : (
                  <span className={cn("font-mono text-[11px] text-dim")}>From the résumé · no public repository</span>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>
    </div>
  );
}
