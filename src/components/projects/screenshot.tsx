import Image from "next/image";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

/** A real screenshot of the running project, framed like the other panels. */
export function Screenshot({ shot, label = "screenshot", className }: { shot: NonNullable<Project["screenshot"]>; label?: string; className?: string }) {
  return (
    <figure className={cn("panel overflow-hidden", className)}>
      <figcaption className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
        </span>
        <span className="ml-2">{label}</span>
      </figcaption>
      <Image src={shot.src} width={shot.width} height={shot.height} alt={shot.alt} sizes="(min-width: 1024px) 60vw, 100vw" className="h-auto w-full" />
    </figure>
  );
}
