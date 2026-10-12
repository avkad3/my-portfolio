"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";
import { RagVisualizer } from "./rag-visualizer";
import { RcaePlayground } from "./rcae-playground";

const AsciiGenerator = dynamic(() => import("./ascii-generator").then((m) => m.AsciiGenerator), { ssr: false });
const DependencyGraph = dynamic(() => import("@/components/projects/dependency-graph"), { ssr: false });

const EXPERIMENTS = [
  { id: "rag", code: "EXP-01", title: "RAG Visualizer", blurb: "Real retrieval over this portfolio's knowledge base — tokens, vector, search, rerank, answer." },
  { id: "ascii", code: "EXP-02", title: "ASCII Generator", blurb: "ASCII Lab's pipeline in your browser: 5 modes, 3 dithering algorithms, colour, webcam." },
  { id: "rcae", code: "EXP-03", title: "RCAE Playground", blurb: "The published Reservation Conflict Anticipation Engine formula — tune the factors, watch the score." },
  { id: "graph", code: "EXP-04", title: "Dependency Graph", blurb: "PyCodeAtlas in miniature: inspect callers, simulate a deletion, see what breaks." },
] as const;

type Id = (typeof EXPERIMENTS)[number]["id"];

export function Lab() {
  const [tab, setTab] = useState<Id>("rag");
  const current = EXPERIMENTS.find((e) => e.id === tab)!;

  return (
    <section id="lab" className="relative py-24 md:py-36" aria-label="Lab">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" aria-hidden />
      <div className="container-os relative">
        <SectionHeader
          index="04"
          kicker="Experiments"
          title={["ADITYA.LAB"]}
          aside={<p className="max-w-xl text-muted">Don&apos;t take the résumé&apos;s word for it. These run live, in your browser.</p>}
        />

        <div role="tablist" aria-label="Experiments" className="grid grid-cols-2 gap-px overflow-hidden rounded-t-md border border-line bg-line lg:grid-cols-4">
          {EXPERIMENTS.map((e) => (
            <button
              key={e.id}
              role="tab"
              id={`tab-${e.id}`}
              aria-selected={tab === e.id}
              aria-controls={`panel-${e.id}`}
              onClick={() => setTab(e.id)}
              className={cn("relative bg-bg p-4 text-left transition-colors md:p-5", tab === e.id ? "bg-surface" : "hover:bg-white/[0.02]")}
            >
              {tab === e.id ? <motion.span layoutId="lab-tab" className="absolute inset-x-0 top-0 h-px bg-accent" /> : null}
              <div className={cn("font-mono text-[10px] tracking-[0.18em]", tab === e.id ? "text-accent" : "text-dim")}>{e.code}</div>
              <div className={cn("mt-2 text-sm font-medium md:text-base", tab === e.id ? "text-fg" : "text-muted")}>{e.title}</div>
            </button>
          ))}
        </div>

        <div className="rounded-b-md border-x border-b border-line bg-bg/60 p-4 backdrop-blur-sm md:p-6">
          <p className="mb-6 max-w-2xl text-sm text-muted">{current.blurb}</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "rag" ? <RagVisualizer /> : tab === "ascii" ? <AsciiGenerator /> : tab === "rcae" ? <RcaePlayground /> : <DependencyGraph compact />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
