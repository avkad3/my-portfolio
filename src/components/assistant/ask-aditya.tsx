"use client";

import { motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; text: string; sources?: { title: string; href: string }[]; mode?: string };

const SUGGESTIONS = [
  "What projects has Aditya built with RAG?",
  "Which project demonstrates backend engineering?",
  "What did Aditya build at SAVIC?",
  "What technologies does Aditya use?",
  "Which project involves computer vision?",
];

const PIPE = ["User", "Next.js UI", "/api/ask", "Knowledge base", "Retrieve + rerank", "LLM (optional)", "Response"];

export function AskAditya() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Ask me anything about Aditya's work. I answer only from this portfolio — no guessing." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pipeStep, setPipeStep] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    const iv = setInterval(() => setPipeStep((s) => Math.min(s + 1, PIPE.length - 2)), 140);
    setPipeStep(0);
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      // Reveal the answer progressively for a natural feel.
      const full: string = data.answer;
      setMsgs((m) => [...m, { role: "assistant", text: "", sources: data.sources, mode: data.mode }]);
      const chunk = Math.max(2, Math.ceil(full.length / 60));
      for (let i = chunk; i <= full.length + chunk; i += chunk) {
        await new Promise((r) => setTimeout(r, 14));
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], text: full.slice(0, i) };
          return copy;
        });
      }
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: `Something went wrong: ${(e as Error).message}` }]);
    } finally {
      clearInterval(iv);
      setPipeStep(PIPE.length - 1);
      setBusy(false);
      setTimeout(() => setPipeStep(-1), 1200);
    }
  };

  return (
    <section id="ask" className="py-24 md:py-36" aria-label="Ask Aditya — portfolio assistant">
      <div className="container-os">
        <SectionHeader
          index="07"
          kicker="Assistant"
          title={["ASK ADITYA."]}
          aside={<p className="max-w-xl text-muted">A retrieval-grounded assistant over this portfolio&apos;s knowledge base. It refuses to answer what isn&apos;t in it.</p>}
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="panel flex h-[560px] flex-col overflow-hidden lg:col-span-8">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 font-mono text-[11px] text-muted">
              <span className="flex items-center gap-2">
                <Sparkles size={13} className="text-accent" /> ask-aditya
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" /> grounded
              </span>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%] rounded-lg px-4 py-3 text-[14px] leading-relaxed", m.role === "user" ? "bg-fg text-bg" : "border border-line bg-raised text-fg/90")}>
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.mode ? <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">via {m.mode}</div> : null}
                    {m.sources?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                        {m.sources.map((s) => (
                          <Link key={s.title + s.href} href={s.href} className="chip py-0.5 hover:border-accent/40 hover:text-accent">
                            ↗ {s.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {busy ? (
                <div className="flex gap-1 px-1" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-accent" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="border-t border-line p-3">
              <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} disabled={busy} className="chip shrink-0 hover:border-accent/40 hover:text-fg disabled:opacity-40">
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="flex items-center gap-2 rounded-md border border-line bg-bg px-3 focus-within:border-line-strong"
              >
                <label htmlFor="ask-input" className="sr-only">
                  Ask a question
                </label>
                <input
                  id="ask-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={300}
                  placeholder="Ask about projects, experience, stack…"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm placeholder:text-dim focus:outline-none"
                />
                <button type="submit" disabled={busy || !input.trim()} className="grid h-8 w-8 place-items-center rounded bg-fg text-bg transition-colors hover:bg-accent disabled:opacity-30" aria-label="Send">
                  <ArrowUp size={15} />
                </button>
              </form>
            </div>
          </div>

          <aside className="panel p-5 font-mono text-[11px] lg:col-span-4">
            <div className="label text-[10px]">Architecture</div>
            <ol className="mt-5">
              {PIPE.map((p, i) => (
                <li key={p} className="flex flex-col items-start">
                  <span
                    className={cn(
                      "rounded border px-3 py-1.5 transition-colors duration-200",
                      pipeStep === i ? "border-accent bg-accent/10 text-accent" : pipeStep > i ? "border-line-strong text-fg" : "border-line text-muted",
                    )}
                  >
                    {p}
                  </span>
                  {i < PIPE.length - 1 ? <span className={cn("ml-4 h-4 w-px", pipeStep > i ? "bg-accent" : "bg-line")} /> : null}
                </li>
              ))}
            </ol>
            <p className="mt-6 leading-relaxed text-dim">
                The Next.js route retrieves from a knowledge base generated from the same data files that render this site. Point <span className="text-muted">ASSISTANT_API_URL</span> at the bundled FastAPI service to add LLM generation; API keys stay server-side.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
