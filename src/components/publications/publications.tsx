"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { trackGlow } from "@/components/ui/glow";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { publications } from "@/data/publications";

function CopyId({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded border border-line px-2.5 py-1.5 font-mono text-[12px] text-fg transition-colors hover:border-line-strong"
      aria-label={`Copy ${value}`}
    >
      {value}
      {ok ? <Check size={12} className="text-accent" /> : <Copy size={12} className="text-dim" />}
    </button>
  );
}

export function Publications() {
  return (
    <section id="publications" className="py-24 md:py-36" aria-label="Publications">
      <div className="container-os">
        <SectionHeader index="06" kicker="Published" title={["PUBLICATIONS."]} />
        <div className="border-t border-line">
          {publications.map((p, i) => (
            <Reveal key={p.id}>
              <article onPointerMove={trackGlow} className="glow grid gap-8 border-b border-line py-12 md:grid-cols-12 md:py-16">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] md:col-span-3">
                  <div className="text-accent">[{String(i + 1).padStart(2, "0")}]</div>
                  <div className="mt-3 text-fg">{p.venue}</div>
                  <div className="mt-1 text-dim">{p.kind}</div>
                </div>
                <div className="md:col-span-9">
                  <h3 className="text-[clamp(1.9rem,4.2vw,3.6rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                    <RevealLines lines={p.title} />
                  </h3>
                  <p className="mt-6 max-w-2xl leading-relaxed text-muted">{p.abstract}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{p.identifier.label}</span>
                      <CopyId value={p.identifier.value} />
                    </div>
                    <a href={p.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em]">
                      <span className="link-u">Open on {p.venue.split(" ")[0]}</span>
                      <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <Link href={`/projects/${p.project}`} className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg">
                      <span className="link-u">Case study</span>
                    </Link>
                  </div>
                  {p.cite ? <p className="mt-6 border-l border-line pl-4 font-mono text-[11px] leading-relaxed text-dim">{p.cite}</p> : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
