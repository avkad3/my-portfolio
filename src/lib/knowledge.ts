/**
 * Portfolio knowledge base + a small, dependency-free retrieval pipeline.
 *
 * Used by /api/ask (the ASK ADITYA assistant) and the RAG visualizer in the Lab.
 * Answers are composed ONLY from the documents below, which are generated from
 * the structured data files — nothing is hand-written here.
 */
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { publications } from "@/data/publications";
import { stack } from "@/data/skills";

export type Doc = { id: string; title: string; text: string; href: string; kind: string };

export function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  docs.push({
    id: "profile",
    kind: "profile",
    title: profile.name,
    href: "/#about",
    text: `${profile.name} is an ${profile.roles.join(", ")} based in ${profile.location}. ${profile.summary} Focus areas: ${profile.focus.join(", ")}.`,
  });
  docs.push({
    id: "education",
    kind: "education",
    title: "Education",
    href: "/#about",
    text: `${profile.education.degree} (${profile.education.specialization}) at ${profile.education.school}, ${profile.education.period}. Certifications: ${profile.certifications.join("; ")}.`,
  });
  docs.push({
    id: "contact",
    kind: "contact",
    title: "Contact",
    href: "/#contact",
    text: `Email ${profile.email}. GitHub ${profile.links.github}. LinkedIn ${profile.links.linkedin}. Location ${profile.location}. Hire, reach out, get in touch.`,
  });
  for (const role of experience) {
    docs.push({
      id: `exp-${role.company}`,
      kind: "experience",
      title: `${role.role} — ${role.company}`,
      href: "/#experience",
      text: `${role.role} at ${role.company}, ${role.period}. ${role.summary} ${role.workstreams
        .map((w) => `${w.title}: ${w.points.join("; ")}${w.metric ? `; ${w.metric.value} ${w.metric.label}` : ""}. Stack: ${w.stack.join(", ")}.`)
        .join(" ")}`,
    });
  }
  for (const p of projects) {
    docs.push({
      id: `proj-${p.slug}`,
      kind: "project",
      title: p.name,
      href: p.caseStudy || p.private ? `/projects/${p.slug}` : "/#work",
      text: `${p.name}. ${p.tagline} ${p.badge ? `${p.badge}. ` : ""}${p.private ? "Private repository, in production. " : ""}Features: ${p.features.join("; ")}. ${
        p.stack.length ? `Built with ${p.stack.join(", ")}.` : ""
      } ${p.metric ? `Result: ${p.metric.value} ${p.metric.label}.` : ""} ${p.caseStudy?.problem ?? ""}`,
    });
  }
  for (const pub of publications) {
    docs.push({
      id: `pub-${pub.id}`,
      kind: "publication",
      title: `${pub.title.join(" ")} (${pub.venue})`,
      href: "/#publications",
      text: `Publication: ${pub.title.join(" ")} published on ${pub.venue}. ${pub.identifier.label} ${pub.identifier.value}. ${pub.abstract}`,
    });
  }
  for (const cat of stack) {
    docs.push({
      id: `stack-${cat.id}`,
      kind: "stack",
      title: `Stack — ${cat.label}`,
      href: "/#stack",
      text: `${cat.label} technologies and skills: ${cat.items.join(", ")}.`,
    });
  }
  return docs;
}

// ── retrieval ────────────────────────────────────────────────────────────────

const STOP = new Set(
  "a an the of and or to in on for with by is are was were be has have had what which who whom how does did do aditya aditya's his he him me tell about show any project projects built build use used uses using that this from at as it its can".split(
    " ",
  ),
);

/** Query-side expansion so natural phrasing reaches the right documents. */
const SYNONYMS: Record<string, string[]> = {
  vision: ["opencv", "ascii", "image", "webcam"],
  cv: ["opencv", "image"],
  llm: ["rag", "langchain", "openai", "genai"],
  genai: ["rag", "langchain", "llm"],
  backend: ["fastapi", "sqlalchemy", "api", "postgresql", "websockets"],
  api: ["fastapi", "rest"],
  forecasting: ["tft", "lightgbm", "demand"],
  forecast: ["tft", "lightgbm", "demand"],
  research: ["publication", "zenodo", "published"],
  paper: ["publication", "zenodo"],
  hire: ["contact", "email"],
  email: ["contact"],
  college: ["education", "pillai"],
  degree: ["education"],
  study: ["education"],
  internship: ["intern", "savic", "experience"],
  work: ["experience", "intern"],
  rl: ["reinforcement", "ppo", "gymnasium"],
  reinforcement: ["ppo", "gymnasium", "orbital"],
  go: ["golang", "contextmesh"],
  graph: ["networkx", "dependency", "d3"],
  vector: ["chromadb", "faiss", "rag"],
};

export const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\- ]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t));

export type Retrieved = { doc: Doc; score: number };

