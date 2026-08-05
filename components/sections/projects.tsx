"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowUpRight, Github, ExternalLink } from "lucide-react"
import { allProjects } from "contentlayer/generated"
import { cn } from "@/lib/utils"

export function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const sortedProjects = [...allProjects].sort(
    (a, b) => (b.order ?? 0) - (a.order ?? 0)
  )

  return (
    <section id="projects" className="py-20 sm:py-28 px-4 sm:px-6 bg-muted/30">
      <div className="mx-auto max-w-5xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Projects
            </h2>
            <Link
              href="/projects"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {sortedProjects.slice(0, 4).map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all projects
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({
  project,
  index,
  isInView,
}: {
  project: (typeof allProjects)[0]
  index: number
  isInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
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
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground">
              +{project.tech.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {project.github && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Github className="w-3.5 h-3.5" />
              Code
            </span>
          )}
          {project.demo && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
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
    </motion.div>
  )
}
