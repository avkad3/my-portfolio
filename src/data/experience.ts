export type Workstream = {
  title: string;
  project?: string; // slug of a case study
  points: string[];
  stack: string[];
  metric?: { value: string; label: string };
};

export type Role = {
  company: string;
  role: string;
  period: string;
  start: string; // ISO month, used for ordering + the timeline marker
  domain: string;
  summary: string;
  workstreams: Workstream[];
};

export const experience: Role[] = [
  {
    company: "SAVIC Technologies",
    role: "AI/ML & Data Science Intern",
    period: "June 2026 — July 2026",
    start: "2026-06",
    domain: "AI / ML · DATA SCIENCE",
    summary:
      "Built production-minded ML and LLM systems across demand planning, finance reconciliation and reservations.",
    workstreams: [
      {
        title: "Multi-horizon demand forecasting",
        project: "demand-forecasting",
        points: [
          "Forecasting platform with confidence intervals across 34,000+ product-plant series",
          "PyTorch Forecasting Temporal Fusion Transformer alongside LightGBM",
          "Streamlit interface for planners",
        ],
        stack: ["PyTorch Forecasting", "TFT", "LightGBM", "Streamlit"],
        metric: { value: "22%", label: "reduction in stock-out rates" },
      },
      {
        title: "GR-IR reconciliation QA agent",
        project: "gr-ir-qa",
        points: [
          "RAG question-answering service for GR-IR reconciliation questions",
          "ChromaDB retrieval with Azure OpenAI generation, served over FastAPI",
        ],
        stack: ["RAG", "FastAPI", "LangChain", "ChromaDB", "Azure OpenAI"],
        metric: { value: "94%", label: "semantic accuracy" },
      },
      {
        title: "AI-assisted reservation system + RCAE",
        project: "rcae-reservations",
        points: [
          "AI-assisted reservation platform; designed its Reservation Conflict Anticipation Engine",
          "Scores bookings on turnover clustering, cascade risk, kitchen load and dead time",
        ],
        stack: ["FastAPI", "React", "SQLite"],
        metric: { value: "30%", label: "fewer overbooking incidents" },
      },
    ],
  },
  {
    company: "Suraj Homes",
    role: "Project Management Intern",
    period: "December 2025 — January 2026",
    start: "2025-12",
    domain: "REAL ESTATE · PROJECT MANAGEMENT",
    summary:
      "Supported residential real estate project management with exposure to construction workflows and quality control.",
    workstreams: [
      {
        title: "Residential project delivery",
        points: [
          "Tracked residential project timelines",
          "Coordinated contractors and vendors",
          "Worked across construction and quality-control workflows",
        ],
        stack: [],
      },
    ],
  },
  {
    company: "Globe Infra Developers",
    role: "Business Operations Intern",
    period: "June 2025 — July 2025",
    start: "2025-06",
    domain: "OPERATIONS · REPORTING",
    summary: "Assisted with business operations and project documentation.",
    workstreams: [
      {
        title: "Operations data & reporting",
        points: [
          "Managed operations data and reporting in Excel",
          "Coordinated internal teams with external stakeholders",
        ],
        stack: ["Excel"],
      },
    ],
  },
];
