"use client";

import * as d3 from "d3";
import { Maximize2, MousePointer2, RotateCcw, Trash, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A miniature of what PyCodeAtlas produces for a codebase. The graph below is a
 * small demo project (not real analysis output) used to show the interactions:
 * dependency inspection, dead-code classes and deletion impact.
 */
type Status = "entry" | "live" | "unused" | "test-only" | "uncovered";
type GNode = d3.SimulationNodeDatum & { id: string; module: string; kind: "module" | "function" | "class" | "route" | "test"; status: Status };
type GLink = d3.SimulationLinkDatum<GNode> & { source: string | GNode; target: string | GNode };

const RAW_NODES: Omit<GNode, "x" | "y">[] = [
  { id: "app.py", module: "app.py", kind: "module", status: "entry" },
  { id: "routes.py::checkout", module: "routes.py", kind: "route", status: "entry" },
  { id: "routes.py::get_order", module: "routes.py", kind: "route", status: "entry" },
  { id: "cli.py::main", module: "cli.py", kind: "function", status: "entry" },
  { id: "billing.py::calculate_tax", module: "billing.py", kind: "function", status: "live" },
  { id: "billing.py::apply_discount", module: "billing.py", kind: "function", status: "live" },
  { id: "billing.py::invoice_total", module: "billing.py", kind: "function", status: "live" },
  { id: "billing.py::legacy_rounding", module: "billing.py", kind: "function", status: "unused" },
  { id: "models.py::Order", module: "models.py", kind: "class", status: "live" },
  { id: "models.py::User", module: "models.py", kind: "class", status: "live" },
  { id: "models.py::AuditLog", module: "models.py", kind: "class", status: "uncovered" },
  { id: "db.py::session", module: "db.py", kind: "function", status: "live" },
  { id: "utils.py::fmt_currency", module: "utils.py", kind: "function", status: "live" },
  { id: "utils.py::slugify", module: "utils.py", kind: "function", status: "test-only" },
  { id: "utils.py::old_csv_export", module: "utils.py", kind: "function", status: "unused" },
  { id: "plugins.py::load", module: "plugins.py", kind: "function", status: "uncovered" },
  { id: "tests/test_billing.py", module: "tests", kind: "test", status: "live" },
  { id: "tests/test_utils.py", module: "tests", kind: "test", status: "live" },
];

// caller → callee
const RAW_LINKS: [string, string][] = [
  ["app.py", "routes.py::checkout"],
  ["app.py", "routes.py::get_order"],
  ["routes.py::checkout", "billing.py::invoice_total"],
  ["routes.py::checkout", "models.py::Order"],
  ["routes.py::checkout", "db.py::session"],
  ["routes.py::get_order", "models.py::Order"],
  ["routes.py::get_order", "db.py::session"],
  ["routes.py::get_order", "utils.py::fmt_currency"],
  ["billing.py::invoice_total", "billing.py::calculate_tax"],
  ["billing.py::invoice_total", "billing.py::apply_discount"],
  ["billing.py::invoice_total", "utils.py::fmt_currency"],
  ["billing.py::apply_discount", "models.py::User"],
  ["models.py::Order", "models.py::User"],
  ["models.py::Order", "db.py::session"],
  ["models.py::AuditLog", "db.py::session"],
  ["cli.py::main", "billing.py::invoice_total"],
  ["cli.py::main", "plugins.py::load"],
  ["tests/test_billing.py", "billing.py::calculate_tax"],
  ["tests/test_billing.py", "billing.py::invoice_total"],
  ["tests/test_utils.py", "utils.py::slugify"],
  ["tests/test_utils.py", "utils.py::fmt_currency"],
];

const STATUS_COLOR: Record<Status, string> = {
  entry: "#5AB8FF",
  live: "#9a9a9a",
  unused: "#FF5C5C",
  "test-only": "#F2C94C",
  uncovered: "#C08AFF",
};

const STATUS_LABEL: Record<Status, string> = {
  entry: "Entry point",
  live: "Reachable",
  unused: "Dead · unused",
  "test-only": "Dead · test-only",
  uncovered: "Uncovered",
};

/** Everything that transitively calls `id` — what breaks if `id` is deleted. */
function impactOf(id: string) {
  const callers = new Map<string, string[]>();
  for (const [a, b] of RAW_LINKS) callers.set(b, [...(callers.get(b) ?? []), a]);
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const n = stack.pop()!;
    for (const c of callers.get(n) ?? []) if (!out.has(c)) out.add(c), stack.push(c);
  }
  return out;
}

