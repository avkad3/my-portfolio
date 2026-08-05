import { allProjects } from "contentlayer/generated"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Github, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Projects — Aditya Kumar Vijay",
  description: "A collection of AI/ML, full-stack, and research projects.",
}

export default function ProjectsPage() {
  const sorted = [...allProjects].sort(
    (a, b) => (b.order ?? 0) - (a.order ?? 0)
  )

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          All Projects
        </h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          A collection of AI/ML systems, developer tools, and research projects I&apos;ve built.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {sorted.map((project) => (
            <Link
              key={project.slug}
              href={project.url}
              className={cn(
                "group block bg-card rounded-xl border border-border p-6",
                "hover:border-primary/30 transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {project.github && (
                  <span className="flex items-center gap-1">
                    <Github className="w-3.5 h-3.5" />
                    Code
                  </span>
                )}
                {project.demo && (
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Demo
                  </span>
                )}
                <span className="ml-auto text-xs">
                  {new Date(project.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
