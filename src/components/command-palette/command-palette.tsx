"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CornerDownLeft,
  FlaskConical,
  Layers,
  Mail,
  MessageSquare,
  Package,
  Search,
  Terminal,
  User,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { stack } from "@/data/skills";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/cn";

type Item = {
  id: string;
  group: "Navigate" | "Projects" | "Actions" | "Links";
  label: string;
  hint?: string;
  keywords?: string;
  icon: ReactNode;
  run: () => void | "keep";
};

type Line = { kind: "in" | "out" | "ok" | "err"; text: string };

const COMMANDS = ["help", "whoami", "projects", "skills", "experience", "clear", "sudo hire aditya"];

export function CommandPalette({ open, initialQuery, onClose, go }: { open: boolean; initialQuery: string; onClose: () => void; go: (t: string) => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [scope, setScope] = useState<Item["group"] | null>(null);
  const [log, setLog] = useState<Line[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      setQuery(initialQuery);
      setActive(0);
      setScope(null);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      returnFocus.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialQuery]);

  const close = () => onClose();
  const nav = (t: string) => () => {
    close();
    setTimeout(() => go(t), 60);
  };
  const ext = (href: string) => () => {
    window.open(href, href.startsWith("mailto:") ? "_self" : "_blank", "noopener");
    close();
  };

  const items: Item[] = useMemo(
    () => [
      { id: "search-projects", group: "Actions", label: "Search projects", hint: "filter", icon: <Search size={15} />, run: () => { setScope("Projects"); setQuery(""); return "keep"; } },
      { id: "exp", group: "Actions", label: "View experience", icon: <Briefcase size={15} />, run: nav("#experience") },
      { id: "atlas", group: "Actions", label: "Open PyCodeAtlas", hint: "flagship", icon: <Package size={15} />, run: nav("/projects/pycodeatlas") },
      { id: "lab", group: "Actions", label: "Open Lab", icon: <FlaskConical size={15} />, run: nav("#lab") },
      { id: "pubs", group: "Actions", label: "View publications", icon: <BookOpen size={15} />, run: nav("#publications") },
      { id: "ask", group: "Actions", label: "Ask Aditya (AI assistant)", keywords: "chat ai rag question", icon: <MessageSquare size={15} />, run: nav("#ask") },
      { id: "gh", group: "Links", label: "Open GitHub", hint: `@${profile.links.githubHandle}`, icon: <GitHubIcon width={14} height={14} />, run: ext(profile.links.github) },
      { id: "li", group: "Links", label: "Open LinkedIn", icon: <LinkedInIcon width={14} height={14} />, run: ext(profile.links.linkedin) },
      { id: "mail", group: "Links", label: "Send email", hint: profile.email, icon: <Mail size={15} />, run: ext(profile.links.email) },
      { id: "n-work", group: "Navigate", label: "Work — systems I've built", keywords: "projects", icon: <Layers size={15} />, run: nav("#work") },
      { id: "n-stack", group: "Navigate", label: "Stack", keywords: "skills technologies", icon: <Layers size={15} />, run: nav("#stack") },
      { id: "n-about", group: "Navigate", label: "About — whoami()", icon: <User size={15} />, run: nav("#about") },
      { id: "n-contact", group: "Navigate", label: "Contact", icon: <Mail size={15} />, run: nav("#contact") },
      ...projects
        .filter((p) => p.caseStudy || p.private)
        .map<Item>((p) => ({
          id: `p-${p.slug}`,
          group: "Projects",
          label: p.name,
          hint: p.badge ?? p.status,
          keywords: `${p.stack.join(" ")} ${p.tagline}`,
          icon: <ArrowUpRight size={15} />,
          run: nav(`/projects/${p.slug}`),
        })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [go],
  );

  const q = query.trim().toLowerCase();
  const isCommand = COMMANDS.some((c) => c.startsWith(q) && q.length > 1) || q.startsWith("sudo");
  const filtered = items.filter((it) => {
    if (scope && it.group !== scope) return false;
    if (!q) return true;
    const hay = `${it.label} ${it.keywords ?? ""} ${it.hint ?? ""}`.toLowerCase();
    return q.split(/\s+/).every((w) => hay.includes(w));
  });

  useEffect(() => setActive(0), [query, scope]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const exec = (raw: string) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
    const out = (lines: Line[]) => setLog((l): Line[] => [...l, { kind: "in" as const, text: raw }, ...lines].slice(-60));
    switch (cmd) {
      case "help":
        return out([{ kind: "out", text: `available: ${COMMANDS.join(" · ")}` }]);
      case "whoami":
        return out([{ kind: "out", text: `${profile.name} — ${profile.roles.join(" / ")}\n${profile.location}` }]);
      case "projects":
        return out([{ kind: "out", text: projects.filter((p) => p.kind !== "archive").map((p) => `→ ${p.name}`).join("\n") }]);
      case "skills":
        return out([{ kind: "out", text: stack.map((c) => `${c.label.padEnd(12)} ${c.items.slice(0, 6).join(", ")}${c.items.length > 6 ? " …" : ""}`).join("\n") }]);
      case "experience":
        return out([{ kind: "out", text: experience.map((r) => `${r.period.padEnd(30)} ${r.company}`).join("\n") }]);
      case "clear":
        setLog([]);
        return;
      case "sudo hire aditya":
        out([{ kind: "ok", text: "✓ Request accepted.\n\nOpening contact channel..." }]);
        setTimeout(() => nav("#contact")(), 1300);
        return;
      default:
        if (cmd.startsWith("sudo")) return out([{ kind: "err", text: "aditya is not in the sudoers file. Try: sudo hire aditya" }]);
        return out([{ kind: "err", text: `command not found: ${cmd}. Type "help".` }]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (scope) return setScope(null);
      return close();
    }
    if (e.key === "Backspace" && !query && scope) return setScope(null);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const exact = COMMANDS.includes(q) || q.startsWith("sudo") || (!filtered.length && q);
      if (exact) {
        exec(query);
        setQuery("");
        return;
      }
      const it = filtered[active];
      if (it) it.run();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMANDS.find((c) => c.startsWith(q) && q);
      if (match) setQuery(match);
    }
  };

  let idx = -1;
  const groups = (["Actions", "Projects", "Links", "Navigate"] as const).filter((g) => filtered.some((f) => f.group === g));

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[12vh] sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="ADITYA.OS command palette"
            className="relative w-full max-w-[640px] overflow-hidden rounded-xl border border-line-strong bg-[#0c0c0c] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
            initial={{ y: 12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              {isCommand ? <Terminal size={16} className="text-accent" /> : <Search size={16} className="text-muted" />}
              {scope ? <span className="chip border-accent/40 py-0.5 text-accent">{scope}</span> : null}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={scope ? "Filter projects…" : "Search, jump, or type a command (try: help)"}
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg placeholder:text-dim focus:outline-none"
                aria-label="Command"
                aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
                aria-controls="cmd-list"
                role="combobox"
                aria-expanded="true"
                spellCheck={false}
                autoComplete="off"
              />
              <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">ESC</kbd>
            </div>

            {log.length ? (
              <div className="max-h-44 overflow-y-auto border-b border-line bg-black/40 px-4 py-3 font-mono text-[12px] leading-relaxed" aria-live="polite">
                {log.map((l, i) => (
                  <pre
                    key={i}
                    className={cn(
                      "whitespace-pre-wrap",
                      l.kind === "in" && "text-muted before:text-accent before:content-['$_']",
                      l.kind === "out" && "text-fg/85",
                      l.kind === "ok" && "text-accent",
                      l.kind === "err" && "text-danger",
                    )}
                  >
                    {l.text}
                  </pre>
                ))}
              </div>
            ) : null}

            <div ref={listRef} id="cmd-list" role="listbox" className="max-h-[min(52vh,420px)] overflow-y-auto p-2">
              {isCommand && q ? (
                <div className="flex items-center justify-between rounded-md bg-accent/10 px-3 py-2.5 font-mono text-xs text-accent">
                  <span>run “{query.trim()}”</span>
                  <CornerDownLeft size={13} />
                </div>
              ) : null}
              {groups.map((g) => (
                <Fragment key={g}>
                  <div className="label px-3 pb-1.5 pt-3 text-[10px] text-dim">{g}</div>
                  {filtered
                    .filter((f) => f.group === g)
                    .map((it) => {
                      idx += 1;
                      const i = idx;
                      return (
                        <button
                          key={it.id}
                          id={`cmd-${it.id}`}
                          data-idx={i}
                          role="option"
                          aria-selected={i === active}
                          onMouseMove={() => setActive(i)}
                          onClick={() => it.run()}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                            i === active ? "bg-white/[0.06] text-fg" : "text-fg/75",
                          )}
                        >
                          <span className={cn("grid h-6 w-6 place-items-center rounded border border-line", i === active ? "text-accent" : "text-muted")}>{it.icon}</span>
                          <span className="flex-1 truncate">{it.label}</span>
                          {it.hint ? <span className="hidden truncate font-mono text-[11px] text-dim sm:inline">{it.hint}</span> : null}
                          {i === active ? <CornerDownLeft size={13} className="text-muted" /> : null}
                        </button>
                      );
                    })}
                </Fragment>
              ))}
              {!filtered.length && !isCommand ? (
                <p className="px-3 py-6 text-center font-mono text-xs text-muted">No results. Press ↵ to run it as a command.</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10px] text-dim">
              <span className="text-muted">ADITYA.OS</span>
              <span className="flex gap-3">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span className="hidden sm:inline">tab complete</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
