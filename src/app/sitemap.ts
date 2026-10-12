import type { MetadataRoute } from "next";
import { caseStudies } from "@/data/projects";
import { profile } from "@/data/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.site.url;
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((p) => ({ url: `${base}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
