import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { personalInfo } from "@/lib/data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `${personalInfo.name} — AI/ML Engineer`,
  description: personalInfo.bio,
  keywords: [
    "AI",
    "Machine Learning",
    "Deep Learning",
    "Python",
    "PyTorch",
    "LangChain",
    "Next.js",
    "Portfolio",
  ],
  authors: [{ name: personalInfo.name }],
  openGraph: {
    title: `${personalInfo.name} — AI/ML Engineer`,
    description: personalInfo.bio,
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
