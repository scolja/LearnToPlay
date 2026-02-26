# Review Game Teaching Guide

Thoroughly review an existing game teaching guide for accuracy, style compliance, pedagogical quality, and completeness.

## Input

Guide to review: $ARGUMENTS

If no guide is specified, query `ltp.Guides` for available guides and ask which one to review.

## Review Process

Query the guide's sections from `ltp.GuideSections` (via `section-repository.ts` or direct SQL). Read all section Content, Notes, and DisplayData. Then read `game-teaching-style-guide.md` for the standards to check against. Conduct the following review passes:

---

### Pass 1: Factual Accuracy

This is the most critical pass. Every rule stated in the main column must be verifiable against official sources.

1. **Search for the official rulebook** for this game. Read it.
2. **Search for official errata/FAQ** from the publisher.
3. **Cross-reference every rule claim** in the guide against the rulebook. Flag any:
   - Rules that contradict the rulebook
   - Rules that are partially correct but missing important nuance
   - Rules that appear to be inferred rather than explicitly stated
   - Rules from an older edition that may have changed
   - House rules presented as official rules
4. **Check sidebar strategy claims** against community consensus (BGG threads, reviews).
5. **Check game metadata** (player count, play time, age rating, designer, publisher) against BGG/publisher site.

Report format for this pass:
```
ACCURACY ISSUE: [CRITICAL/MINOR]
Location: Step N, paragraph/rule-box/sidebar
Claim in guide: "..."
Actual rule: "..."
Source: [rulebook page / FAQ / errata]
```

---

### Pass 2: Style Guide Compliance

Check against every specification in `game-teaching-style-guide.md`:

**Typography:**
- [ ] Correct font assignments (Fraunces for headings, Crimson Pro for body, DM Sans for UI)
- [ ] Correct size scale for each element type
- [ ] Google Fonts import includes all needed weights

**Colors:**
- [ ] CSS custom properties defined for all roles
- [ ] Semantic colors used correctly (red=warning, green=tip, blue=comparison)
- [ ] Sidebar label colors are the lighter variants for dark backgrounds
- [ ] Game-specific accent colors are thematically appropriate

**Layout:**
- [ ] Main column 560px, sidebar 320px, gap 48px
- [ ] Sidebar cards use `position: sticky; top: 1.5rem`
- [ ] Responsive breakpoints at 960px and 600px

**Components:**
- [ ] Callout boxes (:::callout / :::callout-danger): max 2 per section
- [ ] Sidebar tip cards: max 3 per section, correct color labels (gold/red/green/blue/purple)
- [ ] Flow diagrams: max 3-4 items with short labels (mobile-friendly)
- [ ] Tables: structured in DisplayData with headers and rows
- [ ] Inline tokens: use `[text]{.class}` syntax, game-specific CSS classes exist and are imported

**Token & directive syntax:**
- [ ] Token syntax `[text]{.class}` used consistently for game components
- [ ] Game-specific CSS file exists at `src/styles/game-specific/[game-name].css`
- [ ] CSS file imported in `src/app/globals.css`
- [ ] Token classes follow base+variant pattern (e.g. `.act` + `.act-move`)
- [ ] DisplayData JSON is valid and matches directive usage (flows count matches :::flow count, etc.)

**Content voice:**
- [ ] Main column: terse, direct, second-person, present tense
- [ ] No filler phrases ("Let's talk about...", "Now we're going to learn...")
- [ ] Bold for first mention of mechanical keywords
- [ ] Sidebar: conversational, strategy opinions labeled as strategy
- [ ] Rule boxes: declarative, include both rule and scope

---

### Pass 3: Pedagogical Quality

**Structure:**
- [ ] Follows the step skeleton (Goal → Core Action → Tension → Mitigation → ... → Setup → Summary)
- [ ] No forward-references (no concept used before the step that teaches it)
- [ ] Main column is complete without sidebar (the "sidebar-ignoring reader" test)
- [ ] "Can I Play Now?" test: by ~60% through, reader could attempt a game

**Step quality:**
- [ ] Each step teaches exactly one concept
- [ ] Step tags are sequential and correctly numbered
- [ ] H2 headings are concise and action-oriented
- [ ] Rule boxes highlight genuinely critical rules, not obvious ones

