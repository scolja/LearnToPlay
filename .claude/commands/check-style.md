# Check Style Guide Compliance

Validate a game teaching guide against the design system and style guide specifications. This is a focused structural/formatting check (not a factual accuracy review — use /review-guide for that).

## Input

File to check: $ARGUMENTS

If no file is specified, check `games/` for available guides and ask which one to check.

## Checks

Read the guide file and `game-teaching-style-guide.md`, then run these automated checks:

### 1. HTML Structure

- [ ] DOCTYPE, html lang, charset, viewport meta tags present
- [ ] Google Fonts link with correct families and weights
- [ ] Single `<style>` block (no external CSS files)
- [ ] Single `<script>` block at end of body
- [ ] `<header class="hero">` present with badge, h1, subtitle, meta
- [ ] `<div class="page-wrap">` wrapping all content sections
- [ ] `<footer class="footer">` with attribution

### 2. CSS Custom Properties

Verify all required variables are defined in `:root`:
- `--bg`, `--bg-sidebar`, `--bg-dark`
- `--text`, `--text-light`, `--text-muted`
- `--gold`, `--red`, `--green`, `--blue`
- `--border`
- `--font-display`, `--font-body`, `--font-ui`
- `--main-width` (560px), `--sidebar-width` (320px), `--gap` (48px)

### 3. Section Structure

For each `<section class="row">`:
- [ ] Contains `<div class="main">` and `<div class="side">`
- [ ] Main has a `.step-tag` and `h2`
- [ ] Step tags are sequential (Step 1, Step 2, ...)
- [ ] Side contains 1-3 `.side-card` elements
- [ ] Each `.side-card` has a `.side-card-label` with a color class

For full-width sections (knowledge check, production notes):
- [ ] Uses `class="row full-width"`

### 4. Component Usage

**Rule boxes:**
- Count per step (max 2)
- Verify `.danger` class used only for penalty/failure rules
- Check that each has `<strong>` for the rule statement

**Sidebar cards:**
- Count per step (max 3)
- Verify label color distribution across the page
- Check that labels use correct color classes (gold/red/green/blue/purple)

**Visual aids (NO media-ph placeholders):**
- [ ] No `.media-ph` elements remain in the HTML content
- Inline SVG diagrams use game-specific colors and `DM Sans` font
- Interactive demos have labeled titles and functional JS handlers
- `.diagram` containers have rounded corners and appropriate backgrounds
- [ ] Real images (if present) use `/images/[game-name]/` path format
- [ ] Real images have descriptive `alt` text and publisher credit captions
- [ ] Real images are web-optimized (<400KB each, max 1000px wide)

**Flow diagrams:**
- Max 3-4 boxes per flow
- Correct box classes (`.fb-dark`, `.fb-gold`, `.fb-red`, `.fb-green`)

**Tables:**
- Use `.rtable` class
- Have `<thead>` and `<tbody>`

**Knowledge checks:**
- 2-4 `.kcheck` blocks
- Each has `h4`, `.kc-q`, `.kc-opts`, feedback divs
- Feedback divs have correct IDs matching the onclick handlers
- Quiz JS function `ans()` is defined in the script block

**Interactive reinforcement mini-games (MDX guides):**
- 2-4 mini-game components total across the guide
- Mini-game types are varied (not all `<KnowledgeCheck>`)
- Components used: `<KnowledgeCheck>`, `<SequenceSort>`, `<MatchUp>`, `<ScenarioChallenge>`, `<SpotTheError>`
- Mini-games are placed between `<StepRow>` sections (not inside them)
- Each mini-game uses the `.mini-game` base class (except KnowledgeCheck which uses `.kcheck`)
- SequenceSort: has `items` array with `text` and `position` props, position values are sequential
- MatchUp: has `pairs` array with `left` and `right` props, minimum 3 pairs
- ScenarioChallenge: has `scenario` text and `choices` array with `quality` values (best/good/suboptimal)
- SpotTheError: has `scenario` text and `statements` array, exactly one statement has `isError: true`

### 5. Responsive CSS

Verify media queries exist for:
- `@media (max-width: 960px)` — grid collapses to single column, sidebar loses sticky
- `@media (max-width: 600px)` — hero padding reduces, strips go to fewer columns

### 6. Footnotes

- [ ] Footnote CSS classes defined (`.fn-ref`, `.fn-section`, `.fn-item`, `.fn-toggle`)
- [ ] Footnote JS for toggle behavior present
- [ ] Footnotes are hidden by default
- [ ] Sequential numbering matches between refs and definitions
- [ ] No orphan references or definitions

### 7. Quick Reference Glossary

- [ ] `.qref-toggle` button present (fixed position, bottom-right)
- [ ] `.qref-panel` with header, search input, and body
- [ ] 15-30 `.qref-item` entries covering all game terms
- [ ] Each item has `.qref-term`, `.qref-step`, `.qref-def`
- [ ] `data-terms` attributes include search keywords
- [ ] `toggleQref()` and `filterQref()` JS functions defined
- [ ] Alphabetical ordering of terms

### 8. Footer

- [ ] Designer attribution
- [ ] Artist attribution (if known)
- [ ] Publisher attribution with link
- [ ] Copyright year
- [ ] "Independent educational resource" disclaimer

## Output Format

```
STYLE CHECK: [game-name]-learn.html
═══════════════════════════════════

✅ PASS (N items)
- [list of passing checks]

⚠️ WARNINGS (N items)
- [Location]: [what's wrong] → [what it should be]

❌ FAILURES (N items)
- [Location]: [what's wrong] → [what it should be]

SUMMARY: N/N checks passing. [Overall assessment]
```
