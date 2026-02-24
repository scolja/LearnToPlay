# Review Game Teaching Guide

Thoroughly review an existing game teaching guide for accuracy, style compliance, pedagogical quality, and completeness.

## Input

File to review: $ARGUMENTS

If no file is specified, check `games/` for available guides and ask which one to review.

## Review Process

Read the guide file completely. Then read `game-teaching-style-guide.md` for the standards to check against. Conduct the following review passes:

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
- [ ] Rule boxes: max 2 per step, gold or danger variant
- [ ] Sidebar cards: max 3 per step, correct color classes
- [ ] Flow diagrams: max 3-4 boxes
- [ ] Media placeholders: specific actionable descriptions, placed after text
- [ ] Tables: dark header, alternating rows
- [ ] Knowledge check: 2-4 questions, concrete scenarios, immediate feedback

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

**Knowledge check:**
- [ ] Questions target commonly misunderstood rules (not trivia)
- [ ] Scenarios are concrete, not abstract
- [ ] Feedback explains WHY and references the relevant step
- [ ] Wrong answers reflect actual common mistakes

**Sidebar quality:**
- [ ] Cards align with their main column content
- [ ] Color distribution roughly: 30% green, 25% red, 25% gold, 15% blue, 5% purple
- [ ] Analogies to other games are apt and widely known
- [ ] Common mistakes match actual community confusion (verifiable on BGG)

---

### Pass 4: Completeness

- [ ] Hero section: badge, title, subtitle, meta bar with all game info
- [ ] `heroImage` set in frontmatter if box art or suitable image exists in `public/images/[game-name]/`
- [ ] All core rules covered (compare against rulebook table of contents)
- [ ] Setup section present and comes after gameplay
- [ ] Complete turn/round summary as final gameplay step
- [ ] Knowledge check present with 2-4 questions
- [ ] No media-ph placeholder boxes remain — all replaced with inline SVG/HTML diagrams
- [ ] Visual aids are relevant and accurately represent the mechanics described
- [ ] Quick reference glossary present with 15-30 game terms
- [ ] Footer with correct attribution and disclaimer
- [ ] Footnotes present with source citations

---

### Pass 5: Visual Aids, Images & Interactive Elements

- [ ] All media placeholders replaced with inline SVG/HTML/CSS diagrams or real images
- [ ] SVG diagrams use correct game-specific colors and terminology
- [ ] Interactive demos function correctly (click handlers, result display)
- [ ] Visual aids placed AFTER the text they illustrate
- [ ] One visual aid per step maximum
- [ ] **Real images:** Check if publisher press kit images are available in `public/images/[game-name]/`
  - If images exist, verify they are used where appropriate (component close-ups, game-in-action, setup spread)
  - If no images exist, check if a press kit is available from the publisher that should have been sourced
  - Verify image `alt` text is descriptive and includes component names
  - Verify images have captions crediting the publisher
  - Verify images are web-optimized (check file sizes — should be <400KB each)
  - Verify image paths use `/images/[game-name]/filename.ext` format

---

### Pass 6: Quick Reference & Footnotes

- [ ] Quick reference glossary panel present with floating toggle button
- [ ] All bolded game terms have corresponding glossary entries
- [ ] Search/filter functionality works
- [ ] Each glossary entry references the correct step
- [ ] Key rule claims have footnotes citing specific sources
- [ ] Footnotes reference real, verifiable sources (rulebook pages, FAQ URLs, BGG threads)
- [ ] Footnote numbering is sequential and consistent within each step
- [ ] Footnote toggle/collapse JS is functional
- [ ] No "orphan" footnotes (referenced but not defined, or defined but not referenced)

---

## Output Format

Produce a structured review report with:

1. **Summary** — Overall quality rating (Excellent / Good / Needs Work / Major Issues) and 2-3 sentence overview
2. **Critical Issues** — Any factual errors or rules contradictions (must fix)
3. **Style Issues** — Deviations from the style guide (should fix)
4. **Pedagogical Notes** — Suggestions for teaching quality improvements (nice to fix)
5. **Completeness Gaps** — Missing sections or content (should fix)
6. **Footnote Status** — Are sources properly cited? What needs citations?
7. **Strengths** — What the guide does well (important for morale and consistency)

For each issue, include:
- Location (step, element type)
- What's wrong
- What it should be
- Priority (Critical / High / Medium / Low)
