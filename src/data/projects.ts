export type ProjectKind = "flagship" | "system" | "savic" | "archive";

export type CaseStudy = {
  problem: string;
  approach: string[];
  /** Plain-text architecture diagram, rendered in a monospace panel. */
  architecture: string;
  implementation: string[];
  result: string[];
  decisions?: { title: string; body: string }[];
  code?: { label: string; lang: string; body: string };
};

export type Project = {
  slug: string;
  name: string;
  /** Display title, split into lines for large editorial type. */
  title: string[];
  tagline: string;
  kind: ProjectKind;
  status: "shipped" | "published" | "in production" | "live" | "internship";
  private?: boolean;
  stack: string[];
  features: string[];
  links: { github?: string; live?: string; pypi?: string; doi?: string };
  badge?: string;
  metric?: { value: string; label: string };
  caseStudy?: CaseStudy;
};

const GH = "https://github.com/avkad3";

export const projects: Project[] = [
  {
    slug: "pycodeatlas",
    name: "PyCodeAtlas",
    title: ["PYCODE", "ATLAS"],
    tagline: "Understand your codebase. Delete with confidence.",
    kind: "flagship",
    status: "published",
    badge: "Published on PyPI",
    stack: ["Python", "AST", "NetworkX", "D3.js", "SQLite", "Click"],
    features: [
      "AST-based static analysis",
      "Code dependency graph",
      "Dead code classified as unused, test-only or uncovered",
      "Impact analysis — what breaks if you delete a function or module",
      "Runtime tracing with sys.settrace",
      "Understands Django, Flask and FastAPI routes",
      "Interactive D3.js dependency graph",
      "Zero-config CLI, configurable via pyproject.toml",
    ],
    links: { github: `${GH}/CodeAtlas`, pypi: "https://pypi.org/project/pycodeatlas/" },
    caseStudy: {
      problem:
        "Deleting code in a real Python codebase is a gamble. Naive \"unused symbol\" checks miss dynamic calls made through getattr or decorators, and they flag framework routes as dead because nothing in the code calls them directly. Developers either leave dead code forever or break production removing it.",
      approach: [
        "Parse every module with Python's AST to extract definitions, imports and call sites without executing anything.",
        "Assemble a directed dependency graph in NetworkX where nodes are modules, classes and functions.",
        "Mark entry points (CLI mains, manage.py, Django URLs, Flask blueprints, FastAPI routes) so framework code is never misreported.",
        "Classify the remainder as unused, test-only or uncovered, and answer impact queries by walking reverse dependencies.",
        "Optionally run the test suite under sys.settrace to record dynamic calls that static analysis cannot see, persisted to SQLite.",
      ],
      architecture: `   source tree
       │
       ▼
  ┌──────────┐     ┌──────────────┐
  │ AST scan │────▶│ symbol table │
  └──────────┘     └──────┬───────┘
                          ▼
  ┌──────────────┐  ┌──────────────┐
  │ route detect │─▶│ NetworkX DAG │◀─┐
  │ django/flask │  └──────┬───────┘  │
  │ fastapi      │         │          │
  └──────────────┘         ▼          │
                   ┌──────────────┐ ┌─┴──────────────┐
                   │  classifier  │ │ sys.settrace   │
                   │ unused/test/ │ │ runtime traces │
                   │ uncovered    │ │ (SQLite)       │
                   └──────┬───────┘ └────────────────┘
                          ▼
              CLI (Click)  ·  D3.js web UI`,
      implementation: [
        "Node naming uses a path::object convention — utils.py::helper, models.py::User, or a whole module like app.py.",
        "Configuration lives in pyproject.toml under [tool.codeatlas]: entry, test and ignore patterns plus per-framework detection flags.",
        "Trace sampling is configurable (sample_rate, max_depth) so tracing stays cheap on large suites.",
        "`codeatlas serve` launches an interactive D3.js graph of the analysed codebase.",
      ],
      result: [
        "Published to PyPI as pycodeatlas.",
        "Six commands: init, analyze, impact, trace, trace-summary, serve.",
      ],
      decisions: [
        { title: "Static first, runtime second", body: "AST analysis gives a complete but conservative picture; runtime tracing is an opt-in layer that resolves dynamic dispatch rather than a requirement." },
        { title: "Framework-aware entry points", body: "Routes registered by Django, Flask and FastAPI are treated as roots, so web handlers are never reported as dead code." },
        { title: "Three kinds of dead", body: "Unused, test-only and uncovered are different decisions for a developer, so the tool reports them separately instead of one flat list." },
      ],
      code: {
        label: "terminal",
        lang: "bash",
        body: `$ pip install pycodeatlas

# initialise config, then analyse
$ codeatlas init .
$ codeatlas analyze .

# what breaks if this function is deleted?
$ codeatlas impact . "src/billing.py::calculate_tax"

# capture dynamic calls during the test run
$ codeatlas trace . pytest tests/

# open the interactive graph
$ codeatlas serve . --with-trace`,
      },
    },
  },
  {
    slug: "cmpis",
    name: "CMPIS",
    title: ["CONSTRUCTION MATERIAL", "PRICE INTELLIGENCE"],
    tagline: "Is this quote fair? Six months of price history, every vendor, one answer.",
    kind: "system",
    status: "shipped",
    stack: ["FastAPI", "Streamlit", "SQLAlchemy", "RapidFuzz", "Plotly", "SQLite"],
    features: [
      "Multi-vendor price comparison",
      "Six-month price history",
      "Green / yellow / red market status indicator",
      "Purchase-order upload and parsing",
      "Fuzzy matching of PO lines to the catalog",
      "Modular data layer — seeded demo data today, live data tomorrow",
    ],
    links: { github: `${GH}/CMPIS-Construction-Material-Price-Intelligence-System` },
    caseStudy: {
      problem:
        "Construction material prices vary significantly across suppliers and over time. Procurement teams compare quotations by hand, which is slow and makes it easy to overpay.",
      approach: [
        "Centralise product, vendor and price history in one database.",
        "Compute current price, lowest vendor price, historical average and deviation for every material.",
        "Turn deviation into a green / yellow / red market status so a buyer can decide at a glance.",
        "Accept uploaded purchase orders and fuzzy-match each line item to the catalog before analysing it.",
      ],
      architecture: `            User
              │
              ▼
     Streamlit frontend
              │  REST
              ▼
       FastAPI backend
              │
     ┌────────┴────────┐
     ▼                 ▼
 Analytics engine   Product search
     │              (fuzzy match)
     ▼
  SQLite · SQLAlchemy
     │
     ▼
 Historical price data
 (seeded demo dataset)

   optional: live scraper worker`,
      implementation: [
        "Streamlit frontend talks to a FastAPI backend over REST.",
        "Analytics, search and data collection are separate modules, so the seeded data layer can be swapped for live data without touching the UI.",
        "On first start a seeding process generates roughly six months of synthetic pricing history across products and vendors, so the analytics run without scraping.",
        "Plotly charts render price trends and vendor comparisons.",
      ],
      result: [
        "One screen answers: current price, cheapest vendor, six-month average, deviation and a buy signal.",
        "Purchase orders can be uploaded and analysed line by line.",
      ],
      decisions: [
        { title: "Seeded data, honest by design", body: "The demo runs on clearly synthetic history so the analytics can be evaluated end-to-end without depending on a fragile scraper." },
        { title: "Separated data layer", body: "Data collection, analytics and presentation are fully decoupled, making a live data source a drop-in replacement." },
      ],
    },
  },
  {
    slug: "ascii-lab",
    name: "ASCII Lab",
    title: ["ASCII", "LAB"],
    tagline: "Images, video and live webcam rendered as text — in real time.",
    kind: "system",
    status: "live",
    stack: ["FastAPI", "OpenCV", "NumPy", "Pillow", "pytest", "Docker", "Render"],
    features: [
      "Image → ASCII",
      "Video → ASCII playback",
      "Live webcam → ASCII",
      "5 rendering modes: density, blocks, binary, edge, custom",
      "Floyd-Steinberg, Atkinson and ordered dithering",
      "Per-character colour extraction",
      "Brightness, contrast, gamma and invert controls",
      "Dockerised, tested with pytest, deployed on Render",
    ],
    links: { github: `${GH}/ASCII-Lab`, live: "https://ascii-lab.onrender.com/" },
    caseStudy: {
      problem:
        "Most ASCII converters are one-shot scripts: one character ramp, no dithering, no video. The goal was an interactive rendering platform that treats ASCII as a real rendering target.",
      approach: [
        "Convert each input frame to luminance, apply brightness, contrast and gamma, then map cells to characters.",
        "Offer several rendering strategies — density ramps, block glyphs, binary, and OpenCV edge detection.",
        "Use error-diffusion (Floyd-Steinberg, Atkinson) and ordered dithering to preserve tone with few characters.",
        "Sample the original colour per cell for colour ASCII output.",
      ],
      architecture: `  image / video / webcam
            │
            ▼
   ┌──────────────────┐
   │ FastAPI service  │
   └────────┬─────────┘
            ▼
   resize → grayscale → adjust
   (OpenCV · NumPy · Pillow)
            │
     ┌──────┼────────┐
     ▼      ▼        ▼
  density  edge    dithering
  blocks  (OpenCV) FS / Atkinson
  binary          / ordered
     └──────┬────────┘
            ▼
   glyph map + per-cell colour
            │
            ▼
   browser render · copy · .txt`,
      implementation: [
        "Seven character sets: standard, dense, minimal, blocks, binary, terminal and edge.",
        "Five interactive effects: gravity, vortex, ripple, explosion and fire.",
        "Export to clipboard or .txt.",
        "Containerised with Docker, covered by pytest, deployed to Render.",
      ],
      result: ["Live at ascii-lab.onrender.com.", "A browser-side version of the renderer runs in the ADITYA.LAB section of this site."],
    },
  },
  {
    slug: "mini-order-fulfillment",
    name: "Mini Order Fulfillment System",
    title: ["MINI ORDER", "FULFILLMENT SYSTEM"],
    tagline: "An SAP-inspired order-to-cash workflow, from purchase order to reserved inventory.",
    kind: "system",
    status: "shipped",
    stack: ["React", "TypeScript", "FastAPI", "SQLAlchemy", "Alembic", "JWT", "SQLite", "Recharts"],
    features: [
      "Customer purchase-order upload",
      "Excel and PDF parsing",
      "Material and stock validation",
      "Supplier approve / reject / partial approval",
      "Automatic sales order creation",
      "Inventory reservation",
      "Role-based JWT authentication",
      "Recharts dashboards and report export",
    ],
    links: { github: `${GH}/mini-order-fulfillment-system` },
    caseStudy: {
      problem:
        "Many organisations still process purchase orders through email and spreadsheets: manual inventory checks, duplicate POs, inconsistent data, slow approvals and no visibility into order status.",
      approach: [
        "Model the opening stages of an enterprise order-to-cash flow as an explicit state machine.",
        "Parse uploaded Excel and PDF purchase orders into structured line items.",
        "Validate materials against the catalog and stock against inventory before a human reviews anything.",
        "Let the supplier approve, reject or partially approve, then generate the sales order and reserve inventory automatically.",
      ],
      architecture: `  CUSTOMER                    SUPPLIER
     │                           ▲
     ▼                           │
  upload PO ──▶ parse (xlsx/pdf)  │
                    │             │
                    ▼             │
           material validation    │
                    │             │
                    ▼             │
            stock validation ─────┘
                                  │
          approve · reject · partial
                    │
                    ▼
            SALES ORDER created
                    │
                    ▼
          inventory reservation
                    │
                    ▼
        dashboards · report export

  React + TS  ⇄  FastAPI  ⇄  SQLAlchemy/Alembic  ⇄  SQLite
                 (JWT, role-based)`,
      implementation: [
        "Two roles with JWT auth: customers upload and track POs; suppliers review, validate and approve.",
        "SQLAlchemy models with Alembic migrations on SQLite.",
        "Recharts dashboards for order and inventory analytics, plus report export.",
      ],
      result: [
        "End-to-end flow from uploaded PO to sales order and reserved inventory with no spreadsheet hand-offs.",
        "Partial approvals handled as first-class outcomes, not edge cases.",
      ],
    },
  },
  {
    slug: "buildvault-ai",
    name: "BuildVault-AI",
    title: ["BUILDVAULT", "AI"],
    tagline: "Business management system for builders and construction firms.",
    kind: "system",
    status: "in production",
    private: true,
    stack: [],
    features: ["Business management for builders and construction firms"],
    links: {},
  },
  {
    slug: "demand-forecasting",
    name: "Demand Forecasting Platform",
    title: ["DEMAND", "FORECASTING"],
    tagline: "Multi-horizon forecasts with confidence intervals for 34,000+ product-plant series.",
    kind: "savic",
    status: "internship",
    badge: "SAVIC Technologies",
    stack: ["Python", "PyTorch Forecasting", "TFT", "LightGBM", "Streamlit"],
    features: ["Multi-horizon forecasting", "Confidence intervals", "34,000+ product-plant series", "Streamlit interface"],
    metric: { value: "22%", label: "lower stock-out rate" },
    links: {},
    caseStudy: {
      problem:
        "Planning inventory across tens of thousands of product-plant combinations with point forecasts leaves planners blind to uncertainty — and stock-outs follow.",
      approach: [
        "Forecast every product-plant series over multiple horizons rather than a single next period.",
        "Combine a Temporal Fusion Transformer (PyTorch Forecasting) with LightGBM.",
        "Report confidence intervals, not just point estimates, so planners can size safety stock.",
        "Expose results to planners through a Streamlit application.",
      ],
      architecture: `  sales history (34,000+ series)
              │
              ▼
      feature preparation
              │
      ┌───────┴────────┐
      ▼                ▼
  TFT (PyTorch      LightGBM
  Forecasting)
      └───────┬────────┘
              ▼
  multi-horizon forecast + intervals
              │
              ▼
       Streamlit for planners`,
      implementation: ["Built during the SAVIC Technologies internship (June – July 2026)."],
      result: ["Covered 34,000+ product-plant series.", "Reduced stock-out rates by 22%."],
    },
  },
  {
    slug: "gr-ir-qa",
    name: "GR-IR Reconciliation QA Agent",
    title: ["GR-IR", "QA AGENT"],
    tagline: "A RAG agent that answers goods-receipt / invoice-receipt reconciliation questions.",
    kind: "savic",
    status: "internship",
    badge: "SAVIC Technologies",
    stack: ["RAG", "FastAPI", "LangChain", "ChromaDB", "Azure OpenAI"],
    features: ["Retrieval-augmented generation", "ChromaDB vector store", "Azure OpenAI generation", "FastAPI service"],
    metric: { value: "94%", label: "semantic accuracy" },
    links: {},
    caseStudy: {
      problem:
        "GR-IR reconciliation questions require finance context scattered across documents; answering them by hand is slow and inconsistent.",
      approach: [
        "Index reconciliation knowledge into ChromaDB.",
        "Retrieve the relevant passages for each question with LangChain.",
        "Generate grounded answers with Azure OpenAI.",
        "Serve the pipeline over FastAPI.",
      ],
      architecture: `  question
     │
     ▼
  FastAPI ──▶ LangChain retriever ──▶ ChromaDB
     │                                   │
     │◀──────── top-k passages ──────────┘
     ▼
  Azure OpenAI (grounded prompt)
     │
     ▼
  answer`,
      implementation: ["Built during the SAVIC Technologies internship (June – July 2026)."],
      result: ["Answered GR-IR reconciliation questions at 94% semantic accuracy."],
    },
  },
  {
    slug: "rcae-reservations",
    name: "Reservation System + RCAE",
    title: ["RESERVATION CONFLICT", "ANTICIPATION ENGINE"],
    tagline: "Not \"is there capacity now?\" but \"what will this booking break in two hours?\"",
    kind: "savic",
    status: "published",
    badge: "Published on Zenodo",
    stack: ["FastAPI", "React", "SQLite", "SQLAlchemy"],
    features: [
      "AI-assisted reservation platform",
      "Forward operational stress score from 0.0 to 1.0",
      "Turnover clustering, cascade risk, kitchen load, dead time",
      "Advisory recommendations for managers",
      "Configurable weights",
    ],
    metric: { value: "30%", label: "fewer overbooking incidents" },
    links: { github: `${GH}/RCAE-Reservation-Conflict-Anticipation-Engine`, doi: "https://doi.org/10.5281/zenodo.21477811" },
    caseStudy: {
      problem:
        "Reservation platforms answer one question: is there capacity right now? None ask what operational problems a booking will create over the next two hours — tables turning at once, a late large party colliding with the next booking, a kitchen slammed, or gaps too short to clean and too long to fill.",
      approach: [
        "Evaluate every proposed reservation against four forward-looking stress factors.",
        "Combine them into a composite score from 0.0 (high stress) to 1.0 (ideal slot).",
        "Return a confidence label, a recommendation and human-readable warnings.",
      ],
      architecture: `  proposed booking (date, time, guests, table)
                     │
                     ▼
  ┌───────────────────────────────────────────┐
  │ turnover clustering  × 0.30               │
  │ cascade risk         × 0.25               │
  │ kitchen load         × 0.25               │
  │ dead time            × 0.20               │
  └─────────────────────┬─────────────────────┘
                        ▼
            RCAE score 0.0 — 1.0
                        │
     ┌──────────┬───────┴────┬───────────┐
   ≥0.70      ≥0.50        ≥0.30       <0.30
  OPTIMAL  ACCEPTABLE    CAUTION    HIGH RISK`,
      implementation: [
        "Turnover clustering detects multiple tables finishing within the same 15-minute window.",
        "Cascade risk models large-party lateness pushing into the next booking on the same table.",
        "Kitchen load flags too many orders starting within a 20-minute window.",
        "Dead time detects gaps between bookings that are too short to clean and too long to fill.",
        "Integrated into a FastAPI + React + SQLite reservation platform.",
      ],
      result: [
        "Reduced overbooking incidents by 30%.",
        "Published on Zenodo (CERN) — DOI 10.5281/zenodo.21477811.",
      ],
      decisions: [
        { title: "No training data required", body: "Deterministic scoring over existing bookings means RCAE works from day one with zero historical data." },
        { title: "Advisory, not blocking", body: "The score informs the manager dashboard and recommendations; it never overrides a customer's booking." },
        { title: "Configurable weights", body: "Operators can tune the four weights to their kitchen capacity and floor staff model." },
      ],
      code: {
        label: "rcae_service.py",
        lang: "python",
        body: `result = RCAEService.evaluate(
    db,
    proposed_date=date(2026, 7, 10),
    proposed_time=time(19, 0),
    guests=6,
    table_id=3,
)
# {
#   "score": 0.8125, "confidence": "HIGH", "recommend": True,
#   "breakdown": {
#     "turnover_clustering": 1.0, "cascade_risk": 1.0,
#     "kitchen_load": 0.75,       "dead_time": 0.7
#   }
# }`,
      },
    },
  },
  // ── Archive: further projects from the résumé ──────────────────────────────
  {
    slug: "contextmesh",
    name: "ContextMesh",
    title: ["CONTEXTMESH"],
    tagline: "Offline-first peer-to-peer mesh chat platform in Go.",
    kind: "archive",
    status: "shipped",
    stack: ["Go", "WebSockets", "PostgreSQL", "Redis", "Docker"],
    features: ["Real-time messaging", "Offline synchronisation", "Multi-hop mesh networking", "End-to-end encryption", "Conflict-free message sync"],
    links: {},
  },
  {
    slug: "neuralscript",
    name: "NeuralScript",
    title: ["NEURALSCRIPT"],
    tagline: "A Python-like DSL for neural network training, RAG pipelines and LoRA fine-tuning.",
    kind: "archive",
    status: "shipped",
    stack: ["Python", "Custom Parser"],
    features: ["Abstracts NN training, RAG and LoRA fine-tuning", "Built-in think blocks for AI reasoning", "Custom parser for datasets, architectures and knowledge bases"],
    links: { github: `${GH}/NeuralScript` },
  },
  {
    slug: "multi-agent-research",
    name: "Multi-Agent AI Research System",
    title: ["MULTI-AGENT", "RESEARCH"],
    tagline: "LangGraph stateful agents with CrewAI task delegation for automated research.",
    kind: "archive",
    status: "shipped",
    stack: ["LangGraph", "LangChain", "CrewAI", "FastAPI"],
    features: ["Stateful LangGraph agents", "CrewAI task delegation", "Automated information gathering and synthesis", "Deployed via FastAPI"],
    links: {},
  },
  {
    slug: "orbital-rl",
    name: "Orbital Maneuver RL",
    title: ["ORBITAL", "MANEUVER RL"],
    tagline: "A PPO agent that beat a classical Hohmann transfer on fuel efficiency.",
    kind: "archive",
    status: "shipped",
    stack: ["Python", "Gymnasium", "Stable Baselines3", "PPO"],
    features: ["Custom Gymnasium environment", "PPO trained over 500K steps", "12% better fuel efficiency than Hohmann transfer"],
    metric: { value: "12%", label: "fuel efficiency vs Hohmann" },
    links: {},
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const caseStudies = projects.filter((p) => p.caseStudy || p.private);
