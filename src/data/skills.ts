import { projects } from "./projects";

export type StackCategory = { id: string; label: string; code: string; items: string[] };

export const stack: StackCategory[] = [
  { id: "lang", code: "01", label: "Languages", items: ["Python", "Go", "SQL"] },
  {
    id: "genai",
    code: "02",
    label: "LLM / GenAI",
    items: ["LangChain", "LangGraph", "RAG", "ChromaDB", "FAISS", "Azure OpenAI", "Hugging Face", "Ollama", "MCP", "Prompt Engineering"],
  },
  {
    id: "ml",
    code: "03",
    label: "ML / Data",
    items: ["PyTorch Forecasting", "TFT", "LightGBM", "Stable Baselines3", "Gymnasium", "Pandas", "NumPy", "OpenCV", "NetworkX", "Plotly", "Streamlit"],
  },
  {
    id: "backend",
    code: "04",
    label: "Backend",
    items: ["FastAPI", "REST APIs", "WebSockets", "SQLAlchemy", "SQLite", "PostgreSQL", "Redis"],
  },
  { id: "tools", code: "05", label: "Tools", items: ["Docker", "Git", "GitHub", "pytest", "CI/CD", "Azure", "Render"] },
];

/** Technology → projects that actually used it (derived, never hand-maintained). */
export function projectsUsing(tech: string) {
  const t = tech.toLowerCase();
  return projects.filter((p) =>
    p.stack.some((s) => s.toLowerCase() === t || (t === "azure" && s === "Azure OpenAI") || (t === "rest apis" && (s === "FastAPI" || s === "Flask"))),
  );
}
