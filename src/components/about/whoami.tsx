"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";
import { profile } from "@/data/profile";
import { stack } from "@/data/skills";

type Entry = { cmd: string; out: string[] };

const RESPONSES: Record<string, () => string[]> = {
  whoami: () => [profile.name, "AI/ML + Backend Engineering"],
  focus: () => [...profile.focus],
  education: () => [profile.education.degree, profile.education.specialization, profile.education.school, profile.education.period],
  certifications: () => [...profile.certifications],
  location: () => [profile.location],
  stack: () => stack.map((c) => `${c.label}: ${c.items.slice(0, 5).join(", ")}${c.items.length > 5 ? ", …" : ""}`),
  contact: () => [profile.email, `github.com/${profile.links.githubHandle}`],
  help: () => [`commands: ${Object.keys(RESPONSES).join(" · ")} · clear`],
};

const SCRIPT = ["whoami", "focus", "education"];

export function WhoAmI() {
  const termRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(termRef, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState("");
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setEntries(SCRIPT.map((c) => ({ cmd: c, out: RESPONSES[c]() })));
      setReady(true);
      return;
    }
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      for (const cmd of SCRIPT) {
        for (let i = 1; i <= cmd.length; i++) {
          if (cancelled) return;
          setTyping(cmd.slice(0, i));
          await wait(55 + Math.random() * 50);
        }
        await wait(220);
        if (cancelled) return;
        setTyping("");
        setEntries((e) => [...e, { cmd, out: RESPONSES[cmd]() }]);
        await wait(420);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [inView, reduce]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [entries, typing, reduce]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") return setEntries([]);
    const fn = RESPONSES[cmd];
    setEntries((e) => [...e, { cmd, out: fn ? fn() : [`command not found: ${cmd} — try "help"`] }]);
  };

  return (
    <section id="about" className="py-24 md:py-36" aria-label="About">
      <div className="container-os">
        <SectionHeader index="01" kicker="Identity" title={["WHO_AM_I()"]} />

        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xl leading-snug text-fg md:text-2xl">{profile.summary}</p>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.14em]">
              <div>
                <dt className="text-dim">Degree</dt>
                <dd className="mt-1.5 normal-case tracking-normal text-fg">
                  {profile.education.degree}
                  <br />
                  <span className="text-muted">{profile.education.specialization}</span>
                </dd>
              </div>
              <div>
                <dt className="text-dim">Institution</dt>
                <dd className="mt-1.5 normal-case tracking-normal text-fg">
                  {profile.education.school}
                  <br />
                  <span className="text-muted">{profile.education.period}</span>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-dim">Certifications</dt>
                <dd className="mt-2 flex flex-wrap gap-2 normal-case tracking-normal">
                  {profile.certifications.map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div ref={termRef} className="panel overflow-hidden" onClick={() => ready && inputRef.current?.focus({ preventScroll: true })}>
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
                </div>
                <span className="font-mono text-[10.5px] text-dim">aditya@os: ~/identity — zsh</span>
                <span className="w-10" />
              </div>
              <div ref={scrollRef} className="h-[400px] overflow-y-auto p-5 font-mono text-[13px] leading-relaxed md:h-[440px]" aria-live="polite">
                {entries.map((e, i) => (
                  <div key={i} className="mb-4">
                    <div>
                      <span className="text-accent">&gt;</span> <span className="text-fg">{e.cmd}</span>
                    </div>
                    <div className="mt-2 border-l border-line pl-4 text-muted">
                      {e.out.map((l, j) => (
                        <div key={j} className={j === 0 ? "text-fg/90" : undefined}>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!ready ? (
                  <div>
                    <span className="text-accent">&gt;</span> <span className="text-fg">{typing}</span>
                    <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(input);
                      setInput("");
                    }}
                    className="flex items-center gap-2"
                  >
                    <label htmlFor="whoami-input" className="text-accent">
                      &gt;
                    </label>
                    <input
                      id="whoami-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 bg-transparent text-fg caret-accent placeholder:text-dim focus:outline-none"
                      placeholder="type a command — try help"
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Terminal command"
                    />
                  </form>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
                {["whoami", "focus", "education", "certifications", "stack", "contact", "clear"].map((c) => (
                  <button key={c} className="chip hover:border-accent/50 hover:text-accent" onClick={() => run(c)} disabled={!ready}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
