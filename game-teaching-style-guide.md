# Game Teaching Page — Design System & Style Guide

> **Purpose:** This document defines the complete design system, content structure, pedagogical approach, and production standards for creating interactive "Learn to Play" pages for board games. Follow this guide to produce a consistent, high-quality teaching experience for any game.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Typography](#typography)
3. [Color System](#color-system)
4. [Layout & Spacing](#layout--spacing)
5. [Page Structure](#page-structure)
6. [Component Library](#component-library)
7. [Content Writing Guidelines](#content-writing-guidelines)
8. [Pedagogical Framework](#pedagogical-framework)
9. [Sidebar Strategy](#sidebar-strategy)
10. [Media & Placeholder Standards](#media--placeholder-standards)
11. [Knowledge Checks](#knowledge-checks)
12. [Production Notes Section](#production-notes-section)
13. [Research & Source Protocol](#research--source-protocol)
14. [Responsive & Print Considerations](#responsive--print-considerations)
15. [Checklist for New Games](#checklist-for-new-games)

---

## Design Philosophy

The aesthetic is **medieval apothecary meets modern editorial** — warm, textured, and inviting without being cluttered. The design should feel like a beautifully typeset guide you'd find in a specialty bookshop, not a wiki page or a generic SaaS dashboard.

### Core Principles

- **Warmth over sterility.** Parchment backgrounds, serif body text, and organic tones. Never cold grays or clinical whites.
- **Quiet confidence.** The design doesn't shout. Gold accents are used sparingly for hierarchy. Dark cards in the sidebar create contrast through material, not through neon colors.
- **Two reading speeds.** The main column is designed for a fast, complete read. The sidebar is for lingering. Both are satisfying independently.
- **Game-agnostic bones, game-specific skin.** The layout, typography, spacing, and component library stay the same across all games. Only the accent palette, hero treatment, and content change per game.

---

## Typography

### Font Stack

| Role | Font | Weights | Source |
|------|------|---------|--------|
| Display / Headings | **Fraunces** | 400, 700 (+ italic) | Google Fonts, optical size 9–144 |
| Body Text | **Crimson Pro** | 300, 400, 600, 700 (+ italic) | Google Fonts |
| UI / Labels / Sidebar | **DM Sans** | 400, 500, 600, 700 | Google Fonts |

### Google Fonts Import

```
https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&display=swap
```

### Usage Rules

- **Fraunces** — Hero title, section H2s, H3 subheadings, knowledge check headers, sidebar card content that needs a display feel. It's a variable optical-size serif with personality; use italic for emphasis in hero titles (e.g., game name in `<em>`).
- **Crimson Pro** — All body paragraph text in the main column. It's a highly readable serif at 18px with generous line-height. Never use it for labels or UI elements.
- **DM Sans** — Step tags, sidebar card labels, table headers, quiz options, meta text, captions, flow diagram boxes, production notes. It's the utilitarian workhorse. Always used at smaller sizes (10–14px) and often in uppercase with letter-spacing for labels.

### Size Scale

| Element | Font | Size | Weight | Line-Height | Notes |
|---------|------|------|--------|-------------|-------|
| Hero title | Fraunces | `clamp(2rem, 4.5vw, 3.2rem)` | 700 | 1.15 | Game name in italic gold |
| Hero subtitle | Crimson Pro | 1.05rem | 400 italic | — | `rgba(245,239,224,0.6)` |
| Hero meta | DM Sans | 12px | 400 | — | `rgba(245,239,224,0.45)` |
| Step tag | DM Sans | 10px | 700 | — | Uppercase, `letter-spacing: 3px`, gold |
| Section H2 | Fraunces | 1.65rem | 700 | 1.2 | — |
| Section H3 | Fraunces | 1.15rem | 700 | — | Margin: 1.4rem top, 0.5rem bottom |
| Body paragraph | Crimson Pro | 18px (1rem = 18px) | 400 | 1.7 | 0.8rem margin-bottom |
| Sidebar card body | DM Sans | 0.88rem (~15.8px) | 400 | 1.6 | Light text on dark bg |
| Sidebar card label | DM Sans | 10px | 700 | — | Uppercase, `letter-spacing: 2px` |
| Table header | DM Sans | 11px | 600 | — | Uppercase, `letter-spacing: 1px` |
| Table cell | DM Sans / Crimson Pro | 0.88rem | 400 | — | — |
| Rule box text | Crimson Pro | 18px (inherits body) | 400 | 1.7 | Same as body |
| Flow box | DM Sans | 12px | 600 | — | White-space: nowrap |
| Quiz option | DM Sans | 13px | 400 | — | — |
| Media placeholder desc | DM Sans | 12px | 400 | — | Muted color |

---

## Color System

### CSS Custom Properties

```css
:root {
  /* Backgrounds */
  --bg:          #f6f1e7;     /* Main page parchment */
  --bg-sidebar:  #2a2318;     /* Sidebar card background */
  --bg-dark:     #1a1612;     /* Hero, eval strips, dark panels */

  /* Text */
  --text:        #2c2418;     /* Primary body text */
  --text-light:  #f5efe0;     /* Text on dark backgrounds */
  --text-muted:  rgba(44,36,24,0.55);  /* Captions, secondary info */

  /* Accents */
  --gold:    #c9a94e;   /* Primary accent — headings, labels, highlights */
  --red:     #b93e3e;   /* Warnings, danger rule boxes, explosions */
  --green:   #4a7c59;   /* Tips, examples, correct answers */
  --blue:    #4a6fa5;   /* Comparisons, analogies, animations */
  --purple:  #7a5195;   /* Purple ingredient / optional secondary accent */
  --orange:  #d4802a;   /* Orange ingredient */
  --yellow:  #c4a72e;   /* Yellow ingredient */

  /* Borders */
  --border: rgba(44,36,24,0.1);  /* Section dividers, table borders */
}
```

### Game-Specific Color Adaptation

The above palette was designed around Quacks' medieval/apothecary theme. For other games, you may adjust the **accent colors** and **background tones** while keeping the structural roles the same:

| Role | Must Stay Consistent | Can Adapt Per Game |
|------|---------------------|--------------------|
| `--bg` (parchment) | General warmth | Could shift cooler for a sci-fi game (e.g., `#e8edf2`) |
| `--bg-sidebar` | Dark, high-contrast | Could shift to deep navy, charcoal, etc. |
| `--gold` (primary accent) | Used for all labels, step tags, active states | Could become a thematic accent (teal for ocean games, copper for steampunk) |
| `--red` / `--green` / `--blue` | Semantic roles (warning / tip / comparison) | Keep these semantic; don't swap their meanings |
| Chip/ingredient colors | Game-specific | Map to whatever components the game uses |

### Sidebar Card Label Colors

These are lighter/more saturated versions of the semantic colors, designed for readability on `--bg-sidebar`:

```css
.side-card-label.gold   { color: #c9a94e; }  /* Key info */
.side-card-label.red    { color: #e87070; }  /* Common mistakes */
.side-card-label.green  { color: #7cc98e; }  /* Tips, examples, strategy */
.side-card-label.blue   { color: #7eaee0; }  /* Comparisons, analogies */
.side-card-label.purple { color: #b899d4; }  /* Optional extra accent */
```

---

## Layout & Spacing

### Grid Structure

```
┌──────────────────────────────────────────────────────────┐
│                         HERO                             │
│                    (full width, dark)                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─── Main (560px) ────┐   gap   ┌─ Sidebar (320px) ─┐ │
│   │                     │  48px   │                    │ │
│   │  Step tag           │         │  ┌──────────────┐  │ │
│   │  H2 heading         │         │  │  Dark card   │  │ │
│   │  Body text...       │         │  │  (sticky)    │  │ │
│   │  Rule box           │         │  └──────────────┘  │ │
│   │  Media placeholder  │         │  ┌──────────────┐  │ │
│   │  More text...       │         │  │  Dark card   │  │ │
│   │                     │         │  └──────────────┘  │ │
│   └─────────────────────┘         └────────────────────┘ │
│   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ border ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│   (next row)                                             │
└──────────────────────────────────────────────────────────┘
```

### Key Measurements

| Property | Value | Notes |
|----------|-------|-------|
| Main column width | `560px` | Wide enough for body text + inline chips; narrow enough to feel editorial |
| Sidebar width | `320px` | Fits ~35 chars per line at 15.8px DM Sans — comfortable for card text |
| Column gap | `48px` | Generous separation so columns feel independent |
| Max page width | `main + gap + sidebar + 80px` (~1008px) | Centered with `margin: 0 auto` |
| Page horizontal padding | `2rem` (32px) | Applied to `.page-wrap` |
| Row vertical padding | `2.5rem` top and bottom | Each step section |
| Row border | `1px solid var(--border)` bottom | Subtle section separator |
| Sidebar `position: sticky; top: 1.5rem` | — | Cards follow scroll within their row |
| Sidebar card gap | `1rem` between cards | — |
| Sidebar card padding | `1.2rem 1.3rem` | — |
| Sidebar card border-radius | `10px` | — |

### Spacing Rhythm

Body text margin-bottom: `0.8rem`. This is tighter than the first version to reduce total scroll length. Headings (H3) have `1.4rem` top margin to create breathing room before new subsections. Rule boxes and media placeholders have `1rem` vertical margin. The overall rhythm should feel steady and scannable — never cramped, never wasteful.

---

## Page Structure

The page follows a strict sequence. Every game teaching page should use this skeleton:

### Section Order

```
1. HERO
   - Badge ("Interactive Lesson")
   - Title ("Learn to Play [Game Name]")
   - Subtitle (one-line genre/designer description)
   - Meta bar (player count, time, age)

2. STEP 1: The Goal
   - What is this game about? (1–2 paragraphs max)
   - One-sentence summary in a rule box
   - Game-in-progress photo placeholder

3. STEP 2: The Core Action
   - What do you physically DO on your turn / during the main phase?
   - How does the primary game component work (board, cards, bag, etc.)?

4. STEP 3: The Fail State / Tension Mechanic
   - What can go wrong? (Explosions, busting, elimination, penalties)
   - What's the consequence?

5. STEP 4: Mitigation / Safety Valve
   - What tools soften the fail state? (Flask, special powers, insurance)

6. STEP 5: Scoring / Evaluation
   - How is a round scored?
   - What's the sequence of post-action steps?

7. STEP 6: Engine Building / Economy
   - How do you improve your position between rounds?
   - Buying, upgrading, drafting — whatever the game uses

8. STEP 7: Component Powers / Card Effects
   - What do the different pieces/cards/ingredients DO?
   - Immediate vs. delayed effects

9. STEP 8: Secondary Currency / Resources
   - Any secondary economy (rubies, gold, influence, etc.)

10. STEP 9: Round-Start Events / Catch-Up Mechanics
    - Fortune/event cards, catch-up systems, variable setup per round

11. STEP 10: Game Arc & Endgame
    - How many rounds? What changes over time? How do you win?
    - Final-round specials, endgame scoring

12. KNOWLEDGE CHECK
    - 2–4 interactive quiz questions testing the rules taught so far

13. STEP 11: Setup
    - Full setup procedure — AFTER gameplay is understood
    - Starting components per player

14. STEP 12: Complete Round Summary
    - Compressed reference of the full turn/round sequence
    - "You're ready to play" sign-off

15. QUICK REFERENCE GLOSSARY
    - Floating panel with all game terms, click-to-expand definitions
    - Searchable, links to relevant steps

16. FOOTER
    - Copyright attribution to game publisher/designer/artist
    - "Independent educational resource" disclaimer
```

### Structural Adaptation Notes

Not every game maps perfectly to this 12-step skeleton. Adapt as follows:

- **Games without a fail state** (e.g., worker placement with no "bust"): Steps 3 and 4 can become "Constraints / Limitations" and "How to Mitigate Them" — what prevents you from doing everything you want, and what tools help.
- **Games with distinct phases** (e.g., action selection → resolution): Step 2 may split into 2a and 2b.
- **Games with no secondary currency**: Omit Step 8 or merge it into Step 6.
- **Games with player interaction as a core mechanic**: Add a step between 5 and 6 covering combat, trading, negotiation, or blocking.
- **Games with highly variable setup** (e.g., asymmetric factions): Setup may need to come earlier, or be split into "universal setup" (late) and "faction/character selection" (earlier, since it affects strategy).

The key rule: **never reference a concept before the step that teaches it.** If you need to reorder, trace the dependency chain and restructure accordingly.

---

## Component Library

### Rule Box

Used to highlight critical rules that must not be missed. Appears in the main column.

```html
<div class="rule-box">
  <p><strong>Rule text here.</strong> Additional clarification.</p>
</div>
```

- **Default (gold border):** For important-but-not-dangerous rules. `border: 2px solid var(--gold)`, `background: rgba(201,169,78,0.05)`.
- **Danger variant:** For rules involving penalties, failure, or common catastrophic mistakes. Add class `.danger`. `border-color: var(--red)`, `background: rgba(185,62,62,0.04)`.
- Use sparingly — max 2 per step. If everything is highlighted, nothing is.

### Sidebar Card

Dark card used in the sidebar column. Always sits on `--bg-sidebar` background.

```html
<div class="side-card">
  <span class="side-card-label gold">Label Text</span>
  <p>Card body text.</p>
</div>
```

Label color classes and their semantic meanings:

| Class | Color | Use For |
|-------|-------|---------|
| `.gold` | Gold | Key insights, helpful context, "good to know" |
| `.red` | Soft red | Common mistakes, gotchas, things people get wrong |
| `.green` | Soft green | Examples, tips, strategy advice, speed tips |
| `.blue` | Soft blue | Analogies to other games, comparisons, "like X" |
| `.purple` | Soft purple | Advanced/optional info, variant rules |

Maximum 3 sidebar cards per step. Typical: 1–2.

### Flow Diagram

Horizontal chain of labeled boxes connected by arrows. Used for showing consequences or sequences.

```html
<div class="flow">
  <span class="fb fb-green">Safe stop</span>
  <span class="fa">→</span>
  <span class="fb fb-gold">Get VP + Shop</span>
</div>
```

Box variants: `.fb-dark` (dark bg, gold text), `.fb-gold` (gold bg, dark text), `.fb-red`, `.fb-green`. Arrow: `.fa` (gold `→`).

Keep flows to 3–4 boxes max. If the sequence is longer, use the numbered-list dark panel (see Round Summary component).

### Evaluation Strip

Horizontal cells showing a phase sequence. Used for multi-step scoring or resolution phases.

```html
<div class="eval-strip">
  <div class="es"><span class="es-letter">A</span>Label</div>
  ...
</div>
```

6-column grid on desktop, 3-column on mobile. Dark background, gold letters.

### Round Timeline

Grid of round markers showing the game arc with special events.

```html
<div class="rounds">
  <div class="rd"><span class="rd-num">1</span></div>
  <div class="rd sp"><span class="rd-num">2</span>Event text</div>
  ...
</div>
```

9-column grid (adjust per game). `.sp` class adds gold border for rounds with special events.

### Inline Chip / Token

Circular inline elements representing game pieces. Adapt the color classes per game.

```html
<span class="chip cw">1</span>  <!-- white -->
<span class="chip co">1</span>  <!-- orange -->
<span class="chip cg">✦</span>  <!-- green -->
```

26px diameter default, 34px with `.chip-lg`. These are specific to chip-based games; for card-based games, create an equivalent inline card reference element with a rounded-rectangle shape instead.

### Starting Components Display

Centered flex container showing initial player components with quantity labels.

```html
<div class="start-bag">
  <div class="sb-group"><span class="sb-x">4×</span><span class="chip chip-lg cw">1</span></div>
  ...
</div>
```

### Dark Summary Panel

Used for the "Complete Round Summary" step — a dark-background numbered list.

```html
<div style="background:var(--bg-dark);color:var(--text-light);border-radius:10px;padding:1.3rem 1.5rem;">
  <div style="display:flex;gap:0.8rem;align-items:baseline;">
    <span style="color:var(--gold);font-weight:700;">1.</span>
    <span><strong>Phase Name</strong> — description</span>
  </div>
  ...
</div>
```

This should be formalized into a proper CSS class (`.summary-panel`, `.sp-item`) in the actual implementation.

### Tables

Used for ingredient/component reference, production asset lists, and comparison data.

```html
<table class="rtable">
  <thead><tr><th>Column</th><th>Column</th></tr></thead>
  <tbody><tr><td>Data</td><td>Data</td></tr></tbody>
</table>
```

Dark header row (gold text), alternating subtle row striping, `0.88rem` cell font size.

---

## Content Writing Guidelines

### Main Column Voice

- **Terse and direct.** Aim for the fewest words that fully convey each rule. If a paragraph can be one sentence, make it one sentence.
- **Second person ("you").** "You draw a chip." "Your pot explodes." Never third-person passive ("A chip is drawn by the player").
- **Present tense.** "You place the chip on the next space." Not "You will place..."
- **Bold for mechanical keywords.** First mention of a game term gets `<strong>`. Subsequent uses don't need it unless it's been several steps.
- **One concept per paragraph.** Short paragraphs (1–3 sentences) are ideal. Long paragraphs signal that you should split into a new H3 subsection.
- **No filler.** No "Let's talk about..." or "Now we're going to learn..." Just state the rule.
- **No opinions in the main column.** Save strategy advice, fun factor descriptions, and editorial for the sidebar.

### Sidebar Card Voice

- **Conversational and slightly warmer.** "Think of it like..." or "This trips up a lot of new players."
- **Can include strategy opinions.** "Experienced players often prefer X because Y."
- **Can reference other games by name.** "Like Blackjack, but..."
- **Short.** A sidebar card should rarely exceed 3–4 sentences. If it does, consider splitting into two cards.

### Rule Box Voice

- **Declarative and authoritative.** State the rule flatly. "Your pot explodes if white chips total more than 7."
- **Always includes both the rule AND its scope.** Don't just say what happens — clarify what doesn't count ("Only white chips. Colored chips are irrelevant.").
- **Danger boxes state the restriction first, then explain why.** "The flask cannot undo an explosion. If a white chip pushes you over 7, it's too late."

### Step Tag Naming

Use the pattern `Step N` with a plain sequential number. The H2 that follows should be a concise, action-oriented name:

- ✅ "The Goal" / "Explosions" / "Shopping — Buying New Ingredients"
- ❌ "Understanding the Mechanism of Potion Failure" / "Section 3: Important Rules About White Chips"

---

## Pedagogical Framework

### The Three Governing Rules

1. **Never forward-reference.** Every step may only use concepts taught in prior steps. If Step 5 mentions "rubies," rubies must have been introduced by Step 4 or earlier. Trace the dependency graph for each game and structure steps accordingly.

2. **Teach function before form.** Explain what a component DOES in gameplay before explaining how to set it up physically. This is why Setup is Step 11, not Step 1. By the time the reader reaches setup, every piece's purpose is already understood — setup becomes a quick checklist, not a confusing wall of context-free instructions.

3. **Main column = complete; sidebar = enriching.** A reader who ignores every sidebar card should still learn 100% of the rules. The sidebar adds WHY (strategy), WATCH OUT (mistakes), and LIKE (analogies). It never adds rules that aren't also in the main column.

### Techniques Applied

| Technique | How It's Used | Why It Works |
|-----------|---------------|--------------|
| **Progressive build** | Each step layers on the previous | Reduces cognitive load; no "wait, what's that?" moments |
| **Chunking** | 10–14 focused steps, one concept each | Working memory can hold ~4 chunks; each step is one chunk |
| **Dual coding** | Every rule paired with text + visual (chip icons, flow diagrams, media) | Information encoded in two modalities is retained better |
| **Anchoring** | "Like Blackjack" / "Like Mario Kart" in sidebar | Connecting new info to existing knowledge structures speeds learning |
| **Active recall** | Knowledge check quizzes mid-page | Testing yourself strengthens memory more than re-reading |
| **Error anticipation** | Red sidebar cards call out common mistakes alongside the relevant rule | Prevents the mistake before it happens, rather than correcting after |
| **Concrete before abstract** | Examples shown before/alongside formal rules | People understand specifics before generalizations |
| **Minimal effective dose** | Main column is as short as possible while being complete | Respects the reader's time; they came to play, not to study |
| **Spaced review** | The Knowledge Check and Round Summary revisit earlier rules | Retrieval practice at natural pause points |

### The "Can I Play Now?" Test

After reading any step, the reader should be able to answer: "Do I know enough to attempt a partial game up to this point?" By Step 5, the answer should be "yes, I could play a full round with basic scoring." By Step 10, "yes, I could play the whole game." Steps 11–12 are reference/setup material for the already-confident reader.

---

## Sidebar Strategy

### Alignment

Each sidebar card should **visually align** with the main column content it relates to. The `position: sticky; top: 1.5rem` CSS keeps the sidebar cards visible while scrolling through their parent row. This means sidebar content for Step 3 stays on screen while the reader scrolls through Step 3's main text.

### Card Count Per Step

| Step Content | Recommended Cards |
|--------------|-------------------|
| Simple, one-concept step | 1 card (tip or mistake warning) |
| Core mechanic introduction | 2 cards (analogy + common mistake) |
| Most complex step of the game | 2–3 cards (max) |

Never exceed 3 cards. If you have more than 3 things to say, promote the most important into the main column or combine sidebar points.

### Card Type Distribution

Across the full page, aim for this rough distribution:

- **30% green (tips/examples):** Strategy and examples help the most
- **25% red (common mistakes):** Error prevention is high-value
- **25% gold (key context):** Deeper understanding for curious readers
- **15% blue (analogies):** Game comparisons for fast pattern-matching
- **5% purple (advanced/variants):** Only where relevant

---

## Media & Visual Standards

Guides use **inline generated visuals** (SVG diagrams, HTML/CSS layouts, interactive demos) rather than placeholder boxes. All visuals are self-contained in the HTML — no external image files needed.

See the **Visual Aids** section below for the full specification of diagram types, SVG standards, and interactive demo guidelines.

### General Placement Rules

- One visual aid per step maximum (to avoid visual overload)
- Place AFTER the text it illustrates, not before — the reader should understand the concept first, then see it reinforced visually
- Exception: the Step 1 overview diagram can come after the rule box as a visual anchor
- Interactive demos should be clearly labeled with an uppercase title

---

## Knowledge Checks

### Placement

Insert one knowledge check block after approximately 70–80% of the rules have been taught (typically after Step 10, before Setup). This is the optimal retrieval practice point — enough has been learned to ask meaningful questions, but the setup and summary steps still provide a natural review afterward.

### Question Design

- **2–4 questions per check.** Enough to cover the critical rules without becoming a test.
- **Target the rules most commonly misunderstood.** Use community forums, FAQ threads, and BGG rules discussions to identify these.
- **Use concrete scenarios, not abstract questions.** "Your pot contains X, Y, Z — what happens?" not "Explain the explosion rule."
- **2–3 answer options per question.** Include the correct answer, one plausible-but-wrong answer based on common mistakes, and optionally one clearly wrong answer.
- **Immediate feedback.** On click, show a brief explanation of WHY the answer is correct or incorrect. Reference the step where the rule was taught.

### Implementation

```html
<div class="kcheck">
  <h4>🧪 Quick Check</h4>
  <div class="kc-q">Question text with inline chips if relevant</div>
  <div class="kc-opts" id="q1o">
    <div class="kc-opt" onclick="ans(this,'q1',1)">Correct answer</div>
    <div class="kc-opt" onclick="ans(this,'q1',0)">Wrong answer</div>
  </div>
  <div class="kc-fb" id="q1y">✅ Correct explanation</div>
  <div class="kc-fb" id="q1n">❌ Correction explanation</div>
</div>
```

The `ans()` function handles: marking selected option as right/wrong, dimming other options, displaying the appropriate feedback block.

---

## Source Footnotes

### Purpose

During guide development, footnotes allow authors and reviewers to verify that every rule claim traces back to an official source. For readers, footnotes are **hidden by default** — a small toggle at the bottom of each step reveals them. This keeps the learning experience clean while making the guide auditable.

### Design

Footnotes use superscript numbers inline (`¹`, `²`, etc.) that link to a collapsible footnotes section at the bottom of each step. The footnotes section is collapsed by default and revealed by clicking a toggle button.

- Inline references are small, unobtrusive superscript numbers
- The footnotes toggle sits at the bottom of the main column for each step
- When expanded, footnotes appear in a subtle, muted style that doesn't compete with the teaching content
- Numbering restarts at 1 for each step (Step 1 footnote 1, Step 2 footnote 1, etc.) to keep numbers small

### CSS

```css
/* ===================== FOOTNOTES ===================== */
.fn-ref {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
  cursor: pointer;
  text-decoration: none;
  vertical-align: super;
  line-height: 0;
  margin: 0 1px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.fn-ref:hover { opacity: 1; }

.fn-section {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  margin-top: 0.5rem;
}
.fn-section.open { max-height: 600px; }

.fn-toggle {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: all 0.2s;
}
.fn-toggle:hover {
  color: var(--gold);
  border-color: var(--gold);
}

.fn-item {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  padding: 0.2rem 0;
  border-top: 1px solid var(--border);
}
.fn-item:first-child { border-top: none; }
.fn-item .fn-num {
  color: var(--gold);
  font-weight: 600;
  margin-right: 0.3rem;
}
.fn-item a {
  color: var(--gold);
  text-decoration: none;
  opacity: 0.8;
}
.fn-item a:hover { opacity: 1; text-decoration: underline; }
```

### HTML Pattern

Inline reference (in body text):
```html
<p>You always succeed at your chosen action.<sup class="fn-ref" onclick="toggleFn(this)">1</sup></p>
```

Footnotes section (at the bottom of the step's main column, before the closing `</div>`):
```html
<button class="fn-toggle" onclick="toggleFnSection(this)">Sources ▸</button>
<div class="fn-section">
  <div class="fn-item"><span class="fn-num">1.</span> Official Rulebook, p. 12: "Actions always succeed; the cost determines the consequence."</div>
  <div class="fn-item"><span class="fn-num">2.</span> <a href="https://stonemaiergames.com/games/vantage/rules-faq/">Stonemaier FAQ</a>: Clarification on skill token usage.</div>
</div>
```

### JavaScript

```javascript
function toggleFnSection(btn) {
  const section = btn.nextElementSibling;
  const isOpen = section.classList.toggle('open');
  btn.textContent = isOpen ? 'Sources ▾' : 'Sources ▸';
}

function toggleFn(ref) {
  // Find the closest fn-section in the same step and open it
  const step = ref.closest('.main');
  const section = step.querySelector('.fn-section');
  const toggle = step.querySelector('.fn-toggle');
  if (section && !section.classList.contains('open')) {
    section.classList.add('open');
    if (toggle) toggle.textContent = 'Sources ▾';
  }
}
```

### Content Guidelines for Footnotes

- **Cite specific pages/sections** from the rulebook, not just "the rulebook"
- **Include URLs** for online sources (FAQ pages, BGG threads)
- **Cite the source, not the rule.** The footnote says WHERE the rule comes from, not a repeat of the rule itself
- **Prioritize footnotes on:** Rules that contradict common assumptions, rules from errata/FAQ (not in the printed rulebook), rules that are commonly misunderstood, and designer quotes
- **Don't footnote the obvious.** "Draw a card on your turn" doesn't need a footnote. "You cannot change your mind after reading the cost" does.

---

## Visual Aids

Instead of media placeholders, generate **inline visual aids** directly in the HTML using SVG, HTML/CSS diagrams, or small interactive elements. These are self-contained and require no external assets.

### Types of Visual Aids

| Type | Technology | Use For |
|------|-----------|---------|
| **Annotated Diagrams** | Inline SVG | Game component layouts, card anatomy, board overview, spatial relationships |
| **Interactive Demos** | HTML + JS | Dice rollers, token selectors, simple simulations of core mechanics |
| **Icon Grids** | HTML/CSS | Component overviews (storybooks, token types, card categories) |
| **Setup Checklists** | Styled HTML | Step-by-step setup procedures with visual numbering |
| **Flow Diagrams** | SVG or CSS flex | Turn sequences, consequence chains, decision trees |

### SVG Diagram Standards

- Use `viewBox` for responsive scaling: `<svg viewBox="0 0 WIDTH HEIGHT">`
- Set `style="width:100%;height:auto;"` for fluid sizing
- Use CSS custom property colors (`var(--gold)`, `var(--sk-move)`, etc.) when possible; otherwise use the hex values directly in SVG attributes
- Font: `font-family="DM Sans,sans-serif"` for all SVG text
- Label sizes: 7–10px for annotations, 10–12px for titles
- Use `opacity` and `stroke-dasharray` for empty/inactive states
- Wrap in a `.diagram` container with rounded corners and background

### Interactive Demo Standards

- Keep interactions simple: click/tap only, no drag-and-drop
- Use the dark panel style (`background: var(--bg-dark)`) for interactive areas
- Include a clear action button styled with gold border
- Show results in text below the interactive area
- All JS must be self-contained in the page's `<script>` block

### Placement Rules

- One visual aid per step maximum (to avoid visual overload)
- Place AFTER the text it illustrates (reader understands first, then sees it reinforced)
- Exception: Step 1 overview diagram can come after the rule box as a visual anchor
- Interactive demos should be clearly labeled ("Interactive: [Name]")

---

## Quick Reference Glossary

### Purpose

A floating, searchable panel containing all game terms and key rules as click-to-expand definitions. Provides quick lookups without leaving the learning flow.

### Design

- Fixed-position floating button (bottom-right corner) opens a panel
- Panel contains an alphabetical list of game terms
- Each term expands on click to show a brief definition
- A search input filters terms in real-time
- Each definition references the step where the concept is taught
- Panel is hidden by default — appears only when the user clicks the floating button

### CSS

```css
/* ===================== QUICK REFERENCE ===================== */
.qref-toggle {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-dark);
  border: 2px solid var(--gold);
  color: var(--gold);
  font-family: var(--font-ui);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  transition: all 0.2s;
}
.qref-toggle:hover { transform: scale(1.08); }

.qref-panel {
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  width: 340px;
  max-height: 70vh;
  background: var(--bg-dark);
  border: 1.5px solid rgba(201,169,78,0.3);
  border-radius: 12px;
  z-index: 999;
  box-shadow: 0 8px 40px rgba(0,0,0,0.4);
  overflow: hidden;
  display: none;
}
.qref-panel.open { display: flex; flex-direction: column; }

.qref-search {
  width: 100%;
  padding: 0.4rem 0.7rem;
  border-radius: 5px;
  border: 1px solid rgba(245,239,224,0.12);
  background: rgba(245,239,224,0.06);
  color: var(--text-light);
  font-family: var(--font-ui);
  font-size: 13px;
}

.qref-item {
  padding: 0.5rem 1.2rem;
  cursor: pointer;
}
.qref-term {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
}
.qref-def {
  font-family: var(--font-ui);
  font-size: 11px;
  color: rgba(245,239,224,0.55);
  display: none;
}
.qref-item.expanded .qref-def { display: block; }
```

### HTML Pattern

```html
<button class="qref-toggle" onclick="toggleQref()" title="Quick Reference">📖</button>
<div class="qref-panel" id="qref">
  <div class="qref-header">
    <h3>Quick Reference</h3>
    <input type="text" class="qref-search" placeholder="Search terms..." oninput="filterQref(this.value)">
  </div>
  <div class="qref-body">
    <div class="qref-item" onclick="this.classList.toggle('expanded')" data-terms="keyword1 keyword2">
      <span class="qref-term">Term Name</span><span class="qref-step">Step N</span>
      <div class="qref-def">Brief definition referencing where this is taught.</div>
    </div>
    <!-- More items... -->
  </div>
</div>
```

### Content Guidelines

- **Every game-specific term gets an entry.** If it's bolded on first mention in the guide, it belongs in the glossary.
- **Definitions should be 1-2 sentences max.** These are quick references, not re-teachings.
- **Include step references** so users can jump to the full explanation.
- **Add search keywords** in `data-terms` for synonyms and related concepts (e.g., a "Boost" entry should include "cube, knowledge, power" as search terms).
- **Alphabetical order** within the panel.
- **15-30 terms** is the typical range for most games.

---

## Research & Source Protocol

### Before Writing Any Game Page

1. **Find and read the official rulebook PDF.** Download and extract full text. This is the primary source for ALL rules content. Prefer the publisher's hosted version.

2. **Search for official errata or FAQ.** Check the publisher's website and BGG forums for corrections to the printed rules.

3. **Search for common rules mistakes.** Look for BGG threads like "Rules we got wrong," "Clarification of rules," "FAQ," and "How to teach [game]." These identify what the sidebar red cards should address.

4. **Search for teaching guides.** Community "how to teach" posts often reveal the best order to present rules and which analogies resonate.

5. **Search for reviews mentioning confusion.** Reviews that say "the rules were confusing about X" tell you where to add extra clarity.

### Content Integrity Rules

- **Every rule in the main column must come from the official rulebook.** No inferred, assumed, or house rules.
- **Strategy advice in sidebar cards can come from community consensus** but should be labeled as strategy, not rules.
- **Analogies to other games are original writing** — not sourced from anyone else's comparison.
- **When the rulebook is ambiguous, say so.** Don't silently pick an interpretation. Use a sidebar card: "The rulebook isn't 100% clear on this. Most players interpret it as X."

---

## Responsive & Print Considerations

### Breakpoints

| Width | Behavior |
|-------|----------|
| > 960px | Two-column grid: main + sidebar side by side |
| ≤ 960px | Single column: sidebar cards stack below their main section |
| ≤ 600px | Eval strips and round timelines reduce to 3-column grid. Reduce hero title size. |

### Mobile Sidebar Behavior

When the sidebar stacks below the main content, it loses its `position: sticky` and becomes a simple flex column. Cards should still be visually distinct (dark background) so they read as supplemental, not as continuation of the main text. Consider adding a subtle label like "💡 Extra Detail" above the sidebar stack on mobile.

### Print

- Sidebar loses sticky positioning; renders inline after main content
- Knowledge check interactivity is lost; consider showing all answers
- SVG diagrams print natively; interactive demos degrade to their static state
- `break-inside: avoid` on rule boxes, sidebar cards, and knowledge checks

---

## Checklist for New Games

Use this checklist when creating a teaching page for a new game:

### Research Phase
- [ ] Downloaded and read the full official rulebook
- [ ] Searched for errata and official FAQ
- [ ] Read 3+ BGG threads about rules confusion or common mistakes
- [ ] Read 1+ "how to teach this game" posts or watched teach videos
- [ ] Identified the core mechanic, fail state, economy, and catch-up mechanics
- [ ] Listed all components and their functions

### Content Planning
- [ ] Mapped the dependency graph: which concepts require which others?
- [ ] Determined the step order (adapted from the 12-step skeleton)
- [ ] Identified which rules go in main column vs. sidebar
- [ ] Listed 3–5 analogies to popular games for sidebar blue cards
- [ ] Listed 4–8 common mistakes for sidebar red cards
- [ ] Drafted 2–4 knowledge check questions targeting common errors

### Writing
- [ ] Each step teaches exactly one concept
- [ ] No step forward-references a concept from a later step
- [ ] Main column is complete — a sidebar-ignoring reader learns all rules
- [ ] Rule boxes used for critical rules (max 2 per step, gold or danger)
- [ ] Sidebar cards are 1–3 per step, color-coded by type
- [ ] Setup step comes after all gameplay concepts
- [ ] Final step is a compressed round summary with "you're ready to play"

### Visual Aids & Features
- [ ] SVG/HTML diagrams replace all placeholder boxes (no media-ph elements)
- [ ] Inline component visuals (chips, cards, tokens) are represented
- [ ] Flow diagrams used for branching consequences
- [ ] At least one interactive demo for the core mechanic (e.g., dice roller)
- [ ] Quick reference glossary populated with all game terms (15–30 entries)
- [ ] Source footnotes cite specific rulebook pages, FAQ entries, or BGG threads

### Quality Check
- [ ] Read the main column straight through — does it flow without confusion?
- [ ] Read only the sidebar — does it feel supplemental, not essential?
- [ ] "Can I Play Now?" test passes at the 60% mark
- [ ] Knowledge check questions have clear correct answers with explanations
- [ ] Responsive layout tested at 960px and 600px breakpoints
- [ ] All rules verified against the official rulebook
- [ ] No fabricated, inferred, or house rules in the main column