const short = (id: string) => (id.includes("::") ? id.split("::")[1] : id);

export default function DependencyGraph({ compact = false }: { compact?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const markerId = `arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [selected, setSelected] = useState<string | null>("billing.py::calculate_tax");
  const [mode, setMode] = useState<"inspect" | "delete">("inspect");
  const [deleted, setDeleted] = useState<string | null>(null);

  const deps = useMemo(() => {
    if (!selected) return { uses: [], usedBy: [] };
    return {
      uses: RAW_LINKS.filter(([a]) => a === selected).map(([, b]) => b),
      usedBy: RAW_LINKS.filter(([, b]) => b === selected).map(([a]) => a),
    };
  }, [selected]);
  const broken = useMemo(() => (deleted ? impactOf(deleted) : new Set<string>()), [deleted]);

  // Build simulation once.
  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    const wrap = wrapRef.current!;
    const { width, height } = wrap.getBoundingClientRect();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    const nodes: GNode[] = RAW_NODES.map((n) => ({ ...n }));
    const links: GLink[] = RAW_LINKS.map(([source, target]) => ({ source, target }));
    const root = svg.append("g").attr("class", "root");

    svg
      .append("defs")
      .append("marker")
      .attr("id", markerId)
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 16)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "#444");

    const link = root
      .append("g")
      .selectAll<SVGLineElement, GLink>("line")
      .data(links)
      .join("line")
      .attr("class", "edge")
      .attr("stroke", "#2e2e2e")
      .attr("stroke-width", 1)
      .attr("marker-end", `url(#${markerId})`);

    const node = root
      .append("g")
      .selectAll<SVGGElement, GNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", (d) => `${d.id}, ${STATUS_LABEL[d.status]}`)
      .style("cursor", "pointer");

    node
      .append("circle")
      .attr("r", (d) => (d.kind === "module" || d.kind === "test" ? 9 : d.kind === "route" ? 8 : 6.5))
      .attr("fill", "#0b0b0b")
      .attr("stroke", (d) => STATUS_COLOR[d.status])
      .attr("stroke-width", 1.5);
    node
      .append("text")
      .text((d) => short(d.id))
      .attr("x", 13)
      .attr("y", 4)
      .attr("font-size", 10.5)
      .attr("font-family", "var(--font-mono)")
      .attr("fill", "#8a8a8a");

    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<GNode, GLink>(links).id((d) => d.id).distance(compact ? 52 : 70).strength(0.6))
      .force("charge", d3.forceManyBody().strength(compact ? -220 : -320))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(26))
      .force("x", d3.forceX(width / 2).strength(0.07))
      .force("y", d3.forceY(height / 2).strength(0.12));

    // Keep every node (including disconnected dead code) inside the frame.
    const pad = 40;
    const clamp = () => {
      for (const n of nodes) {
        n.x = Math.max(pad, Math.min(width - pad * 3, n.x!));
        n.y = Math.max(pad + 30, Math.min(height - pad, n.y!));
      }
    };

    const render = () => {
      clamp();
      link
        .attr("x1", (d) => (d.source as GNode).x!)
        .attr("y1", (d) => (d.source as GNode).y!)
        .attr("x2", (d) => (d.target as GNode).x!)
        .attr("y2", (d) => (d.target as GNode).y!);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    };
    sim.on("tick", render);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sim.stop();
      for (let i = 0; i < 300; i++) sim.tick();
      render();
    }

    node.call(
      d3
        .drag<SVGGElement, GNode>()
        .on("start", (e, d) => {
          if (!e.active) sim.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (e, d) => {
          d.fx = e.x;
          d.fy = e.y;
        })
        .on("end", (e, d) => {
          if (!e.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }),
    );

    node.on("click", (_, d) => wrap.dispatchEvent(new CustomEvent("node-pick", { detail: d.id })));
    node.on("keydown", (e: KeyboardEvent, d) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        wrap.dispatchEvent(new CustomEvent("node-pick", { detail: d.id }));
      }
    });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .filter((e) => (e.type === "wheel" ? e.ctrlKey || e.metaKey || e.shiftKey : !e.button))
      .on("zoom", (e) => root.attr("transform", e.transform.toString()));
    svg.call(zoom).on("dblclick.zoom", null);
    zoomRef.current = zoom;

    return () => {
      sim.stop();
    };
  }, [compact, markerId]);

  // Node picks route through a DOM event so the D3 effect never re-runs.
  useEffect(() => {
    const wrap = wrapRef.current!;
    const onPick = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelected(id);
      if (mode === "delete") setDeleted((d) => (d === id ? null : id));
    };
    wrap.addEventListener("node-pick", onPick);
    return () => wrap.removeEventListener("node-pick", onPick);
  }, [mode]);

  // Visual state.
  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    const related = new Set(selected ? [selected, ...deps.uses, ...deps.usedBy] : []);
    svg
      .selectAll<SVGGElement, GNode>("g.node")
      .transition()
      .duration(250)
      .style("opacity", (d) => {
        if (deleted) return d.id === deleted || broken.has(d.id) ? 1 : 0.4;
        return !selected || related.has(d.id) ? 1 : 0.5;
      });
    svg.selectAll<SVGGElement, GNode>("g.node").select("circle")
      .attr("fill", (d) => (deleted && d.id === deleted ? "#FF5C5C" : deleted && broken.has(d.id) ? "#3a1212" : d.id === selected ? "#3DF2A6" : "#0b0b0b"))
      .attr("stroke", (d) => (deleted && broken.has(d.id) ? "#FF5C5C" : STATUS_COLOR[d.status]));
    svg.selectAll<SVGGElement, GNode>("g.node").select("text")
      .attr("fill", (d) => (d.id === selected || (deleted && broken.has(d.id)) ? "#F5F5F5" : "#8a8a8a"))
      .attr("text-decoration", (d) => (deleted && d.id === deleted ? "line-through" : null));
    svg
      .selectAll<SVGLineElement, GLink>("line.edge")
      .attr("stroke", (l) => {
        const s = (l.source as GNode).id;
        const t = (l.target as GNode).id;
        if (deleted) return (broken.has(s) && (broken.has(t) || t === deleted)) ? "#FF5C5C" : "#1f1f1f";
        if (s === selected) return "#3DF2A6";
        if (t === selected) return "#5AB8FF";
        return "#2a2a2a";
      })
      .attr("stroke-width", (l) => ((l.source as GNode).id === selected || (l.target as GNode).id === selected ? 1.5 : 1));
  }, [selected, deleted, broken, deps]);

  const zoomBy = (k: number) => {
    const svg = d3.select(svgRef.current!);
    svg.transition().duration(300).call(zoomRef.current!.scaleBy, k);
  };
  const resetView = () => {
    const svg = d3.select(svgRef.current!);
    svg.transition().duration(400).call(zoomRef.current!.transform, d3.zoomIdentity);
    setDeleted(null);
  };

  const sel = RAW_NODES.find((n) => n.id === selected);

  return (
    <div className="panel grid overflow-hidden lg:grid-cols-[1fr_300px]">
      <div className="relative">
        <div className="absolute left-3 top-3 z-10 flex gap-1 rounded-md border border-line bg-bg/80 p-1 backdrop-blur" role="group" aria-label="Graph mode">
          <button
            onClick={() => {
              setMode("inspect");
              setDeleted(null);
            }}
            className={cn("flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[11px]", mode === "inspect" ? "bg-white/10 text-fg" : "text-muted hover:text-fg")}
            aria-pressed={mode === "inspect"}
          >
            <MousePointer2 size={12} /> Inspect
          </button>
          <button
            onClick={() => {
              setMode("delete");
              if (selected) setDeleted(selected);
            }}
            className={cn("flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[11px]", mode === "delete" ? "bg-danger/15 text-danger" : "text-muted hover:text-fg")}
            aria-pressed={mode === "delete"}
          >
            <Trash size={12} /> Simulate delete
          </button>
        </div>
        <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-md border border-line bg-bg/80 p-1 backdrop-blur">
          <button onClick={() => zoomBy(1.3)} className="rounded p-1.5 text-muted hover:text-fg" aria-label="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => zoomBy(1 / 1.3)} className="rounded p-1.5 text-muted hover:text-fg" aria-label="Zoom out">
            <ZoomOut size={14} />
          </button>
          <button onClick={resetView} className="rounded p-1.5 text-muted hover:text-fg" aria-label="Reset view">
            <RotateCcw size={14} />
          </button>
        </div>
        <div ref={wrapRef} className={cn("dot-bg w-full touch-none", compact ? "h-[380px]" : "h-[440px] md:h-[540px]")}>
          <svg ref={svgRef} className="h-full w-full" role="application" aria-label="Interactive code dependency graph. Tab to a node and press Enter to inspect it." />
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-1.5 font-mono text-[10px] text-dim sm:flex">
          <Maximize2 size={11} /> drag nodes · drag to pan · ctrl/⇧ + scroll to zoom
        </div>
      </div>

      <aside className="border-t border-line p-5 font-mono text-[12px] lg:border-l lg:border-t-0" aria-live="polite">
        <div className="label text-[10px]">{mode === "delete" ? "Deletion impact" : "Node inspector"}</div>
        {sel ? (
          <>
            <div className="mt-3 break-all text-sm text-fg">{sel.id}</div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[sel.status] }} />
              <span style={{ color: STATUS_COLOR[sel.status] }}>{STATUS_LABEL[sel.status]}</span>
              <span className="text-dim">· {sel.kind}</span>
            </div>

            {mode === "delete" && deleted ? (
              <div className="mt-5 rounded border border-danger/30 bg-danger/[0.06] p-3">
                <div className="text-danger">
                  $ codeatlas impact . &quot;{short(deleted)}&quot;
                </div>
                <div className="mt-2 text-fg">
                  {broken.size === 0 ? "✓ Safe to delete — nothing depends on it." : `✗ ${broken.size} node${broken.size > 1 ? "s" : ""} would break:`}
                </div>
                <ul className="mt-2 space-y-1 text-muted">
                  {[...broken].map((b) => (
                    <li key={b} className="break-all">
                      ↳ {b}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-accent">calls ({deps.uses.length})</div>
                  <ul className="mt-1.5 space-y-1 text-muted">
                    {deps.uses.length ? deps.uses.map((d) => <li key={d} className="break-all">→ {d}</li>) : <li className="text-dim">—</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-accent-blue">called by ({deps.usedBy.length})</div>
                  <ul className="mt-1.5 space-y-1 text-muted">
                    {deps.usedBy.length ? deps.usedBy.map((d) => <li key={d} className="break-all">← {d}</li>) : <li className="text-dim">— no callers</li>}
                  </ul>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-muted">Click a node.</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-4 text-[10.5px]">
          {(Object.keys(STATUS_COLOR) as Status[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[10.5px] leading-relaxed text-dim">Demo codebase for illustration. Run pycodeatlas on your own project for real output.</p>
      </aside>
    </div>
  );
}
