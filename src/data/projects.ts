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
  /** Real screenshot from the running project, served from /public/projects. */
  screenshot?: { src: string; width: number; height: number; alt: string };
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
    screenshot: { src: "/projects/pycodeatlas.webp", width: 1374, height: 710, alt: "CodeAtlas web UI showing the dependency graph with dead-code and uncovered panels" },
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
      "Modular data layer — seeded demo data swappable for a live Serper.dev scraper",
    ],
    links: { github: `${GH}/CMPIS-Construction-Material-Price-Intelligence-System` },
    screenshot: { src: "/projects/cmpis.webp", width: 1374, height: 1220, alt: "CMPIS product dashboard with the green buy signal, vendor stats and 180-day price history" },
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

   optional: live scraper worker
   (Serper.dev Shopping API)`,
      implementation: [
        "Streamlit frontend talks to a FastAPI backend over REST.",
        "Analytics, search and data collection are separate modules, so the seeded data layer can be swapped for live data without touching the UI.",
        "On first start a seeding process generates roughly six months of synthetic pricing history across products and vendors, so the analytics run without scraping.",
        "Plotly charts render price trends and vendor comparisons.",
        "An optional live scraper worker pulls current prices from the Serper.dev Shopping API into the same data layer.",
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
    screenshot: { src: "/projects/ascii-lab.webp", width: 1400, height: 900, alt: "ASCII Lab landing page with a live ASCII preview" },
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
      "Excel and PDF parsing (pandas, openpyxl, pdfplumber)",
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
        "Parse uploaded Excel and PDF purchase orders (pandas, openpyxl, pdfplumber) into structured line items.",
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
    tagline: "Business management system for builders and construction firms, in production use by a customer.",
    kind: "system",
    status: "in production",
    private: true,
    stack: [],
    features: ["Business management for builders and construction firms", "In production use by a customer"],
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
  // ── More shipped systems from GitHub ──────────────────────────────────────
  {
    slug: "maps-competitor-intelligence",
    name: "Google Maps Competitor Update Intelligence",
    title: ["MAPS COMPETITOR", "INTELLIGENCE"],
    tagline: "Scrapes competitors' Google Maps updates, de-duplicates them, analyses them with AI and drafts new posts.",
    kind: "system",
    status: "shipped",
    stack: ["Python", "Flask", "Selenium", "SQLite", "Gemini", "Groq", "OpenRouter", "pytest", "Docker"],
    features: [
      "Selenium scraper for Google Maps Updates with structural card detection",
      "Fingerprint-based duplicate detection across scrapes",
      "CAPTCHA pause, continue and remote solve console (no bypass)",
      "LLM topic classification with four providers and an offline fallback",
      "Topic trends, monthly history and own-profile gap analysis",
      "Idea and full-update generator with duplicate prevention",
      "Keyword discovery of new competitors and scheduled re-scrapes",
      "Dockerised with a Render blueprint",
    ],
    links: { github: `${GH}/Google_Maps_Competitor_Update_Intelligence` },
    screenshot: { src: "/projects/maps-competitor-intelligence.webp", width: 1400, height: 900, alt: "Project dashboard with competitor counts, top topics and most used keywords" },
    caseStudy: {
      problem:
        "Local businesses publish offers and news as Google Maps Updates, but there is no feed or export for competitors' posts. Tracking them means visiting every profile by hand, with no way to see which topics competitors push, how often, or what you are missing.",
      approach: [
        "Scrape each competitor's Updates tab with Selenium in a single Chrome session, paced and in an English locale.",
        "Store every post once in a de-duplicated SQLite repository, even when several projects track the same competitor.",
        "Classify posts with an LLM in batches against a fixed topic vocabulary so trend counts stay consistent.",
        "Turn the repository into trends, gap analysis and new update ideas grounded in what competitors actually post.",
      ],
      architecture: `  competitor profiles (Google Maps)
              │
              ▼
  Selenium scraper ──── CAPTCHA? ──▶ pause · screenshot
  (structural cards)                 continue / skip / cancel
              │
              ▼
  fingerprint: post id › URL › business + normalised text
              │
              ▼
  SQLite repository (posts.fingerprint UNIQUE)
              │
     ┌────────┼──────────────┐
     ▼        ▼              ▼
  AI analysis  trends &     generator
  (batches of  gap analysis (dedup: Jaccard ≥ 0.5,
   15 posts)                 cosine ≥ 0.62)
     │
  Gemini → Groq → xAI → OpenRouter → offline analyser

  Flask + Jinja UI · background jobs · scheduler`,
      implementation: [
        "Update cards are located structurally (a date label anchors the card, review blocks are excluded) instead of relying on Google's obfuscated class names.",
        "Post fingerprints deliberately exclude dates, because Maps shows relative dates (\"3 weeks ago\") that change between scrapes; a re-scraped post only increments times_seen.",
        "Verification pages are detected by URL, reCAPTCHA iframes and \"unusual traffic\" text; the job pauses and a person can solve it remotely through a click-through screenshot console.",
        "Each provider's model list is fetched and the best model picked automatically; calls fail over in a configurable order with an offline analyser always last.",
        "Generated updates are rejected if their headline or content overlaps earlier ideas, and each one records its similarity to the closest competitor post.",
        "A demo dataset of fictional businesses keeps the full workflow testable without reaching Google.",
      ],
      result: [
        "End-to-end pipeline: scrape → de-duplicate → analyse → trends → generate.",
        "Works with no API keys at all, thanks to the offline analyser and demo source.",
      ],
      decisions: [
        { title: "Never bypass CAPTCHAs", body: "Verification pauses the job instead of failing silently or calling a solving service; a human completes it, and the outcome is logged per competitor." },
        { title: "One competitor, many projects", body: "A Maps profile is stored once and linked to projects, so its posts are collected and analysed once no matter who tracks it." },
        { title: "Keys stay server-side", body: "AI keys live only in environment variables and are never sent to the browser, logged or stored." },
      ],
    },
  },
  {
    slug: "loan-eligibility",
    name: "Loan Eligibility Prediction",
    title: ["LOAN ELIGIBILITY", "PREDICTION"],
    tagline: "An MLOps pipeline around a Random Forest: tracked experiments, explainability, a fairness audit, an API and a dashboard.",
    kind: "system",
    status: "live",
    stack: ["Python", "scikit-learn", "MLflow", "DVC", "SHAP", "LIME", "Fairlearn", "FastAPI", "Streamlit", "Docker", "CI/CD"],
    features: [
      "Tuned Random Forest classifier",
      "Experiment tracking and model registry with MLflow",
      "Data versioning with DVC",
      "Global SHAP and per-prediction LIME explanations",
      "Fairlearn audit with a Responsible AI report",
      "FastAPI /predict service, Dockerised",
      "Streamlit dashboard",
      "GitHub Actions CI: tests, Ruff lint, version checks",
    ],
    links: { github: `${GH}/loan-eligibility-prediction`, live: "https://loan-eligibility-prediction-dfpa88fchykapafeu7keqc.streamlit.app/" },
    screenshot: { src: "/projects/loan-eligibility.webp", width: 1694, height: 1948, alt: "SHAP summary plot showing credit score, debt-to-income and income driving predictions" },
    caseStudy: {
      problem:
        "Most loan-prediction projects stop at a notebook accuracy score. The aim here was the surrounding engineering: reproducible experiments, explanations a reviewer can inspect, a fairness check, and a model that can actually be served.",
      approach: [
        "Train and tune a Random Forest, tracking every run and model in MLflow.",
        "Version the dataset with DVC so experiments are reproducible.",
        "Explain the model globally with SHAP and individual predictions with LIME.",
        "Audit predictions with Fairlearn and document privacy, consent and fairness in a Responsible AI report.",
        "Serve the model through FastAPI and a Streamlit dashboard, with CI on every push.",
      ],
      architecture: `  dataset (DVC-versioned)
          │
          ▼
  feature prep → Random Forest (tuned)
          │            │
          │            ▼
          │      MLflow runs + model registry
          ▼
  explainability: SHAP (global) · LIME (local)
  fairness: Fairlearn audit → Responsible AI report
          │
     ┌────┴─────────────┐
     ▼                  ▼
  FastAPI /predict   Streamlit dashboard
  (Docker)           (live)

  GitHub Actions: API tests · Ruff · version checks`,
      implementation: [
        "The FastAPI service validates applications with a Pydantic schema and returns the decision with its eligibility probability.",
        "CI loads the API and model, tests the health endpoint, and lints with Ruff on every push and pull request.",
        "The fairness audit looks for sensitive attributes (gender, age, marital status and similar) and reports when the dataset has none rather than inventing a metric.",
        "The Responsible AI report notes that the target was engineered from financial variables, so results are framed as an experimental evaluation, not a real lending system.",
      ],
      result: ["Live Streamlit dashboard and a containerised prediction API.", "Every run tracked, every prediction explainable."],
    },
  },
  {
    slug: "waste-classifier",
    name: "Waste Image Classifier",
    title: ["WASTE IMAGE", "CLASSIFIER"],
    tagline: "Computer vision that sorts waste photos into six material classes, from a custom CNN to MobileNetV2 transfer learning.",
    kind: "system",
    status: "shipped",
    stack: ["Python", "TensorFlow", "MobileNetV2", "scikit-learn", "NumPy", "Matplotlib", "Streamlit"],
    features: [
      "Computer vision classification into cardboard, glass, metal, paper, plastic and trash",
      "Custom CNN trained from scratch as a baseline",
      "MobileNetV2 transfer learning (ImageNet weights)",
      "Data augmentation and error analysis",
      "Streamlit app returning the class and full probability distribution",
    ],
    links: { github: `${GH}/Waste-Image-Classifier` },
    caseStudy: {
      problem: "Manual waste sorting is slow and error-prone. The goal was a complete pipeline from image to prediction, not just a trained model and an accuracy number.",
      approach: [
        "Prepare and augment a six-class waste image dataset.",
        "Train a custom CNN from scratch as a baseline.",
        "Fine-tune MobileNetV2 pretrained on ImageNet with a new pooling, dense and dropout head.",
        "Inspect misclassifications with error analysis, then serve the model in Streamlit.",
      ],
      architecture: `        waste image
             │
             ▼
     preprocessing + augmentation
             │
             ▼
   MobileNetV2 (ImageNet weights)
             │
             ▼
   global average pooling
             │
             ▼
     dense + dropout → softmax
             │
      ┌──────┴───────┐
      ▼              ▼
 predicted class   class probabilities
             │
             ▼
      Streamlit interface`,
      implementation: [
        "Separate scripts for dataset preparation, training from scratch, transfer learning, prediction and error analysis.",
        "The app returns the full probability distribution across all six classes, not only the top label.",
      ],
      result: ["A working upload-and-classify web app.", "Documented limits: small controlled dataset, fewer trash examples, sensitivity to lighting and cluttered backgrounds."],
    },
  },
  {
    slug: "omnilang",
    name: "OmniLang",
    title: ["OMNI", "LANG"],
    tagline: "A programming language and a RISC-V kernel that speak English, Hindi and Tamil — and keep each language's own word order.",
    kind: "system",
    status: "shipped",
    stack: ["Rust", "C", "RISC-V", "QEMU", "LSP", "TypeScript", "VS Code", "CI/CD"],
    features: [
      "English, Hindi and Tamil keywords, mixable in one file",
      "Word-order-aware parser: Hindi and Tamil put the verb last",
      "Interpreter plus a C99 backend for native binaries",
      "omni view --to hi renders any program in another language",
      "Errors in your language, including word-order hints",
      "Compile-time checks for Trojan Source, invisible characters and lookalike names",
      "Language server and VS Code extension with transliteration",
      "RISC-V kernel whose panic screen explains crashes in Hindi or Tamil",
    ],
    links: { github: `${GH}/Omnilang` },
    screenshot: { src: "/projects/omnilang.webp", width: 800, height: 600, alt: "OmniLang RISC-V kernel panic screen explaining a write to read-only memory in Hindi" },
    caseStudy: {
      problem:
        "Most people learning to program in India learn the ideas in their own language and the tools in English. Keyword-translation projects exist, but they keep English word order, can't share code across languages and still report errors in English.",
      approach: [
        "Define each language as a plain TOML keyword pack, so adding a language means adding one file.",
        "Parse every pack into one language-neutral AST — nothing past the lexer records which human language was used.",
        "Let each language keep its grammar: x लौटाओ। (\"x return\") in Hindi, x திருப்பு; in Tamil.",
        "Reuse the AST for an interpreter, a multilingual view renderer and a C99 backend.",
        "Take the idea down to bare metal: a RISC-V kernel whose crash screens use text shaped at build time.",
      ],
      architecture: `source (any mix of en / hi / ta)
   │  lexer: UAX #31 identifiers, NFKC,
   │  keyword lookup across packs, security checks
   ▼
