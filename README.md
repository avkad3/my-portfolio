# Aditya Kumar Vijay — Portfolio

Built with **Next.js 14**, **Tailwind CSS**, **Contentlayer**, and **Framer 


## Project Structure

```
my-portfolio/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home page (all sections)
│   ├── layout.tsx          # Root layout + metadata
│   ├── projects/           # Projects listing
│   └── projects/[slug]/    # Dynamic project pages
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── sections/           # Page sections (Hero, About, etc.)
│   ├── navbar.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── content/
│   └── projects/           # MDX project files (content-driven)
├── lib/
│   ├── utils.ts            # cn() helper
│   └── data.ts             # Resume data (centralized)
├── public/                 # Static assets
└── contentlayer.config.ts  # Content parsing config
```

## Customization Guide

### 1. Update Personal Info

Edit `lib/data.ts` — all your info is centralized there.

### 2. Add a New Project

Create a new `.mdx` file in `content/projects/`:



### 3. Add a New Section

1. Create `components/sections/your-section.tsx`
2. Import and add it to `app/page.tsx`

### 4. Add a Blog (Future)

1. Add `BlogPost` to `contentlayer.config.ts`
2. Create `content/blog/` folder
3. Add `app/blog/` route

### 5. Connect a CMS (Future)

Swap Contentlayer for Sanity, Contentful, or Notion API when you outgrow local files.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Content | Contentlayer + MDX |
| Animations | Framer Motion |
| Icons | Lucide React |
| Theme | next-themes (dark/light mode) |
| Deploy | Vercel |

## License

MIT — feel free to fork and customize.
