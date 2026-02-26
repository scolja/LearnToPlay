# BoardGameTeacher

Interactive "Learn to Play" teaching pages for board games, built with Next.js. **Mobile is the first-class citizen** — the primary experience is the mobile card-based learn flow (`/games/[slug]/learn`).

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
│       ├── content.ts                 # Legacy MDX file loading (not used by main pages)
│       ├── section-renderer.ts        # Markdown → HTML rendering with token preprocessing
│       ├── types.ts                   # TypeScript interfaces
│       ├── db.ts                      # SQL Server connection pool
│       └── repositories/
│           ├── section-repository.ts  # Reads from ltp.Guides/GuideSections/GlossaryEntries (ACTIVE)
│           └── guide-repository.ts    # Reads from ltp.GuideVersions_MDX_Legacy (LEGACY — history/edit only)
│
├── database/                          # SQL schema scripts (ltp schema)
│   ├── schema-current.sql             # Full current-state DDL (source of truth)
│   ├── 001_create_schema.sql          # Migration: Users, RefreshTokens, GuideVersions
│   └── 002_create_section_schema.sql  # Migration: Guides, GuideSections, GlossaryEntries
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

- **Next.js** with App Router
- **TypeScript** for type safety
- **Google Fonts** (Fraunces, Crimson Pro, DM Sans) loaded via `next/font/google`
- No Tailwind — the design system CSS is comprehensive and self-contained
- **SQL Server** database with `ltp` schema for guide storage and auth
- **marked** for server-side markdown → HTML rendering (section content is markdown, not MDX)

## Database Schema (`ltp` schema)

All tables live under the `ltp` schema. See `database/schema-current.sql` for the full DDL.

| Table | Purpose |
|-------|---------|
| `ltp.Users` | Authentication & identity (Google OAuth) |
| `ltp.RefreshTokens` | JWT refresh token store |
| `ltp.Guides` | Guide metadata (title, designer, publisher, hero image, etc.) |
| `ltp.GuideSections` | Ordered content sections — markdown + JSON `DisplayData` bag |
| `ltp.GlossaryEntries` | Searchable terms linked to guides and sections. `SectionId` must be populated — it powers glossary → learn page navigation with term highlighting |
| `ltp.GuideVersions_MDX_Legacy` | **LEGACY** — only used by history/edit pages, NOT the rendering pipeline |

Migration scripts in `database/` are numbered (`001_`, `002_`, ...) and represent the history of schema changes. The `schema-current.sql` file is the canonical reference for the deployed state.

**Important:** The active rendering pipeline reads from the **section-based tables** (`Guides` + `GuideSections` + `GlossaryEntries`). Both the homepage, desktop guide page (`/games/[slug]`), and mobile learn page (`/games/[slug]/learn`) use `section-repository.ts`. The legacy `GuideVersions_MDX_Legacy` table is only used by the edit/history/versioning features.

## Rendering Pipeline

Guide content flows through this pipeline:

```
ltp.GuideSections (markdown + DisplayData JSON)
  → section-renderer.ts: preprocessTokens() → marked → HTML content blocks
  → ContentBlockRenderer.tsx (mobile) or DesktopGuide.tsx (desktop)
```

### Section Content Format

Each `GuideSections` row has:
- **`Content`** — Markdown with custom directives and token syntax (see below)
- **`Notes`** — Markdown for sidebar/tip cards, separated by `\n---\n`, each starting with `**[color] Label**`
- **`DisplayData`** — JSON bag for rich content (diagrams, flows, tables, quizzes, HTML blocks)

### Token Syntax (preprocessTokens)

Inline game tokens use `[text]{.class}` syntax in section markdown. The `preprocessTokens()` function in `section-renderer.ts` converts these to `<span>` elements before the markdown parser runs.

**Auto-parent rule:** If the class has a hyphen and the prefix is 2–3 characters, the prefix is auto-added as a parent class:

| Syntax | Output HTML | Use Case |
|--------|-------------|----------|
| `[MOVE]{.act-move}` | `<span class="act act-move">MOVE</span>` | Action card token (prefix `act` = 3 chars) |
| `[Move]{.sk-move}` | `<span class="sk sk-move">Move</span>` | Skill token (prefix `sk` = 2 chars) |
| `[VICTIM]{.sc-victim}` | `<span class="sc sc-victim">VICTIM</span>` | Search card type (prefix `sc` = 2 chars) |
| `[]{.adr}` | `<span class="adr"></span>` | Adrenaline cube (standalone, no hyphen) |
| `[☠]{.corpse}` | `<span class="corpse">☠</span>` | Corpse token (standalone) |
| `[WYDELL]{.wydell-badge}` | `<span class="wydell-badge">WYDELL</span>` | Badge (prefix `wydell` > 3 chars, no parent) |
| `[3]{.str}` | `<span class="str">3</span>` | Strength value (standalone) |

The CSS classes for these tokens live in game-specific CSS files (see below).

### Content Directives

