# BoardGameTeacher

Interactive "Learn to Play" teaching pages for board games.

## Project Structure

```
BoardGameTeacher/
├── CLAUDE.md                          # This file
├── game-teaching-style-guide.md       # Complete design system & style guide
├── games/                             # Generated teaching pages
│   └── [game-name]-learn.html         # One self-contained HTML file per game
└── .claude/commands/                  # Skills for creating and reviewing guides
    ├── create-guide.md                # /create-guide — Generate a new teaching page
    ├── review-guide.md                # /review-guide — Review an existing guide
    ├── research-game.md               # /research-game — Pre-research a game
    └── check-style.md                 # /check-style — Validate style compliance
```

## Key Conventions

- Each game guide is a **single self-contained HTML file** with embedded CSS and JS. No external dependencies except Google Fonts.
- File naming: `games/[game-name]-learn.html` (lowercase, hyphenated).
- All guides follow the design system in `game-teaching-style-guide.md`. Read it before creating or reviewing any guide.
- The style guide defines: typography, color system, layout grid, component library, content voice, pedagogical framework, visual aids standards, and quick reference glossary.
- Guides use **inline SVG/HTML diagrams** instead of media placeholders — all visuals are generated and self-contained.
- Guides include **collapsible footnotes** that reference original rule sources. These are hidden by default (click to reveal) so they don't distract learners.
- Guides include a **floating quick reference glossary** with all game terms, searchable and click-to-expand.

## Workflow

1. `/research-game [game name]` — Gather rules, FAQs, common mistakes, teaching tips
2. `/create-guide [game name]` — Generate the full teaching page
3. `/review-guide [file]` — Review for accuracy, style, and completeness
4. `/check-style [file]` — Validate structural and formatting compliance

## Rules for Guide Content

- Every rule in the main column MUST come from the official rulebook. No inferred or house rules.
- Strategy advice in sidebar cards can come from community consensus but must be labeled as strategy.
- Never forward-reference a concept before the step that teaches it.
- Main column must be complete on its own — sidebar is supplemental enrichment only.
- Footnotes should cite specific sources (rulebook page, FAQ entry, BGG thread) for verifiable claims.
