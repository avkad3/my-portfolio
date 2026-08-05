"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Mail, ArrowDown } from "lucide-react"
import { personalInfo } from "@/lib/data"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center px-4 sm:px-6">
      <div className="mx-auto max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-4 tracking-wide uppercase">
            {personalInfo.location}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4">
            {personalInfo.name}
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground font-light mb-6 max-w-2xl">
            {personalInfo.tagline}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground/80 max-w-xl leading-relaxed mb-8">
            {personalInfo.bio}
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <SocialButton
              href={personalInfo.socials.github}
              icon={<Github className="w-4 h-4" />}
              label="GitHub"
            />
            <SocialButton
              href={personalInfo.socials.linkedin}
              icon={<Linkedin className="w-4 h-4" />}
              label="LinkedIn"
            />
            <SocialButton
              href={`mailto:${personalInfo.email}`}
              icon={<Mail className="w-4 h-4" />}
              label="Email"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        >
          <a
            href="#about"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-xs font-medium">Scroll</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function SocialButton({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "transition-all duration-200 hover:scale-105"
      )}
    >
      {icon}
      {label}
    </a>
  )
}
