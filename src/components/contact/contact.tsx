"use client";

import { ArrowUpRight, Mail, Send } from "lucide-react";
import { useState } from "react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { Magnetic } from "@/components/ui/magnetic";
import { RevealLines } from "@/components/ui/reveal";
import { profile } from "@/data/profile";

export function Contact() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name || "your portfolio"}`)}&body=${encodeURIComponent(msg)}`;

  return (
    <section id="contact" className="relative overflow-hidden pb-16 pt-24 md:pt-40" aria-label="Contact">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(61,242,166,0.08),transparent_60%)]" aria-hidden />
      <div className="container-os relative">
        <div className="mb-10 flex items-center gap-4 border-t border-line pt-6">
          <span className="section-index">08</span>
          <span className="label">Contact</span>
        </div>

        <h2 className="text-mega font-medium">
          <RevealLines lines={["LET'S BUILD", "SOMETHING", "USEFUL."]} className="[&>span:last-child>span]:text-accent" />
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="text-2xl text-fg/85">Have a problem worth solving?</p>
            {!open ? (
              <Magnetic className="mt-8">
                <button onClick={() => setOpen(true)} className="btn-primary px-7 py-4">
                  <Send size={14} /> Send message
                </button>
              </Magnetic>
            ) : (
              <form
                className="mt-8 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = mailto;
                }}
              >
                <label className="block">
                  <span className="label text-[10px]">Your name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-3 text-sm focus:border-accent/50 focus:outline-none"
                    autoFocus
                  />
                </label>
                <label className="block">
                  <span className="label text-[10px]">Message</span>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    rows={4}
                    required
                    className="mt-1.5 w-full resize-none rounded-md border border-line bg-surface px-3 py-3 text-sm focus:border-accent/50 focus:outline-none"
                  />
                </label>
                <div className="flex items-center gap-4">
                  <button type="submit" className="btn-primary">
                    <Send size={13} /> Open in email
                  </button>
                  <span className="font-mono text-[10.5px] text-dim">opens your mail client → {profile.email}</span>
                </div>
              </form>
            )}
          </div>

          <ul className="border-t border-line md:col-span-5 md:col-start-8">
            {[
              { label: "Email", value: profile.email, href: profile.links.email, icon: <Mail size={16} /> },
              { label: "GitHub", value: `@${profile.links.githubHandle}`, href: profile.links.github, icon: <GitHubIcon width={16} height={16} /> },
              { label: "LinkedIn", value: "Aditya Vijay Kumar", href: profile.links.linkedin, icon: <LinkedInIcon width={15} height={15} /> },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group flex items-center justify-between border-b border-line py-5 transition-colors hover:text-accent"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-muted group-hover:text-accent">{l.icon}</span>
                    <span className="text-xl font-medium">{l.label}</span>
                  </span>
                  <span className="flex items-center gap-3 font-mono text-[12px] text-muted">
                    <span className="hidden sm:inline">{l.value}</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </li>
            ))}
            <li className="py-5 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{profile.location}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-os flex flex-col gap-4 py-8 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim md:flex-row md:items-center md:justify-between">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>
          Press <kbd className="rounded border border-line px-1.5 py-px text-muted">Ctrl/⌘ K</kbd> · try <span className="text-muted">sudo hire aditya</span>
        </span>
        <span>Next.js · TypeScript · D3 · Framer Motion</span>
      </div>
    </footer>
  );
}
