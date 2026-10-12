"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useOS } from "@/components/command-palette/os-context";
import { profile } from "@/data/profile";
import { cn } from "@/lib/cn";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "lab", label: "Lab" },
  { id: "stack", label: "Stack" },
  { id: "publications", label: "Publications" },
  { id: "about", label: "About" },
];

export function Nav() {
  const { openPalette, go } = useOS();
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mod, setMod] = useState("Ctrl");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl");
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return setActive(null);
    const els = ["top", ...LINKS.map((l) => l.id), "ask", "contact"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(LINKS.some((l) => l.id === visible.target.id) ? visible.target.id : null);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const jump = (id: string) => {
    setMenu(false);
    go(`#${id}`);
  };

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-accent" style={{ scaleX: progress }} aria-hidden />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-500",
          scrolled || menu ? "border-b border-line bg-bg/80 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <nav className="container-os flex h-16 items-center justify-between" aria-label="Primary">
          <Link href="/" className="group flex items-center gap-2 font-mono text-[13px] tracking-[0.14em]" onClick={() => setMenu(false)}>
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute h-2 w-2 animate-pulseDot rounded-full bg-accent" />
            </span>
            <span>
              {profile.shortName}
              <span className="text-accent">.</span>OS
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`/#${l.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    jump(l.id);
                  }}
                  className={cn(
                    "relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                    active === l.id ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {active === l.id ? <motion.span layoutId="nav-dot" className="absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent" /> : null}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openPalette()}
              className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-fg"
              aria-label="Open command palette"
            >
              <span className="hidden sm:inline">Command</span>
              <kbd className="rounded border border-line bg-raised px-1.5 py-px text-[10px]">{mod} K</kbd>
            </button>
            <button
              className="grid h-9 w-9 place-items-center rounded-full border border-line lg:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
            >
              {menu ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menu ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-bg pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="container-os flex flex-col">
              {[...LINKS, { id: "contact", label: "Contact" }].map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                  className="border-b border-line"
                >
                  <button onClick={() => jump(l.id)} className="flex w-full items-baseline justify-between py-4 text-left">
                    <span className="text-4xl font-medium tracking-tight">{l.label}</span>
                    <span className="font-mono text-[11px] text-dim">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="container-os mt-auto pb-8 font-mono text-[11px] text-muted">
              {profile.location.toUpperCase()} · {profile.email}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
