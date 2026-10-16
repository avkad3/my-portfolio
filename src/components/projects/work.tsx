"use client";

import { ArrowUpRight, Check, Copy, Lock } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { trackGlow } from "@/components/ui/glow";
import { Reveal, RevealLines } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getProject, projects, type Project } from "@/data/projects";
import { cn } from "@/lib/cn";
import { AsciiPreview } from "./ascii-preview";
import { FingerprintDemo } from "./fingerprint-demo";
import { OrderFlow } from "./order-flow";
import { Screenshot } from "./screenshot";

const Loading = ({ h }: { h: string }) => <div className={cn("panel dot-bg grid place-items-center font-mono text-[11px] text-dim", h)}>booting visualization…</div>;
const SystemMap = dynamic(() => import("./system-map"), { ssr: false, loading: () => <Loading h="h-[560px]" /> });
const DependencyGraph = dynamic(() => import("./dependency-graph"), { ssr: false, loading: () => <Loading h="h-[540px]" /> });
const PriceChart = dynamic(() => import("./price-chart"), { ssr: false, loading: () => <Loading h="h-[420px]" /> });

export function CopyCommand({ cmd }: { cmd: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(cmd);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className="group flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 font-mono text-[13px] transition-colors hover:border-line-strong"
      aria-label={`Copy command: ${cmd}`}
    >
      <span className="text-accent">$</span>
      <span>{cmd}</span>
      <span className="ml-2 text-dim group-hover:text-fg">{done ? <Check size={14} className="text-accent" /> : <Copy size={14} />}</span>
    </button>
  );
}

