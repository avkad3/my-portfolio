"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { answerQuestion, buildDocs, hashVector, rerank, retrieve } from "@/lib/knowledge";
import { cn } from "@/lib/cn";

const STAGES = ["Query", "Embedding", "Vector search", "Retrieved", "Reranking", "LLM", "Answer"] as const;
const PRESETS = ["Which project uses RAG?", "What did Aditya build at SAVIC?", "computer vision project", "Where is Aditya published?"];

/**
 * Runs the portfolio's real retrieval pipeline (lib/knowledge) step by step.
 * The "embedding" is a hashed bag-of-words vector, labelled as such.
 */
export function RagVisualizer() {
  const docs = useMemo(buildDocs, []);
  const reduce = useReducedMotion();
  const [q, setQ] = useState(PRESETS[0]);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<null | {
    vec: number[];
    terms: string[];
    retrieved: { id: string; title: string; score: number }[];
    reranked: { id: string; title: string; score: number }[];
    answer: string;
  }>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-25% 0px" });

  const run = (query = q) => {
    timers.current.forEach(clearTimeout);
    const { terms, ranked } = retrieve(query, docs, 5);
    const rr = rerank(query, ranked);
    setResult({
      vec: hashVector(query),
      terms,
      retrieved: ranked.map((r) => ({ id: r.doc.id, title: r.doc.title, score: r.score })),
      reranked: rr.map((r) => ({ id: r.doc.id, title: r.doc.title, score: r.score })),
      answer: answerQuestion(query).answer,
    });
    if (reduce) return setStage(STAGES.length - 1);
    setStage(0);
    STAGES.forEach((_, i) => timers.current.push(setTimeout(() => setStage(i), i * 650)));
  };

  useEffect(() => {
    if (inView) run();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const maxScore = Math.max(1, ...(result?.reranked.map((r) => r.score) ?? [1]));

  return (
    <div ref={rootRef} className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="flex gap-2"
        >
          <label htmlFor="rag-q" className="sr-only">
            Query
          </label>
          <input
            id="rag-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2.5 font-mono text-[12px] focus:border-accent/50 focus:outline-none"
          />
          <button type="submit" className="grid w-10 place-items-center rounded-md bg-fg text-bg hover:bg-accent" aria-label="Run pipeline">
            <Play size={14} />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              className="chip text-left hover:border-accent/40 hover:text-fg"
              onClick={() => {
                setQ(p);
                run(p);
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <ol className="mt-6 space-y-1 font-mono text-[11px]">
          {STAGES.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-3 rounded px-2 py-1.5 transition-colors", i === stage ? "bg-accent/10 text-accent" : i < stage ? "text-fg" : "text-dim")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", i <= stage ? "bg-accent" : "bg-line-strong")} />
              {String(i + 1).padStart(2, "0")} {s.toUpperCase()}
            </li>
          ))}
        </ol>
      </div>

      <div className="panel dot-bg relative min-h-[460px] overflow-hidden p-5 font-mono text-[12px]" aria-live="polite">
        {!result ? (
          <div className="grid h-full min-h-[420px] place-items-center text-center text-muted">
            <div>
              <div className="text-fg">Pipeline idle.</div>
              <div className="mt-1">Run a query to watch retrieval-augmented generation step by step.</div>
              <button onClick={() => run()} className="btn-ghost mt-6">
                <Play size={12} /> Run
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Stage show={stage >= 0} label="01 · query → tokens">
              <div className="flex flex-wrap gap-1.5">
                {result.terms.map((t) => (
                  <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-fg">
                    {t}
                  </span>
                ))}
              </div>
            </Stage>
            <Stage show={stage >= 1} label="02 · embedding (32-d hashed vector)">
              <div className="flex h-12 items-center gap-[3px]">
                {result.vec.map((v, i) => (
                  <motion.span
                    key={i}
                    className="w-full rounded-sm"
                    style={{ background: v >= 0 ? "#3DF2A6" : "#5AB8FF" }}
                    initial={{ height: 2 }}
                    animate={{ height: Math.max(2, Math.abs(v) * 46) }}
                    transition={{ delay: i * 0.012 }}
                  />
                ))}
              </div>
            </Stage>
            <Stage show={stage >= 2} label={`03 · vector search over ${docs.length} documents`}>
              <div className="flex flex-wrap gap-1">
                {docs.map((d) => {
                  const hit = result.retrieved.some((r) => r.id === d.id);
                  return <span key={d.id} title={d.title} className={cn("h-2.5 w-2.5 rounded-[2px] transition-colors duration-500", hit && stage >= 3 ? "bg-accent" : "bg-line-strong")} />;
                })}
              </div>
            </Stage>
            <Stage show={stage >= 3} label="04 → 05 · retrieved, then reranked by intent">
              <ul className="space-y-1.5">
                {(stage >= 4 ? result.reranked : result.retrieved).map((r, i) => (
                  <motion.li layout key={r.id} className="grid grid-cols-[16px_1fr_80px] items-center gap-3">
                    <span className="text-dim">{i + 1}</span>
                    <span className="truncate text-fg/90">{r.title}</span>
                    <span className="relative h-1.5 rounded-full bg-line">
                      <motion.span className="absolute inset-y-0 left-0 rounded-full bg-accent" animate={{ width: `${(r.score / maxScore) * 100}%` }} />
                    </span>
                  </motion.li>
                ))}
                {!result.retrieved.length ? <li className="text-muted">no documents matched</li> : null}
              </ul>
            </Stage>
            <Stage show={stage >= 5} label="06 · LLM (grounded composer)">
              <div className="text-muted">context: {Math.min(4, result.reranked.length)} docs · rule: answer only from context</div>
            </Stage>
            <Stage show={stage >= 6} label="07 · answer">
              <p className="whitespace-pre-line font-sans text-[14px] leading-relaxed text-fg">{result.answer}</p>
            </Stage>
          </div>
        )}
      </div>
    </div>
  );
}

function Stage({ show, label, children }: { show: boolean; label: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-dim">{label}</div>
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
