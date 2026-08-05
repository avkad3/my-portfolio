"use client"

import { motion } from "framer-motion"
import { education } from "@/lib/data"
import { GraduationCap, MapPin, Calendar } from "lucide-react"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            About
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                I&apos;m a Computer Engineering student at{" "}
                <span className="text-foreground font-medium">
                  {education.school}
                </span>
                , specializing in AI & Machine Learning. My work spans from
                building production ML pipelines and custom domain-specific
                languages to developing autonomous systems with reinforcement
                learning.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I enjoy bridging the gap between cutting-edge research and
                practical engineering — whether that&apos;s deploying a Temporal
                Fusion Transformer for demand forecasting or designing a custom
                parser for an AI programming language.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-lg">Education</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{education.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {education.degree}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {education.location}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {education.period}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
