import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { OSProvider } from "@/components/command-palette/os-context";
import { Footer } from "@/components/contact/contact";
import { Nav } from "@/components/navigation/nav";
import { profile } from "@/data/profile";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(profile.site.url),
  title: { default: profile.site.title, template: `%s — ${profile.name}` },
  description: profile.site.description,
  applicationName: "ADITYA.OS",
  authors: [{ name: profile.name, url: profile.links.github }],
  creator: profile.name,
  keywords: ["Aditya Vijay Kumar", "AI/ML Engineer", "Backend Engineer", "GenAI", "RAG", "LLM", "FastAPI", "Python", "Go", "PyCodeAtlas", "Mumbai"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ADITYA.OS",
    title: profile.site.title,
    description: profile.site.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: profile.site.title, description: profile.site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI/ML Engineer",
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: profile.focus,
  url: profile.site.url,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="noise">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-fg focus:px-3 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <OSProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </OSProvider>
      </body>
    </html>
  );
}
