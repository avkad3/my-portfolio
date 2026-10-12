"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CommandPalette } from "./command-palette";

type OS = {
  paletteOpen: boolean;
  openPalette: (initial?: string) => void;
  closePalette: () => void;
  /** Navigate to a home-page section from anywhere. */
  go: (target: string) => void;
};

const OSContext = createContext<OS | null>(null);

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used inside <OSProvider>");
  return ctx;
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setOpen] = useState(false);
  const [initial, setInitial] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const openPalette = useCallback((q = "") => {
    setInitial(q);
    setOpen(true);
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  const go = useCallback(
    (target: string) => {
      if (target.startsWith("/") && !target.startsWith("/#")) return router.push(target);
      const id = target.replace(/^\/?#/, "");
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      } else {
        router.push(`/#${id}`);
      }
    },
    [pathname, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setInitial("");
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ paletteOpen, openPalette, closePalette, go }), [paletteOpen, openPalette, closePalette, go]);

  return (
    <OSContext.Provider value={value}>
      {children}
      <CommandPalette open={paletteOpen} initialQuery={initial} onClose={closePalette} go={go} />
    </OSContext.Provider>
  );
}
