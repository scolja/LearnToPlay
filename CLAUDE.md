# BoardGameTeacher

Interactive "Learn to Play" teaching pages for board games, built with Next.js and MDX.

## Project Structure

```
BoardGameTeacher/
├── CLAUDE.md                          # This file
├── game-teaching-style-guide.md       # Complete design system & style guide
├── package.json                       # Next.js project dependencies
├── next.config.ts                     # Static export configuration
├── tsconfig.json                      # TypeScript configuration
├── azure-pipelines.yml                # CI/CD pipeline
│
├── content/games/                     # Guide source files (MDX)
│   └── [game-name].mdx               # One MDX file per game
│
├── public/images/                     # Game images (from press kits)
│   └── [game-name]/                   # One folder per game
│       ├── cards.png                  # Component close-ups
│       ├── components.jpg             # Full component spread
│       └── ...                        # Other optimized images
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (fonts, metadata)
│   │   ├── page.tsx                   # Homepage listing all guides
│   │   ├── globals.css                # Design system CSS
│   │   └── games/[slug]/
│   │       └── page.tsx               # Dynamic game guide page (SSG)
│   ├── components/                    # Reusable guide components
│   │   ├── Hero.tsx                   # Hero banner
│   │   ├── StepRow.tsx                # Two-column step layout
│   │   ├── SideCard.tsx               # Dark sidebar card
│   │   ├── RuleBox.tsx                # Gold/danger rule highlight
│   │   ├── FlowDiagram.tsx            # Horizontal flow chain
│   │   ├── KnowledgeCheck.tsx         # Interactive quiz
│   │   ├── Footnotes.tsx              # Collapsible source citations
│   │   ├── QuickReference.tsx         # Floating glossary panel
│   │   ├── EvalStrip.tsx              # Scoring phase strip
│   │   ├── SummaryPanel.tsx           # Dark numbered summary
│   │   ├── GameTable.tsx              # Styled table wrapper
│   │   ├── Footer.tsx                 # Attribution footer
│   │   └── index.ts                   # Component map for MDX
│   └── lib/
│       ├── content.ts                 # MDX file loading & frontmatter parsing
│       └── types.ts                   # TypeScript interfaces
│
├── games/                             # Legacy standalone HTML guides (reference)
│   └── [game-name]-learn.html
│
└── .claude/commands/                  # Skills for creating and reviewing guides
    ├── create-guide.md                # /create-guide — Generate a new teaching page
    ├── review-guide.md                # /review-guide — Review an existing guide
    ├── research-game.md               # /research-game — Pre-research a game
    └── check-style.md                 # /check-style — Validate style compliance
```

## Tech Stack

- **Next.js** with App Router and `output: 'export'` for static site generation
- **MDX** via `next-mdx-remote` for rich content with embedded React components
- **TypeScript** for type safety
- **Google Fonts** (Fraunces, Crimson Pro, DM Sans) loaded via `next/font/google`
- No Tailwind — the design system CSS is comprehensive and self-contained

## Key Conventions

- Each game guide is an **MDX file** in `content/games/[game-name].mdx` (lowercase, hyphenated).
- MDX files use **YAML frontmatter** for metadata (title, players, time, age, glossary, etc.).
- Guide content uses **React components** (`<StepRow>`, `<RuleBox>`, `<SideCard>`, etc.) for structure.
- All guides follow the design system in `game-teaching-style-guide.md`. Read it before creating or reviewing any guide.
- The design system CSS lives in `src/app/globals.css` — component classes match the style guide.
- Game-specific CSS (custom colors, inline tokens) can be added via `<style>` blocks in MDX.
- **Important MDX rule**: Markdown syntax (`**bold**`, `*italic*`) is NOT processed inside JSX expression props (like `sidebar={<>...</>}`). Use HTML tags (`<strong>`, `<em>`, `<p>`) instead inside sidebar content and other JSX props.
- Guides include **collapsible footnotes** via `<Footnotes>` that reference original rule sources.
- Guides include a **floating quick reference glossary** populated from frontmatter `glossary` entries.
- **Prefer real images from publisher press kits** over SVG diagrams for component photos, game-in-action shots, and setup spreads. SVG diagrams are better for annotated explanations and flow charts.
- Game images go in `public/images/[game-name]/` and are referenced as `/images/[game-name]/filename.ext` in MDX.
- All images must be web-optimized: max 800-1000px wide, <400KB each, with descriptive `alt` text and publisher credit captions.

## MDX Component Reference

| Component | Props | Description |
|-----------|-------|-------------|
| `<StepRow>` | `step`, `title`, `sidebar`, `fullWidth` | Two-column layout wrapper |
| `<SideCard>` | `label`, `color` (gold/red/green/blue/purple) | Dark sidebar card |
| `<RuleBox>` | `danger` (boolean) | Gold or red rule highlight box |
| `<FlowDiagram>` | `steps` (array of {label, variant}) | Horizontal flow chain |
| `<EvalStrip>` | `steps` (array of {num, label}) | Phase strip |
| `<SummaryPanel>` | `items` (array of {num, text}) | Dark numbered summary |
| `<GameTable>` | `headers`, `rows` | Styled table |
| `<KnowledgeCheck>` | `questions` (array) | Interactive quiz |
| `<Footnotes>` | `entries` (array of {num, text, url?}) | Collapsible source citations |

## Workflow

1. `/research-game [game name]` — Gather rules, FAQs, common mistakes, teaching tips, and press kit images
2. `/create-guide [game name]` — Generate the MDX teaching guide (using real images where available)
3. `/review-guide [file]` — Review for accuracy, style, image usage, and completeness
4. `/check-style [file]` — Validate structural and formatting compliance

## Build & Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build static site (outputs to out/)
npm run lint         # Run ESLint
```

## Rules for Guide Content

- Every rule in the main column MUST come from the official rulebook. No inferred or house rules.
- Strategy advice in sidebar cards can come from community consensus but must be labeled as strategy.
- Never forward-reference a concept before the step that teaches it.
- Main column must be complete on its own — sidebar is supplemental enrichment only.
- Footnotes should cite specific sources (rulebook page, FAQ entry, BGG thread) for verifiable claims.
