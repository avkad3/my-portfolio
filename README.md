# ADITYA.OS

An interactive portfolio for **Aditya Vijay Kumar**, an AI/ML and backend engineer based in Mumbai. It's designed as an engineering operating system to explore, not a résumé to read.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · D3.js · FastAPI (optional assistant backend)

## Features

- **Command palette:** `Ctrl/⌘ K` opens a Raycast-style launcher with search, navigation and terminal commands (`help`, `whoami`, `projects`, `skills`, `experience`, `clear`, `sudo hire aditya`).
- **Hero system diagram:** an AI architecture whose nodes lean toward the cursor.
- **WHO_AM_I():** an interactive terminal.
- **System map:** a D3 force graph of projects connected by shared technologies.
- **PyCodeAtlas dependency graph:** zoom, pan, drag, inspect callers and callees, and simulate a deletion to see what breaks.
- **ADITYA.LAB:** a RAG pipeline visualizer that runs real retrieval over this site's content, an ASCII generator (image upload, webcam, 5 modes, Floyd-Steinberg, Atkinson and ordered dithering), the published RCAE scoring formula, and the dependency graph.
- **STACK.EXE:** a radial technology network. Hovering a technology shows the projects that used it.
- **ASK ADITYA:** an assistant grounded only in the portfolio's own data.
- **Case studies** at `/projects/[slug]`, each structured as Problem → Approach → Architecture → Implementation → Result → Technology.

## Editing content

All content lives in `src/data/`. Components never hard-code it.

| File | What it controls |
|---|---|
| `profile.ts` | Name, links, education, certifications, impact metrics, SEO |
| `experience.ts` | Timeline |
| `projects.ts` | Projects and case studies |
| `skills.ts` | STACK.EXE categories (project links are derived automatically) |
| `publications.ts` | Publications |
| `now.ts` | **Currently building**: focus, status, progress, last-updated date |

The assistant's knowledge base is generated from these same files (`src/lib/knowledge.ts`), so it stays in sync automatically.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Optional: set `NEXT_PUBLIC_SITE_URL` to the production URL so canonical and Open Graph links are correct.

## Assistant backend (optional)

By default, `/api/ask` answers locally with BM25 retrieval, intent reranking and a grounded extractive composer. No API key is needed.

To add LLM generation, run the FastAPI service in `assistant-api/`:

```bash
cd assistant-api
pip install -r requirements.txt
KNOWLEDGE_URL=https://<site>/api/knowledge ANTHROPIC_API_KEY=... uvicorn main:app --port 8000
```

Then set `ASSISTANT_API_URL=http://<host>:8000` for the Next.js app. API keys stay on the FastAPI server and are never sent to the browser. If the service can't be reached, the site falls back to local answers.