export function ProjectLinks({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em]">
      {p.caseStudy ? (
        <Link href={`/projects/${p.slug}`} className="group flex items-center gap-1.5 text-fg">
          <span className="link-u">Case study</span>
          <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
      {p.links.github ? (
        <a href={p.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted hover:text-fg">
          <GitHubIcon width={12} height={12} /> <span className="link-u">Source</span>
        </a>
      ) : null}
      {p.links.pypi ? (
        <a href={p.links.pypi} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted hover:text-fg">
          <span className="link-u">PyPI</span> <ArrowUpRight size={12} />
        </a>
      ) : null}
      {p.links.live ? (
        <a href={p.links.live} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted hover:text-fg">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" /> <span className="link-u">Live demo</span>
        </a>
      ) : null}
      {p.links.doi ? (
        <a href={p.links.doi} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted hover:text-fg">
          <span className="link-u">DOI</span> <ArrowUpRight size={12} />
        </a>
      ) : null}
    </div>
  );
}

function Stack({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {items.map((s) => (
        <li key={s} className="rounded border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
          {s}
        </li>
      ))}
    </ul>
  );
}

function Chapter({ n, p, visual, reverse }: { n: string; p: Project; visual: ReactNode; reverse?: boolean }) {
  return (
    <article className="grid gap-10 border-t border-line py-16 md:py-24 lg:grid-cols-12 lg:gap-14" aria-labelledby={`p-${p.slug}`}>
      <div className={cn("min-w-0 lg:col-span-5", reverse && "lg:order-2")}>
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted">
          <span className="text-accent">{n}</span>
          <span className="h-px w-8 bg-line-strong" />
          <span className="uppercase">{p.badge ?? p.status}</span>
        </div>
        <h3 id={`p-${p.slug}`} className="mt-6 text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
          <RevealLines lines={p.title} />
        </h3>
        <Reveal>
          <p className="mt-6 text-lg leading-relaxed text-fg/80">{p.tagline}</p>
          <ul className="mt-6 grid gap-x-6 gap-y-2 text-sm text-muted sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-[9px] h-px w-2.5 shrink-0 bg-accent" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Stack items={p.stack} />
          </div>
          <div className="mt-8">
            <ProjectLinks p={p} />
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1} className={cn("min-w-0 lg:col-span-7", reverse && "lg:order-1")}>
        {visual}
      </Reveal>
    </article>
  );
}

export function Work() {
  const atlas = getProject("pycodeatlas")!;
  const cmpis = getProject("cmpis")!;
  const ascii = getProject("ascii-lab")!;
  const mofs = getProject("mini-order-fulfillment")!;
  const vault = getProject("buildvault-ai")!;
  const gmci = getProject("maps-competitor-intelligence")!;
  const omni = getProject("omnilang")!;
  const netpulse = getProject("netpulse")!;
  const more = [getProject("maharashtra-election")!, getProject("loan-eligibility")!, getProject("waste-classifier")!];
  const savic = projects.filter((p) => p.kind === "savic");

  return (
    <section id="work" className="py-24 md:py-36" aria-label="Projects">
      <div className="container-os">
        <SectionHeader
          index="03"
          kicker="Work"
          title={["SYSTEMS", "I'VE BUILT."]}
          aside={<p className="max-w-xl text-muted">Every project is a node; every shared technology is an edge. Hover to trace connections, click a system to inspect it.</p>}
        />

        <div className="hidden md:block">
          <SystemMap />
        </div>
        <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:hidden">
          {projects
            .map((p) => (
              <li key={p.slug} className="bg-bg">
                <Link href={p.caseStudy || p.private ? `/projects/${p.slug}` : "#work"} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{p.badge ?? p.status}</div>
                  </div>
                  {p.private ? <Lock size={14} className="text-dim" /> : <ArrowUpRight size={16} className="text-dim" />}
                </Link>
              </li>
            ))}
        </ul>

        {/* Flagship */}
        <article className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-24" aria-labelledby="p-pycodeatlas">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted">
                <span className="text-accent">001</span>
                <span className="h-px w-8 bg-line-strong" />
                <span>FLAGSHIP · {atlas.badge?.toUpperCase()}</span>
              </div>
              <h3 id="p-pycodeatlas" className="mt-6 text-giant font-medium">
                <RevealLines lines={atlas.title} />
              </h3>
            </div>
            <Reveal className="flex flex-col justify-end gap-6 lg:col-span-5">
              <p className="text-xl leading-snug text-fg/85">
                Static analysis CLI that builds a code dependency graph, classifies dead code as <span className="text-[#FF5C5C]">unused</span>,{" "}
                <span className="text-warn">test-only</span> or <span className="text-[#C08AFF]">uncovered</span>, and shows what breaks if you delete a function or module.
              </p>
              <CopyCommand cmd="pip install pycodeatlas" />
              <ProjectLinks p={atlas} />
            </Reveal>
          </div>

          <div className="mt-12">
            <DependencyGraph />
          </div>

          <div className="mt-px grid grid-cols-2 gap-px overflow-hidden rounded-b-md border-x border-b border-line bg-line md:grid-cols-4">
            {atlas.features.map((f, i) => (
              <div key={f} onPointerMove={trackGlow} className="glow bg-bg p-5">
                <div className="font-mono text-[10px] text-dim">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-sm leading-snug text-fg/85">{f}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Stack items={atlas.stack} />
          </div>
        </article>

        <div className="mt-24">
          <Chapter n="002" p={cmpis} visual={<PriceChart />} />
          <Chapter
            n="003"
            p={ascii}
            reverse
            visual={
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[11px] text-muted">
                  <span>render: density · {`" .,-~:;=!*#$@"`}</span>
                  <a href="#lab" className="text-accent hover:underline">
                    try it with your image ↓
                  </a>
                </div>
                <div className="grid min-h-[340px] place-items-center bg-black p-4">
                  <AsciiPreview />
                </div>
              </div>
            }
          />
          <Chapter n="004" p={mofs} visual={<OrderFlow />} />
          <Chapter n="005" p={gmci} reverse visual={<FingerprintDemo />} />
          <Chapter
            n="006"
            p={omni}
            visual={
              <div className="space-y-4">
                <div className="panel overflow-hidden">
                  <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">{omni.caseStudy?.code?.label}</div>
                  <pre className="code overflow-x-auto p-5">{omni.caseStudy?.code?.body}</pre>
                </div>
                <Screenshot shot={omni.screenshot!} label="kernel panic screen · Hindi" />
              </div>
            }
          />
          <Chapter n="007" p={netpulse} reverse visual={<Screenshot shot={netpulse.screenshot!} label="netpulse · live dashboard" />} />

          {/* More shipped systems */}
          <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
            {more.map((p, i) => (
              <article key={p.slug} onPointerMove={trackGlow} className="glow flex flex-col bg-bg p-6 md:p-8" aria-labelledby={`p-${p.slug}`}>
                <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted">
                  <span className="text-accent">{String(8 + i).padStart(3, "0")}</span>
                  <span className="h-px w-8 bg-line-strong" />
                  <span className="uppercase">{p.status}</span>
                </div>
                <h3 id={`p-${p.slug}`} className="mt-5 text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-[0.95] tracking-[-0.03em]">
                  {p.title.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </h3>
                <p className="mt-4 leading-relaxed text-fg/80">{p.tagline}</p>
                <ul className="mt-5 space-y-1.5 text-sm text-muted">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-[9px] h-px w-2.5 shrink-0 bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Stack items={p.stack} />
                </div>
                <div className="mt-auto pt-8">
                  <ProjectLinks p={p} />
                </div>
              </article>
            ))}
          </div>

          {/* BuildVault — private */}
          <article className="mt-16 grid gap-10 border-t border-line py-16 md:mt-24 md:py-24 lg:grid-cols-12 lg:gap-14" aria-labelledby="p-buildvault-ai">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted">
                <span className="text-accent">011</span>
                <span className="h-px w-8 bg-line-strong" />
                <span>PRIVATE · IN PRODUCTION</span>
              </div>
              <h3 id="p-buildvault-ai" className="mt-6 text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                <RevealLines lines={["BUILDVAULT-AI"]} />
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-fg/80">{vault.tagline}</p>
            </div>
            <Reveal delay={0.1} className="lg:col-span-7">
              <div className="panel relative overflow-hidden p-6 font-mono text-[12px] md:p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-dim">STATUS</div>
                    <div className="mt-2 flex items-center gap-2 text-accent">
                      <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" /> IN PRODUCTION
                    </div>
                  </div>
                  <div>
                    <div className="text-dim">REPOSITORY</div>
                    <div className="mt-2 flex items-center gap-2 text-fg">
                      <Lock size={12} /> PRIVATE
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-2.5" aria-hidden>
                  {[82, 64, 91, 47, 73].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-dim">{String(i + 1).padStart(2, "0")}</span>
                      <span className="h-2.5 rounded-sm bg-[repeating-linear-gradient(90deg,#1d1d1d_0_6px,#151515_6px_12px)]" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
                <p className="mt-8 text-dim">In production use by a customer. Implementation details are confidential; happy to walk through it in conversation.</p>
              </div>
            </Reveal>
          </article>
        </div>

        {/* SAVIC systems */}
        <div className="border-t border-line pt-16 md:pt-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h3 className="text-2xl font-medium tracking-tight md:text-3xl">Built at SAVIC Technologies</h3>
            <span className="label">Internship · 2026</span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
            {savic.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} onPointerMove={trackGlow} className="glow group flex flex-col bg-bg p-6 md:p-8">
                <div className="flex items-start justify-between">
                  <span className="text-5xl font-medium tracking-tight text-accent">{p.metric?.value}</span>
                  <ArrowUpRight size={16} className="text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{p.metric?.label}</div>
                <h4 className="mt-8 text-xl font-medium">{p.name}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.tagline}</p>
                <div className="mt-auto pt-6">
                  <Stack items={p.stack} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