language-neutral AST   ◄── no human language recorded
   │  checker: types, scopes, glossary-aware names
   ├──► interpreter        (omni run)
   ├──► view renderer      (omni view --to xx)
   └──► C99 backend        (omni c / omni build)

crates/omni-core   compiler library
crates/omni-cli    the omni binary + end-to-end tests
crates/omni-lsp    language server
editors/vscode     extension with generated grammar
kernel/            RISC-V: boot, traps, Sv39 paging, panic screen`,
      implementation: [
        "Glossaries map names across languages (total = कुल = மொத்தம்), so three people can write one program in three languages.",
        "Overflow and division by zero are errors, not undefined behaviour, in both the interpreter and the compiled C.",
        "Mixed-script names (pаypal with a Cyrillic а), bidi control characters and zero-width characters are compile errors, following Unicode UTS #39.",
        "Devanagari and Tamil need shaping, which a crashing kernel can't run, so the kernel's build.rs shapes and rasterizes every message ahead of time.",
        "Released as downloads for Windows, macOS and Linux, with Scoop and Homebrew packages.",
      ],
      result: [
        "About 60 unit and end-to-end tests: every example matches its recorded output in all three languages and as a native binary.",
        "CI on Linux and Windows, plus a QEMU kernel boot matrix and a VS Code end-to-end test.",
      ],
      decisions: [
        { title: "One AST, many surfaces", body: "Keeping the human language out of the AST is what makes translation between views, a single checker and a single code generator possible." },
        { title: "Security as compile errors", body: "A language that accepts many scripts must stop code that looks different from what it does, so lookalikes and hidden characters fail the build instead of producing a warning." },
        { title: "Data, not code", body: "Keywords and every diagnostic live in TOML, so native speakers can correct them without touching the compiler." },
      ],
      code: {
        label: "the same function, three languages",
        lang: "text",
        body: `fn square(x: int) -> int {               // English
    return x * x;
}
कार्य वर्ग(क: पूर्णांक) -> पूर्णांक {           // Hindi
    क * क लौटाओ।
}
செயல்பாடு வர்க்கம்(எ: முழுஎண்) -> முழுஎண் {   // Tamil
    எ * எ திருப்பு;
}`,
      },
    },
  },
  {
    slug: "netpulse",
    name: "NetPulse",
    title: ["NET", "PULSE"],
    tagline: "A real-time internet weather station in Go: DNS, HTTP and TCP probes reported as sunny, cloudy, rainy or stormy.",
    kind: "system",
    status: "shipped",
    stack: ["Go", "SQLite", "WebSockets", "REST APIs", "Docker", "CI/CD"],
    features: [
      "DNS, HTTP and TCP probes on per-target schedules",
      "HTTP phase breakdown: DNS → connect → TLS → server → download",
      "p50, p95, p99, jitter and uptime for every target",
      "Bounded worker pool with overlap protection and jittered startup",
      "Live dashboard over WebSockets, embedded in the binary",
      "REST API for targets, results, stats, history and weather",
      "Single static binary: pure-Go SQLite, no cgo",
      "Small non-root Docker image with a built-in health check",
    ],
    links: { github: `${GH}/netpulse` },
    screenshot: { src: "/projects/netpulse.webp", width: 1300, height: 1150, alt: "NetPulse dashboard with weather cards, latency sparklines and the HTTP phase breakdown" },
    caseStudy: {
      problem:
        "\"Is the internet slow, or is it just this site?\" Uptime checkers answer up or down; they don't show where the time goes, how latency is distributed, or what overall conditions look like across many endpoints.",
      approach: [
        "Probe DNS resolvers, websites and TCP endpoints on independent schedules.",
        "Time every HTTP request phase with httptrace on a fresh connection, so DNS, TLS and server time are separated.",
        "Store every result and compute percentiles, jitter and uptime per target.",
        "Summarise each target, and the whole set, as weather from the last 15 minutes of results.",
      ],
      architecture: `                 ┌──────────── scheduler ────────────┐
 config ──► per-target tickers ──► job queue ──► N workers ──► probe (dns | http | tcp)
                                                    │
                                                    ▼
                                         api.Server.HandleResult
                                       ┌────────────┴────────────┐
                                       ▼                         ▼
                                SQLite store              WebSocket hub ──► dashboards
                          (results, stats, history)    (drops slow clients)
                                       ▲
                     REST API ─────────┘`,
      implementation: [
        "Each target has its own ticker feeding a bounded worker pool, so a slow target never stacks up overlapping probes.",
        "TCP connect time stands in for ping, because ICMP needs root.",
        "SQLite runs in WAL mode with time-bucketed history and automatic retention pruning.",
        "The WebSocket hub drops slow clients instead of letting one stalled browser block the fan-out.",
        "Unknown config fields are rejected, so typos fail loudly.",
      ],
      result: [
        "One static binary or one docker compose up gives a live dashboard on :8080.",
        "Weather rules: sunny ≥ 99.5% uptime and p95 ≤ 250 ms; stormy below 80% uptime.",
      ],
      decisions: [
        { title: "Fresh connection per HTTP probe", body: "Reusing connections would hide DNS, connect and TLS time, which are exactly the phases worth measuring." },
        { title: "No cgo", body: "A pure-Go SQLite driver keeps the build a single cross-compilable binary with no C toolchain." },
        { title: "Embedded dashboard", body: "Vanilla JS and canvas, embedded in the binary — no build step and no frontend dependencies." },
      ],
    },
  },
  {
    slug: "maharashtra-election",
    name: "Maharashtra Election Forecasting",
    title: ["MAHARASHTRA", "ELECTION FORECAST"],
    tagline: "A seat-level model for all 288 assembly seats that survives two parties splitting and switching alliances.",
    kind: "system",
    status: "shipped",
    stack: ["Python", "scikit-learn", "Pandas", "NumPy", "Matplotlib", "pytest", "CI/CD"],
    features: [
      "Real constituency results from 2014, 2019 and 2024",
      "Alliance-aware data model: each party mapped to a camp per election",
      "Swing decomposition: last margin + statewide swing + seat deviation",
      "Out-of-time back-test on the 2024 election",
      "Monte Carlo simulator with correlated region, district and seat errors",
      "2029 forecast under swing scenarios",
    ],
    links: { github: `${GH}/Maharashtra-Assembly-Election-Forecasting-ML-Project` },
    metric: { value: "77.1%", label: "seats called in 2024 back-test" },
    screenshot: { src: "/projects/maharashtra-election.webp", width: 1050, height: 600, alt: "2029 NDA seat forecast across statewide swing scenarios with 90% intervals" },
    caseStudy: {
      problem:
        "Between 2019 and 2024, Shiv Sena and NCP both split and their halves joined opposite alliances. Seat-level margins between the two elections correlate at only 0.23, so a model that learns \"who won here last time\" breaks.",
      approach: [
        "Map every party to a camp per election, so SHS is NDA in 2019 while SHS (UBT) is UPA in 2024.",
        "Model a seat's next margin as last margin + statewide swing + seat deviation, and learn only the deviation.",
        "Treat the statewide swing as an input — the actual swing for back-testing, a scenario for the forecast.",
        "Size uncertainty from out-of-sample residuals and simulate 5,000 elections.",
      ],
      architecture: `public results 2014 · 2019 · 2024  (same 2008 delimitation)
                │
                ▼
   alliance-aware cleaning  (party → camp per election)
                │
                ▼
   seat features: camp shares, lean, turnout, ENP,
                  reservation, region, swing-projected margin
                │
      ┌─────────┴──────────┐
      ▼                    ▼
 Ridge: seat deviation   logistic: P(neither camp wins)
      └─────────┬──────────┘
                ▼
   Monte Carlo × 5,000  (region · district · seat errors)
                │
                ▼
   seat probabilities · seat-total intervals · P(majority ≥ 145)`,
      implementation: [
        "Trained on 2014 → 2019, selected by 5-fold CV, then back-tested out of time on 2019 → 2024.",
        "Ridge was selected over random forest and gradient boosting on training-CV error.",
        "Tests check that the cleaned data reproduces official tallies (BJP won 122, 105 and 132 seats).",
        "The final model is refit on both labelled transitions for the 2029 forecast.",
      ],
      result: [
        "77.1% of seats called correctly in the 2024 back-test, against 68.8% for uniform swing and 58.0% for persistence.",
        "Reported honestly: the simulated 90% interval for NDA seats (175–209) missed the actual 235.",
      ],
    },
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const caseStudies = projects.filter((p) => p.caseStudy || p.private);
