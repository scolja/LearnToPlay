# Create Game Teaching Guide

Generate a complete interactive "Learn to Play" teaching page for a board game.

## Input

Game name: $ARGUMENTS

## Process

### Phase 1: Research (if not already done via /research-game)

1. **Find the official rulebook.** Search for "[game name] official rulebook PDF" and "[game name] rules". Read the complete rules. This is the primary source for ALL rules content.

2. **Find official errata and FAQ.** Search the publisher's website and BoardGameGeek for corrections, clarifications, and FAQ entries.

3. **Find common mistakes.** Search BGG for threads like "[game name] rules we got wrong", "[game name] common mistakes", "[game name] FAQ". These become sidebar red cards.

4. **Find teaching tips.** Search for "how to teach [game name]" posts and videos. Note the recommended teaching order and effective analogies.

5. **Find reviews mentioning confusion.** Look for reviews that say "the rules were confusing about X" — these indicate where extra clarity is needed.

### Phase 1.5: Image Sourcing

If `/research-game` was run first, check `public/images/[game-name]/` for already-prepared images. If not, or if images are missing:

1. **Find the publisher's press kit.** Search for "[publisher] [game name] press kit" or check the publisher's resources page. Download any available ZIP files.

2. **Extract and review all images.** Catalogue what's available: component photos, card close-ups, game-in-action shots, box art, box back.

3. **Optimize for web.** Use ImageMagick or similar:
   - Resize to max 800-1000px wide
   - JPG quality 85 for photos, PNG for images needing transparency
   - Target <400KB per image
   - Save to `public/images/[game-name]/`

4. **Map images to steps.** Plan which image goes where:
   - Step 1 (Goal): Game-in-action or box back showing the game overview
   - Step 2 (Cards/Components): Close-ups of the main components players interact with
   - Setup step: Component spread showing everything laid out
   - Hero: Box cover art (if available and visually striking)

5. **Identify gaps.** For steps without suitable photos, plan SVG diagrams or CSS-based visuals instead.

### Phase 2: Content Planning

1. **Map the dependency graph.** Which concepts require which others? No concept may be referenced before it is taught.

2. **Determine step order.** Adapt the 12-step skeleton from the style guide:
   - Step 1: The Goal
   - Step 2: Core Action (what you DO on your turn)
   - Step 3: Fail State / Tension (what can go wrong)
   - Step 4: Mitigation (tools to manage risk)
   - Step 5: Scoring / Evaluation
   - Step 6: Engine Building / Economy
   - Step 7: Component Powers / Card Effects
   - Step 8: Secondary Currency (if applicable)
   - Step 9: Round-Start Events / Catch-Up
   - Step 10: Game Arc & Endgame
   - Knowledge Check (2-4 questions)
   - Step 11: Setup
   - Step 12: Complete Round/Turn Summary

3. **Identify sidebar content.** For each step, plan:
   - Gold cards: Key insights, helpful context
   - Red cards: Common mistakes (from research)
   - Green cards: Tips, strategy, examples
   - Blue cards: Analogies to other games
   - Max 3 cards per step

4. **Draft knowledge check questions.** Target the most commonly misunderstood rules. Use concrete scenarios, not abstract questions.

### Phase 3: Writing

Read `game-teaching-style-guide.md` thoroughly before writing. Follow every specification in it.

**Game-specific color adaptation:**
- Adjust `--bg`, `--bg-sidebar`, `--gold`, and accent colors to match the game's theme
- Keep semantic colors (red=warning, green=tip, blue=comparison) consistent
- Create game-specific inline token/chip classes for the game's components

**Content voice:**
- Main column: Terse, direct, second-person, present tense. "You draw a card." Not "The player draws a card."
- Sidebar: Conversational, warmer. "Think of it like..." Strategy opinions welcome.
- Rule boxes: Declarative and authoritative. State the rule AND its scope.

**Footnotes:**
- Add footnotes for rules claims, citing the specific source (rulebook page, FAQ entry, BGG thread)
- Use the footnote component: `<sup class="fn-ref" onclick="toggleFn(this)">N</sup>` in text
- Add corresponding `<div class="fn-item">` entries in a collapsible `<div class="fn-section">` at the bottom of each step's main column
- Include a `<button class="fn-toggle">` before each fn-section
- Footnotes are hidden by default — users click to reveal

**Visual Aids (NOT placeholders):**
- **Prefer real images from the publisher's press kit** when available (see Phase 1.5 below)
- Generate inline SVG diagrams for concepts that need annotated explanations (clock layouts, flow charts, formulas)
- Create small interactive HTML demos for core mechanics (e.g., dice rollers)
- Use HTML/CSS grids for component overviews (token types, card categories)
- Use dark-panel styled checklists for setup procedures
- One visual per step max. Place AFTER the text it illustrates.
- See the "Visual Aids" section in the style guide for SVG standards.

**Using Real Images:**
- Real images go in `public/images/[game-name]/` and are referenced as `/images/[game-name]/filename.ext`
- Wrap images in a centered container with rounded corners, shadow, and a caption crediting the publisher
- Optimize all images for web: max 800-1000px wide, <400KB each, JPG for photos, PNG for transparency
- Best uses for real images:
  - Component close-ups (cards, tokens) — teach what things look like
  - Game-in-action shots — show how the play area looks during a game
  - Component spreads — overview all pieces for the Setup step
- Use SVG diagrams when you need to annotate, label, or explain relationships between components
- A step can have both a real image AND an SVG diagram if they serve different purposes

**Quick Reference Glossary:**
- Add a floating quick-reference panel (bottom-right button) with all game terms
- Each term: click-to-expand definition, step reference, search keywords in data-terms
- Alphabetical order, 15–30 entries typical
- See the "Quick Reference Glossary" section in the style guide for CSS/HTML patterns.

### Phase 4: Assembly

Generate a single self-contained HTML file at `games/[game-name]-learn.html` containing:
- Complete `<style>` block with the full design system CSS + game-specific additions (including footnotes, quick reference, and diagram styles)
- All HTML content following the page structure with inline SVG/HTML diagrams (no placeholder boxes)
- Quick reference glossary panel (HTML before the script block)
- `<script>` block with quiz JS, footnotes JS, quick reference JS, and any interactive demo JS
- Footer with attribution and disclaimer

### Phase 5: Self-Review

Before delivering, verify:
- [ ] Every rule comes from the official rulebook
- [ ] No step forward-references a concept from a later step
- [ ] Main column is complete without sidebar
- [ ] Rule boxes max 2 per step
- [ ] Sidebar cards max 3 per step, color-coded
- [ ] Setup comes after all gameplay concepts
- [ ] Knowledge check targets common mistakes
- [ ] Responsive breakpoints work (960px, 600px)
- [ ] Footnotes cite specific sources (rulebook pages, FAQ URLs, BGG threads)
- [ ] All media-ph placeholders replaced with inline SVG/HTML diagrams
- [ ] Quick reference glossary contains all bolded game terms
- [ ] Interactive demos work correctly (click handlers, output display)