**Interactive reinforcement (mini-games):**
- [ ] Mini-game types are varied (not all quizzes — use SequenceSort, MatchUp, ScenarioChallenge, SpotTheError, KnowledgeCheck)
- [ ] Each mini-game targets commonly misunderstood rules, errata, or FAQ material (not trivia)
- [ ] Scenarios are concrete, not abstract
- [ ] Feedback explains WHY and references the relevant step
- [ ] Wrong answers / error statements reflect actual common mistakes from research
- [ ] Breakpoints are placed at natural conceptual boundaries (roughly every 3 steps)
- [ ] Breakpoints are skipped where recent steps don't warrant reinforcement
- [ ] No mini-game tests concepts not yet taught in preceding steps
- [ ] Guide has 2–4 reinforcement breaks total (quality over quantity)

**Sidebar quality:**
- [ ] Cards align with their main column content
- [ ] Color distribution roughly: 30% green, 25% red, 25% gold, 15% blue, 5% purple
- [ ] Analogies to other games are apt and widely known
- [ ] Common mistakes match actual community confusion (verifiable on BGG)

---

### Pass 4: Completeness

- [ ] Guide metadata in `ltp.Guides`: title, subtitle, designer, publisher, players, time, age, bggUrl
- [ ] `HeroImage` or `HeroGradient` set for homepage thumbnail
- [ ] `CustomCss` set with theme overrides if game has a distinct visual identity
- [ ] All core rules covered (compare against rulebook table of contents)
- [ ] Setup section present and comes after gameplay
- [ ] Complete turn/round summary as final gameplay section
- [ ] Visual aids (:::html-block, :::flow, :::diagram) are relevant and accurate
- [ ] Glossary entries in `ltp.GlossaryEntries` with 15-30 game terms
- [ ] Every glossary entry has `SectionId` populated (powers mobile navigation)
- [ ] All bolded game terms have corresponding glossary entries

---

### Pass 5: Visual Aids & Images

- [ ] Visual aids use directives (:::html-block, :::diagram, :::flow) with matching DisplayData
- [ ] DisplayData JSON is valid — indexed arrays match directive count
- [ ] SVG/HTML diagrams use correct game-specific colors and terminology
- [ ] Visual aids placed AFTER the text they illustrate
- [ ] One visual per section maximum
- [ ] **Real images:** Check if publisher press kit images are available in `public/images/[game-name]/`
  - If images exist, verify they are used where appropriate
  - Verify images are web-optimized (<400KB each)
  - Verify image paths use `/images/[game-name]/filename.ext` format

---

### Pass 6: Mobile Rendering

**This is critical — mobile is the first-class citizen.** The primary experience is `/games/[slug]/learn` (card-based mobile flow).

- [ ] Flow diagrams have **3-4 short labels** (wraps at 2+2 on 375px screens — long labels break layout)
- [ ] Strips have **≤4 items** (the grid uses `repeat(4, 1fr)` on mobile; more items wrap awkwardly)
- [ ] HTML blocks in DisplayData render cleanly at mobile width (no horizontal overflow)
- [ ] Tip cards (sidebar notes) don't have bullet points touching the edge (ul/li have no bullets in tc-body)
- [ ] Inline tokens don't cause line-wrapping mid-token (tokens with long text may overflow)
- [ ] Section titles are concise (long titles truncate on mobile cards)
- [ ] Content blocks don't have excessive nesting or deeply indented lists

---

### Pass 7: Glossary & Data Integrity

- [ ] All glossary entries in `ltp.GlossaryEntries` have `SectionId` populated
- [ ] Each glossary entry's `SectionId` points to the section where the term is taught
- [ ] `SearchTerms` includes common synonyms/abbreviations
- [ ] No duplicate glossary entries for the same term
- [ ] Guide's `ltp.Guides` row has non-null: Slug, Title, Designer, Publisher, Players, Time, Age
- [ ] All `ltp.GuideSections` rows have `IsActive = 1` and sequential `SortOrder`

---

## Output Format

Produce a structured review report with:

1. **Summary** — Overall quality rating (Excellent / Good / Needs Work / Major Issues) and 2-3 sentence overview
2. **Critical Issues** — Any factual errors or rules contradictions (must fix)
3. **Style Issues** — Deviations from the style guide (should fix)
4. **Pedagogical Notes** — Suggestions for teaching quality improvements (nice to fix)
5. **Completeness Gaps** — Missing sections or content (should fix)
6. **Mobile Rendering Issues** — Flow/strip wrapping, overflow, token layout problems (should fix)
7. **Data Integrity** — Glossary SectionIds, DisplayData validity, missing metadata (should fix)
8. **Strengths** — What the guide does well (important for morale and consistency)

For each issue, include:
- Location (step, element type)
- What's wrong
- What it should be
- Priority (Critical / High / Medium / Low)