Section content supports these directive blocks (parsed by `section-renderer.ts`):

| Directive | DisplayData Key | Description |
|-----------|----------------|-------------|
| `:::callout` / `:::callout-danger` | — | Info or danger callout box (content is inline markdown) |
| `:::flow` | `flows: string[][]` | Horizontal flow chain (items from DisplayData, indexed) |
| `:::diagram` | `diagrams: string[]` | SVG diagram (HTML from DisplayData, indexed) |
| `:::strip` | `strip: {num, label}[]` | Phase/eval strip |
| `:::table` | `table: {headers, rows}` | Styled table |
| `:::quiz` | `quiz: {question, options, ...}[]` | Interactive quiz |
| `:::html-block` / `:::styled-block` | `htmlBlocks: string[]` | Raw HTML (indexed) |
| `:::grid-visual` | `gridVisuals: string[]` | Grid layout HTML (indexed) |
| `:::dice-roller` | — | Interactive dice roller |

**Indexed directives:** Some directives (flow, diagram, html-block, grid-visual) support multiple instances per section. The Nth occurrence in content maps to the Nth entry in the corresponding DisplayData array.

### Notes Format (Sidebar/Tip Cards)

The `Notes` field contains sidebar cards separated by `\n---\n`. Each card starts with a header line:

```markdown
**[gold] Key Concept**
The action chain is the heart of the game. Think of it as a conveyor belt.

---

**[red] Common Mistake**
New players forget that rightmost slots cost more cubes.

---

**[green] Strategy Tip**
Plan 2–3 turns ahead to keep frequently used cards in cheap slots.
```

Valid colors: `gold`, `red`, `green`, `blue`, `purple`

### Game-Specific CSS

Each game can have a CSS file at `src/styles/game-specific/[game-name].css` containing token classes, grid layouts, and other game-specific visual styles. Import it in `src/app/globals.css`.

Additionally, each guide's `ltp.Guides.CustomCss` field can contain CSS that gets injected as an inline `<style>` tag — use this for theme overrides (accent colors, rule box colors, etc.).

## Key Conventions

- **Guides are stored in the database**, not as files. The active data lives in `ltp.Guides` (metadata), `ltp.GuideSections` (content), and `ltp.GlossaryEntries` (glossary).
- Section content is **markdown with custom directives and token syntax** — not MDX or React components. See "Rendering Pipeline" above.
- All guides follow the design system in `game-teaching-style-guide.md`. Read it before creating or reviewing any guide.
- The design system CSS lives in `src/app/globals.css` — component classes match the style guide.
- Game-specific CSS (token classes, grid layouts) goes in `src/styles/game-specific/[game-name].css`, imported in `globals.css`.
- Theme overrides (accent colors, rule box colors) go in `ltp.Guides.CustomCss` and are injected as an inline `<style>` tag.
- **Prefer real images from publisher press kits** over SVG diagrams for component photos, game-in-action shots, and setup spreads. SVG diagrams are better for annotated explanations and flow charts.
- Game images go in `public/images/[game-name]/` and are referenced as `/images/[game-name]/filename.ext`.
- All images must be web-optimized: max 800-1000px wide, <400KB each, with descriptive `alt` text and publisher credit captions.
- **Hero background images**: Set `HeroImage` on the `ltp.Guides` row. The Hero component renders this as a blurred, dimmed background behind the title text.
- **Glossary `SectionId`**: Every `ltp.GlossaryEntries` row must have its `SectionId` populated, pointing to the `ltp.GuideSections` row where the term is best explained. This powers the mobile glossary's "jump to learn page" feature — tapping an arrow navigates to the correct section with the term highlighted in gold.
- **Mobile-first design**: Always consider how content renders on mobile before desktop. The `CardViewer` component renders sections as swipeable cards. Long sections, wide tables, and complex layouts should be tested at mobile widths. Keep flow diagrams to 3–4 short-labeled items, strips to ≤4 columns on mobile.

## Workflow

1. `/research-game [game name]` — Gather rules, FAQs, common mistakes, teaching tips, and press kit images
2. `/create-guide [game name]` — Write section content and publish to the database
3. `/review-guide [game name]` — Review for accuracy, style, mobile rendering, and completeness
4. `/check-style [game name]` — Validate structural and formatting compliance

## Publishing a New Guide

Creating a guide requires inserting rows into three tables:

1. **`ltp.Guides`** — One row with metadata (title, subtitle, designer, publisher, players, time, age, slug, heroImage, heroGradient, customCss)
2. **`ltp.GuideSections`** — One row per section (sortOrder, title, content, notes, displayData), linked to the guide via `GuideId`
3. **`ltp.GlossaryEntries`** — One row per term (term, definition, searchTerms, groupName, sortOrder), linked to guide AND section via `GuideId` and `SectionId`

Use the MCP mssql tools for queries. For multi-row inserts (sections, glossary), use individual INSERT statements — the MCP transaction tool is unreliable.

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
