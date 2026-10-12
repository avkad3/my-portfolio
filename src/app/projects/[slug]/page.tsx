import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseNav } from "@/components/projects/case-nav";
import { CaseVisual } from "@/components/projects/case-visual";
import { CopyCommand, ProjectLinks } from "@/components/projects/work";
import { caseStudies, getProject } from "@/data/projects";

export const dynamicParams = false;

/** Case studies with an interactive centrepiece (see CaseVisual). */
const INTERACTIVE = new Set(["pycodeatlas", "cmpis", "mini-order-fulfillment", "rcae-reservations", "ascii-lab"]);

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.tagline,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: `${p.name} — Aditya Vijay Kumar`, description: p.tagline, url: `/projects/${p.slug}` },
  };
}

function Block({ id, n, label, children }: { id: string; n: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-14 md:py-20">
      <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
        <span className="text-accent">{n}</span>
        <span className="text-muted">{label}</span>
      </div>
      {children}
    </section>
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const idx = caseStudies.findIndex((c) => c.slug === p.slug);
  const next = caseStudies[(idx + 1) % caseStudies.length];
  const cs = p.caseStudy;

  const steps = cs
    ? [
        { id: "problem", label: "Problem" },
        { id: "approach", label: "Approach" },
        { id: "architecture", label: "Architecture" },
        { id: "implementation", label: "Implementation" },
        { id: "result", label: "Result" },
        { id: "technology", label: "Technology" },
      ]
    : [];

  return (
    <article className="pt-16">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-line">
        <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_70%)]" aria-hidden />
        <div className="container-os relative py-14 md:py-24">
          <Link href="/#work" className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg">
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" /> All systems
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            <span className="text-accent">CASE {String(idx + 1).padStart(3, "0")}</span>
            <span className="h-px w-8 bg-line-strong" />
            <span>{p.badge ?? p.status}</span>
          </div>
          <h1 className="mt-6 text-giant font-medium">
            {p.title.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h1>
          <div className="mt-10 grid gap-10 md:grid-cols-12">
            <p className="text-xl leading-snug text-fg/85 md:col-span-7 md:text-2xl">{p.tagline}</p>
            <div className="flex flex-col gap-6 md:col-span-5">
              {p.metric ? (
                <div className="flex items-baseline gap-3 border-y border-line py-4">
                  <span className="text-5xl font-medium tracking-tight text-accent">{p.metric.value}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{p.metric.label}</span>
                </div>
              ) : null}
              {p.slug === "pycodeatlas" ? <CopyCommand cmd="pip install pycodeatlas" /> : null}
              <ProjectLinks p={{ ...p, caseStudy: undefined }} />
            </div>
          </div>
        </div>
      </header>

      {p.private || !cs ? (
        <div className="container-os py-20">
          <div className="panel max-w-2xl p-8 font-mono text-[13px]">
            <div className="flex items-center gap-2 text-accent">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" /> STATUS · IN PRODUCTION
            </div>
            <div className="mt-3 flex items-center gap-2 text-fg">
              <Lock size={13} /> REPOSITORY · PRIVATE
            </div>
            <p className="mt-6 font-sans text-base leading-relaxed text-muted">
              {p.tagline} The codebase and implementation details are confidential, so this case study is intentionally brief. Happy to discuss the engineering in conversation.
            </p>
            <Link href="/#contact" className="btn-ghost mt-8">
              Get in touch <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="container-os grid gap-10 lg:grid-cols-12">
          <aside className="pt-20 lg:col-span-3">
            <CaseNav steps={steps} />
          </aside>
          <div className="lg:col-span-9">
            <Block id="problem" n="01" label="Problem">
              <p className="max-w-3xl text-2xl leading-snug text-fg md:text-[1.9rem]">{cs.problem}</p>
            </Block>

            <Block id="approach" n="02" label="Approach">
              <ol className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
                {cs.approach.map((a, i) => (
                  <li key={a} className="bg-bg p-6">
                    <div className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</div>
                    <p className="mt-3 leading-relaxed text-fg/85">{a}</p>
                  </li>
                ))}
              </ol>
            </Block>

            <Block id="architecture" n="03" label="Architecture">
              <div className="panel overflow-x-auto p-6">
                <pre className="code w-max min-w-full text-[12px] text-fg/80 md:text-[13px]">{cs.architecture}</pre>
              </div>
              {INTERACTIVE.has(p.slug) ? (
                <div className="mt-8">
                  <div className="label mb-4 text-[10px]">Interactive</div>
                  <CaseVisual slug={p.slug} />
                </div>
              ) : null}
            </Block>

            <Block id="implementation" n="04" label="Implementation">
              <ul className="max-w-3xl space-y-4">
                {cs.implementation.map((it) => (
                  <li key={it} className="flex gap-4 text-lg leading-relaxed text-fg/85">
                    <span className="mt-[14px] h-px w-4 shrink-0 bg-accent" />
                    {it}
                  </li>
                ))}
              </ul>
              {cs.code ? (
                <div className="panel mt-10 overflow-hidden">
                  <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">{cs.code.label}</div>
                  <pre className="code p-5">{cs.code.body}</pre>
                </div>
              ) : null}
              {cs.decisions?.length ? (
                <div className="mt-12">
                  <h3 className="label mb-5">Engineering decisions</h3>
                  <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
                    {cs.decisions.map((d) => (
                      <div key={d.title} className="bg-bg p-6">
                        <h4 className="font-medium">{d.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{d.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Block>

            <Block id="result" n="05" label="Result">
              <ul className="space-y-3">
                {cs.result.map((r) => (
                  <li key={r} className="flex gap-4 text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                    <span className="text-accent">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Block>

            <Block id="technology" n="06" label="Technology">
              <ul className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-full border border-line px-4 py-2 font-mono text-[12px] text-fg/85">
                    {s}
                  </li>
                ))}
              </ul>
            </Block>
          </div>
        </div>
      )}

      <Link href={`/projects/${next.slug}`} className="group block border-t border-line">
        <div className="container-os flex items-end justify-between gap-6 py-14 md:py-20">
          <div>
            <div className="label">Next system</div>
            <div className="mt-4 text-huge font-medium transition-colors group-hover:text-accent">{next.name}</div>
          </div>
          <ArrowRight size={36} className="mb-2 shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
        </div>
      </Link>
    </article>
  );
}
