"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type N = { id: string; label: string; x: number; y: number; tier: number };

const NODES: N[] = [
  { id: "model", label: "MODEL", x: 260, y: 96, tier: 0 },
  { id: "rag", label: "RAG", x: 96, y: 222, tier: 1 },
  { id: "ml", label: "ML", x: 260, y: 222, tier: 1 },
  { id: "api", label: "API", x: 424, y: 222, tier: 1 },
  { id: "vdb", label: "VECTOR DB", x: 96, y: 340, tier: 2 },
  { id: "fc", label: "FORECASTING", x: 260, y: 340, tier: 2 },
  { id: "be", label: "BACKEND", x: 424, y: 340, tier: 2 },
  { id: "dep", label: "DEPLOYED", x: 260, y: 476, tier: 3 },
];

const EDGES: [string, string][] = [
  ["model", "rag"],
  ["model", "ml"],
  ["model", "api"],
  ["rag", "vdb"],
  ["ml", "fc"],
  ["api", "be"],
  ["vdb", "dep"],
  ["fc", "dep"],
  ["be", "dep"],
];

const VB = { w: 520, h: 540 };

/** Hero background: an AI-system architecture whose nodes lean toward the cursor. */
export function SystemDiagram({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [booted, setBooted] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 200);
    if (reduce) return () => clearTimeout(t);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * VB.w;
        const y = ((e.clientY - r.top) / r.height) * VB.h;
        setCursor(x > -150 && x < VB.w + 150 && y > -150 && y < VB.h + 150 ? { x, y } : null);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [reduce]);

  const pos = new Map(
    NODES.map((n) => {
      if (!cursor) return [n.id, { ...n, near: 0 }];
      const dx = cursor.x - n.x;
      const dy = cursor.y - n.y;
      const d = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - d / 220);
      return [n.id, { ...n, x: n.x + dx * pull * 0.12, y: n.y + dy * pull * 0.12, near: pull }];
    }),
  );

  const path = (a: string, b: string) => {
    const p = pos.get(a)!;
    const q = pos.get(b)!;
    const mid = (p.y + q.y) / 2;
    return `M${p.x},${p.y + 16} L${p.x},${mid} L${q.x},${mid} L${q.x},${q.y - 16}`;
  };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} className={className} role="img" aria-label="Diagram of an AI system: a model feeds RAG, ML and API layers, backed by a vector database, forecasting and backend, all deployed.">
      <defs>
        <linearGradient id="edge" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3DF2A6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5AB8FF" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="halo">
          <stop offset="0%" stopColor="#3DF2A6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3DF2A6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <text x={VB.w / 2} y={36} textAnchor="middle" className="fill-muted font-mono" fontSize="10" letterSpacing="3">
        AI SYSTEM
      </text>
      <line x1={VB.w / 2 - 60} x2={VB.w / 2 + 60} y1={48} y2={48} stroke="#222" />

      {cursor ? <circle cx={cursor.x} cy={cursor.y} r={140} fill="url(#halo)" /> : null}

      {EDGES.map(([a, b], i) => {
        const d = path(a, b);
        const hot = (pos.get(a)!.near + pos.get(b)!.near) / 2;
        return (
          <g key={a + b}>
            <path
              d={d}
              fill="none"
              stroke={hot > 0.15 ? "url(#edge)" : "#2a2a2a"}
              strokeWidth={1}
              strokeDasharray="600"
              strokeDashoffset={booted ? 0 : 600}
              style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.08}s` }}
            />
            {!reduce && booted ? (
              <circle r="2" fill="#3DF2A6">
                <animateMotion dur={`${2.6 + (i % 3) * 0.7}s`} repeatCount="indefinite" begin={`${1.8 + i * 0.35}s`} path={d} />
                <animate attributeName="opacity" values="0;1;1;0" dur={`${2.6 + (i % 3) * 0.7}s`} repeatCount="indefinite" begin={`${1.8 + i * 0.35}s`} />
              </circle>
            ) : null}
          </g>
        );
      })}

      {NODES.map((n, i) => {
        const p = pos.get(n.id)!;
        const w = Math.max(64, n.label.length * 8.4 + 26);
        const lit = p.near > 0.25 || n.id === "dep";
        return (
          <g
            key={n.id}
            transform={`translate(${p.x},${p.y})`}
            style={{ opacity: booted ? 1 : 0, transition: `opacity .8s ease ${0.2 + n.tier * 0.18 + i * 0.03}s` }}
          >
            <rect
              x={-w / 2}
              y={-15}
              width={w}
              height={30}
              rx={3}
              fill="#0b0b0b"
              stroke={lit ? "#3DF2A6" : "#2c2c2c"}
              strokeOpacity={lit ? 0.4 + p.near * 0.6 : 1}
            />
            {n.id === "dep" ? <circle cx={-w / 2 + 12} cy={0} r={3} fill="#3DF2A6" className="animate-pulseDot" /> : null}
            <text
              x={n.id === "dep" ? 6 : 0}
              y={4}
              textAnchor="middle"
              fontSize="10.5"
              letterSpacing="1.6"
              className="font-mono"
              fill={lit ? "#F5F5F5" : "#8A8A8A"}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
