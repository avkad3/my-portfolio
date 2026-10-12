export const profile = {
  name: "Aditya Vijay Kumar",
  firstName: "Aditya",
  shortName: "ADITYA",
  handle: "aditya.os",
  roles: ["AI/ML Engineer", "Backend Engineer", "GenAI Developer"],
  disciplines: ["AI / ML", "BACKEND", "GENAI", "DATA"],
  location: "Mumbai, India",
  timezone: "Asia/Kolkata",
  email: "avkad3@gmail.com",
  summary:
    "AI/ML and backend engineering student who ships working Python and Go systems involving LLM and RAG pipelines, forecasting, static analysis tooling and real-time web apps.",
  focus: [
    "LLMs",
    "RAG",
    "Machine Learning",
    "Forecasting",
    "Backend Systems",
    "Developer Tooling",
    "Computer Vision",
  ],
  education: {
    school: "Pillai College of Engineering, Panvel",
    degree: "B.E. Computer Engineering",
    specialization: "AI & Machine Learning",
    period: "2023 — 2027",
  },
  certifications: [
    "Google DeepMind — AI Research Foundations",
    "Natural Language Processing on Google Cloud",
    "Transformer Models and BERT",
    "Anthropic — AI Fluency Framework & Foundations",
  ],
  links: {
    github: "https://github.com/avkad3",
    githubHandle: "avkad3",
    linkedin: "https://www.linkedin.com/in/aditya-vijay-kumar-6a83b7370",
    email: "mailto:avkad3@gmail.com",
  },
  site: {
    // Set NEXT_PUBLIC_SITE_URL in production; falls back to the existing Vercel deployment.
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://my-portfolio-nine-pied-83.vercel.app",
    title: "Aditya Vijay Kumar — AI/ML Engineer & Backend Developer",
    description:
      "Portfolio of Aditya Vijay Kumar — AI/ML and backend engineering student building intelligent systems with Python, Go, LLMs, RAG, machine learning and modern backend technologies.",
  },
} as const;

/** Verified SAVIC Technologies outcomes — shown in the impact readout. */
export const impact = [
  { value: 34000, suffix: "+", label: "Product-plant series", detail: "Multi-horizon demand forecasting with confidence intervals", project: "demand-forecasting" },
  { value: 22, suffix: "%", label: "Stock-out reduction", detail: "TFT + LightGBM forecasting platform", project: "demand-forecasting" },
  { value: 94, suffix: "%", label: "Semantic accuracy", detail: "RAG agent for GR-IR reconciliation questions", project: "gr-ir-qa" },
  { value: 30, suffix: "%", label: "Fewer overbooking incidents", detail: "Reservation Conflict Anticipation Engine", project: "rcae-reservations" },
] as const;
