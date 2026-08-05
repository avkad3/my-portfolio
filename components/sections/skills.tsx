"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { skills } from "@/lib/data"
import {
  Code2,
  Brain,
  MessageSquare,
  Server,
  Database,
  Cloud,
  BarChart3,
} from "lucide-react"

const skillCategories = [
  {
    title: "Languages",
    icon: <Code2 className="w-5 h-5" />,
    items: skills.languages,
  },
  {
    title: "Machine Learning",
    icon: <Brain className="w-5 h-5" />,
    items: skills.ml,
  },
  {
    title: "LLMs & GenAI",
    icon: <MessageSquare className="w-5 h-5" />,
    items: skills.llm,
  },
  {
    title: "Backend & APIs",
    icon: <Server className="w-5 h-5" />,
    items: skills.backend,
  },
  {
    title: "Databases",
    icon: <Database className="w-5 h-5" />,
    items: skills.databases,
  },
  {
    title: "Cloud & DevOps",
    icon: <Cloud className="w-5 h-5" />,
    items: skills.devops,
  },
  {
    title: "Data & Viz",
    icon: <BarChart3 className="w-5 h-5" />,
    items: skills.data,
  },
]

export function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="skills" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            Skills
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-primary">{category.icon}</span>
                  <h3 className="font-semibold">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