export function retrieve(query: string, docs: Doc[], k = 4) {
  const base = tokenize(query);
  const terms = Array.from(new Set(base.flatMap((t) => [t, ...(SYNONYMS[t] ?? [])])));
  const docTokens = docs.map((d) => tokenize(`${d.title} ${d.title} ${d.text}`));
  const avg = docTokens.reduce((a, t) => a + t.length, 0) / docTokens.length;
  const df = new Map<string, number>();
  for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  const N = docs.length;
  const k1 = 1.4;
  const b = 0.72;

  const scored: Retrieved[] = docs.map((doc, i) => {
    const toks = docTokens[i];
    let score = 0;
    for (const term of terms) {
      const tf = toks.filter((t) => t === term || (term.length > 3 && t.startsWith(term))).length;
      if (!tf) continue;
      const n = df.get(term) ?? 1;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      const weight = base.includes(term) ? 1 : 0.55;
      score += weight * idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * toks.length) / avg)));
    }
    return { doc, score };
  });

  return { terms, ranked: scored.filter((r) => r.score > 0).sort((a, z) => z.score - a.score).slice(0, k) };
}

/** Rerank: favour documents whose kind matches the question's intent. */
export function rerank(query: string, hits: Retrieved[]) {
  const q = query.toLowerCase();
  const boost = (kind: string) =>
    (/(project|built|build|system)/.test(q) && kind === "project" ? 1.25 : 1) *
    (/(intern|experience|work|savic|company|job)/.test(q) && kind === "experience" ? 1.35 : 1) *
    (/(publish|paper|research|doi|pypi)/.test(q) && kind === "publication" ? 1.35 : 1) *
    (/(stack|technolog|skills|tools|languages)/.test(q) && kind === "stack" ? 1.4 : 1) *
    (/(contact|email|hire|reach)/.test(q) && kind === "contact" ? 2 : 1) *
    (/(educat|college|degree|study|university)/.test(q) && kind === "education" ? 2 : 1);
  return hits.map((h) => ({ ...h, score: h.score * boost(h.doc.kind) })).sort((a, z) => z.score - a.score);
}

/** Deterministic hashed bag-of-words vector — a visual stand-in for an embedding. */
export function hashVector(text: string, dims = 32) {
  const v = new Array(dims).fill(0);
  for (const t of tokenize(text)) {
    let h = 2166136261;
    for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
    v[Math.abs(h) % dims] += (h & 1 ? 1 : -1) * (0.6 + (Math.abs(h >> 8) % 40) / 100);
  }
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

// ── answer composition (extractive, grounded) ─────────────────────────────────

const ALL_TECH = Array.from(new Set([...stack.flatMap((c) => c.items), ...projects.flatMap((p) => p.stack)]));
const TECH_ALIASES: Record<string, string> = {
  "computer vision": "OpenCV",
  "vector database": "ChromaDB",
  pytorch: "PyTorch Forecasting",
  golang: "Go",
  "reinforcement learning": "Stable Baselines3",
};

function techIn(query: string) {
  const q = ` ${query.toLowerCase().replace(/[?!,]/g, " ")} `;
  for (const [alias, tech] of Object.entries(TECH_ALIASES)) if (q.includes(alias)) return tech;
  return ALL_TECH.filter((t) => t.length > 1)
    .sort((a, b) => b.length - a.length)
    .find((t) => q.includes(` ${t.toLowerCase()} `));
}

export type Answer = {
  answer: string;
  sources: { title: string; href: string }[];
  trace: { terms: string[]; retrieved: { id: string; title: string; score: number }[] };
};

export function answerQuestion(query: string): Answer {
  const docs = buildDocs();
  const { terms, ranked } = retrieve(query, docs, 6);
  const hits = rerank(query, ranked).slice(0, 4);
  const trace = { terms, retrieved: hits.map((h) => ({ id: h.doc.id, title: h.doc.title, score: +h.score.toFixed(3) })) };
  const q = query.toLowerCase();
  const src = (d: Doc) => ({ title: d.title, href: d.href });

  // 1. A project named explicitly → structured summary.
  const named = projects.find((p) => q.includes(p.name.toLowerCase()) || q.includes(p.slug.replace(/-/g, " ")) || (p.slug === "rcae-reservations" && /rcae/.test(q)));
  if (named) {
    const lines = [
      `${named.name}${named.badge ? ` (${named.badge})` : ""} — ${named.tagline}`,
      "",
      ...named.features.slice(0, 5).map((f) => `• ${f}`),
      named.stack.length ? `\nBuilt with ${named.stack.join(", ")}.` : "",
      named.metric ? `Result: ${named.metric.value} ${named.metric.label}.` : "",
      named.private ? "The repository is private, so implementation details aren't public." : "",
    ].filter((l, i) => l !== "" || i === 1);
    return {
      answer: lines.join("\n").trim(),
      sources: [{ title: named.name, href: named.caseStudy || named.private ? `/projects/${named.slug}` : "/#work" }],
      trace,
    };
  }

  // 2. "Which projects use X?"
  const tech = techIn(query);
  if (tech && !/(savic|intern)/.test(q)) {
    const t = tech.toLowerCase();
    const mentions = (f: string) => ` ${f.toLowerCase().replace(/[,;:()]/g, " ")} `.includes(` ${t} `);
    const used = projects.filter((p) => p.stack.some((s) => s.toLowerCase() === t));
    const related = projects.filter((p) => !used.includes(p) && p.features.some(mentions));
    if (used.length || related.length) {
      const line = (p: (typeof projects)[number]) => `• ${p.name} — ${p.tagline}${p.metric ? ` (${p.metric.value} ${p.metric.label})` : ""}`;
      const parts = [
        used.length ? `${tech} is in the stack of ${used.length === 1 ? "one project" : `${used.length} projects`}:\n\n${used.map(line).join("\n")}` : "",
        related.length ? `${used.length ? "Also related" : `${tech} appears in`}:\n\n${related.map(line).join("\n")}` : "",
      ].filter(Boolean);
      return {
        answer: parts.join("\n\n"),
        sources: [...used, ...related].slice(0, 4).map((p) => ({ title: p.name, href: p.caseStudy ? `/projects/${p.slug}` : "/#work" })),
        trace,
      };
    }
    const cat = stack.find((c) => c.items.includes(tech));
    if (cat) {
      return {
        answer: `${tech} is part of Aditya's ${cat.label} toolkit. The portfolio doesn't attribute it to a specific project, so I won't guess one.`,
        sources: [{ title: "STACK.EXE", href: "/#stack" }],
        trace,
      };
    }
  }

  // 3. Intent shortcuts with structured answers.
  if (/(educat|college|degree|study|studied|university)/.test(q)) {
    return {
      answer: `${profile.education.degree} (${profile.education.specialization})\n${profile.education.school}, ${profile.education.period}\n\nCertifications:\n${profile.certifications.map((c) => `• ${c}`).join("\n")}`,
      sources: [{ title: "WHO_AM_I()", href: "/#about" }],
      trace,
    };
  }
  if (/(technolog|stack|skills|tools|languages)/.test(q)) {
    return {
      answer: stack.map((c) => `${c.label}: ${c.items.join(", ")}`).join("\n"),
      sources: [{ title: "STACK.EXE", href: "/#stack" }],
      trace,
    };
  }
  if (/(savic|intern|experience|worked|companies)/.test(q)) {
    const roles = /savic/.test(q) ? experience.filter((r) => r.company.includes("SAVIC")) : experience;
    return {
      answer: roles
        .map(
          (r) =>
            `${r.company} — ${r.role} (${r.period})\n${r.workstreams
              .map((w) => `• ${w.title}${w.metric ? ` — ${w.metric.value} ${w.metric.label}` : ""}`)
              .join("\n")}`,
        )
        .join("\n\n"),
      sources: [{ title: "Experience", href: "/#experience" }],
      trace,
    };
  }
  if (/(publish|publication|paper|zenodo|doi|research)/.test(q)) {
    return {
      answer: publications.map((p) => `• ${p.title.join(" ")} — ${p.venue} (${p.identifier.label}: ${p.identifier.value})`).join("\n"),
      sources: [{ title: "Publications", href: "/#publications" }],
      trace,
    };
  }
  if (/(contact|email|hire|reach|linkedin)/.test(q)) {
    return {
      answer: `Email: ${profile.email}\nGitHub: github.com/${profile.links.githubHandle}\nLinkedIn: ${profile.links.linkedin.replace("https://www.", "")}\nBased in ${profile.location}.`,
      sources: [{ title: "Contact", href: "/#contact" }],
      trace,
    };
  }
  if (/(backend)/.test(q)) {
    const be = projects.filter((p) => p.stack.includes("FastAPI") || p.stack.includes("Go"));
    return {
      answer: `Backend engineering shows most clearly in:\n\n${be
        .slice(0, 5)
        .map((p) => `• ${p.name} — ${p.stack.filter((s) => ["FastAPI", "Go", "SQLAlchemy", "Alembic", "JWT", "PostgreSQL", "Redis", "WebSockets", "SQLite"].includes(s)).join(", ")}`)
        .join("\n")}\n\nThe Mini Order Fulfillment System is the most complete example: role-based JWT auth, SQLAlchemy + Alembic, document parsing and an approval state machine.`,
      sources: be.slice(0, 4).map((p) => ({ title: p.name, href: p.caseStudy ? `/projects/${p.slug}` : "/#work" })),
      trace,
    };
  }

  // 4. Fallback: extractive answer from the top retrieved documents.
  if (!hits.length || hits[0].score < 0.8) {
    return {
      answer:
        "I can only answer from Aditya's portfolio, and I couldn't find anything on that. Try asking about his projects, SAVIC internship, publications, or the technologies he uses.",
      sources: [],
      trace,
    };
  }
  const top = hits.slice(0, 2);
  return {
    answer: top.map((h) => `${h.doc.title}\n${firstSentences(h.doc.text, 3)}`).join("\n\n"),
    sources: top.map((h) => src(h.doc)),
    trace,
  };
}

function firstSentences(text: string, n: number) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).slice(0, n).join(" ").trim();
}
