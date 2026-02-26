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
   - **Hero background**: Box art (front or back) makes an excellent subtle background — set `heroImage` in frontmatter (see below)
   - Step 1 (Goal): Game-in-action or box back showing the game overview
   - Step 2 (Cards/Components): Close-ups of the main components players interact with
   - Setup step: Component spread showing everything laid out

5. **Identify gaps.** For steps without suitable photos, plan SVG diagrams or CSS-based visuals instead.

6. **Hero background image.** If box art or a visually striking image is available, add `heroImage: "/images/[game-name]/filename.ext"` to the YAML frontmatter. The Hero component renders this as a blurred, dimmed background behind the title — it adds atmosphere without competing with the text. Best candidates: box front art, box back, or a stylized game illustration.

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
   - Step 11: Setup
   - Step 12: Complete Round/Turn Summary

   Interactive reinforcement breaks are inserted between steps at natural conceptual boundaries (see step 5 below).

3. **Identify sidebar content.** For each step, plan:
   - Gold cards: Key insights, helpful context
   - Red cards: Common mistakes (from research)
   - Green cards: Tips, strategy, examples
   - Blue cards: Analogies to other games
   - Max 3 cards per step

4. **Draft knowledge check questions.** Target the most commonly misunderstood rules. Use concrete scenarios, not abstract questions.

5. **Plan interactive reinforcement breakpoints.** After roughly every 3 steps (or at natural conceptual boundaries), consider placing a mini-game component. Choose the type based on what was just taught:

   | What Was Taught | Best Component | Why |
   |-----------------|----------------|-----|
   | A multi-step process (turn, launch, scoring) | `<SequenceSort>` | Tests procedural recall — can they reconstruct the sequence? |
   | Multiple related terms/resources/mappings | `<MatchUp>` | Tests associations — can they link concepts correctly? |
   | Decision-heavy mechanics with trade-offs | `<ScenarioChallenge>` | Tests rule application — can they reason about a novel situation? |
   | Rules with common mistakes (from errata/FAQ) | `<SpotTheError>` | Targets specific misconceptions — can they spot a rule violation? |
   | Factual rules, edge cases, calculations | `<KnowledgeCheck>` | Tests recall & comprehension — standard multiple choice |

   **Guidance:**
   - **Only place a mini-game if there's genuinely confusing material to reinforce.** Skip the breakpoint if recent steps were straightforward. Not every gap between steps needs a game.
   - **Target errata, FAQ material, and common mistakes from research** — these are the concepts readers actually struggle with. The "Common Mistakes" section of research notes is the primary source for mini-game content.
   - **Questions should be concrete scenarios, not trivia.** "What happens when you bump your own worker?" not "How many workers do you start with?"
   - **Vary the types** — don't use the same mini-game type twice in a row.
   - **A guide with 12 steps typically has 2-4 reinforcement breaks**, not one per every 3 steps. Quality over quantity.
   - **Mini-games sit between StepRow sections** in the MDX, as standalone full-width components (not inside a StepRow).
   - **Never test concepts not yet taught.** Each mini-game can only reference material from preceding steps.

### Phase 3: Writing

Read `game-teaching-style-guide.md` thoroughly before writing. Follow every specification in it.

**IMPORTANT: Content format is markdown with directives — NOT MDX or React components.** See CLAUDE.md "Rendering Pipeline" for the full spec. Section content goes into `ltp.GuideSections` rows, not files.

**Content voice:**
- Main column: Terse, direct, second-person, present tense. "You draw a card." Not "The player draws a card."
- Sidebar: Conversational, warmer. "Think of it like..." Strategy opinions welcome.
- Rule boxes (callouts): Declarative and authoritative. State the rule AND its scope.

**Game-specific CSS & tokens:**
- Create `src/styles/game-specific/[game-name].css` with token classes for the game's components
- Token classes follow the pattern: base class (layout/sizing) + variant class (color). Example: `.act { display: inline-flex; ... }` + `.act-move { background: #4a7c59; }`
- Import the file in `src/app/globals.css`
- Use token syntax `[TEXT]{.class}` in section markdown — preprocessTokens auto-adds parent classes for 2–3 char prefixes
- Theme overrides (accent colors, callout colors) go in `ltp.Guides.CustomCss`

**Inline token examples:**
```markdown
Spend []{.adr} cubes on [MOVE]{.act-move}, [SEARCH]{.act-search}, or [KILL]{.act-kill}.
The blood meter []{.blood} advances by the victim's [3]{.str} strength value.
Place a [☠]{.corpse} corpse token in the room.
```

**Sidebar notes format:**
Each section's `Notes` field contains tip cards separated by `\n---\n`:
```markdown
**[gold] Key Concept**
The action chain is the heart of the game.

---

**[red] Common Mistake**
New players forget the rightmost slots cost more cubes.

---

**[green] Strategy Tip**
Plan 2–3 turns ahead.
```

**Visual Aids:**
- **Prefer real images from the publisher's press kit** when available (see Phase 1.5)
- For diagrams, use `:::html-block` directives with HTML in `DisplayData.htmlBlocks`
- For flow chains, use `:::flow` directives with items in `DisplayData.flows`
- For phase strips, use `:::strip` with items in `DisplayData.strip`
- For SVG diagrams, use `:::diagram` with SVG in `DisplayData.diagrams`
- One visual per section max. Place AFTER the text it illustrates.
- **Mobile-first**: Test all visuals at 375px width. Flow diagrams should have 3–4 short labels. Strips should have ≤4 items or they wrap awkwardly.

**Using Real Images:**
- Real images go in `public/images/[game-name]/` and are referenced as `/images/[game-name]/filename.ext`
- Optimize all images for web: max 800-1000px wide, <400KB each, JPG for photos, PNG for transparency
- Use SVG diagrams when you need to annotate, label, or explain relationships between components

### Phase 4: Publishing to Database

Insert guide data into the three active tables using MCP mssql tools (individual queries, NOT transactions — the transaction tool is unreliable):

1. **`ltp.Guides`** — One row with all metadata:
   - `Slug` (lowercase, hyphenated game name)
   - `Title`, `Subtitle`, `Designer`, `Artist`, `Publisher`, `PublisherUrl`
   - `Year`, `Players`, `Time`, `Age`, `BggUrl`
   - `HeroGradient` (CSS gradient for thumbnail fallback)
   - `HeroImage` (path to hero background image, or NULL)
   - `CustomCss` (theme overrides CSS string)
   - `IsDraft = 0` for published guides

2. **`ltp.GuideSections`** — One row per section:
   - `GuideId` (FK to Guides)
   - `SortOrder` (1-based sequential)
   - `Title` (section heading)
   - `Content` (markdown with directives and token syntax)
   - `Notes` (sidebar tip cards, `---` separated)
   - `DisplayData` (JSON string with flows, diagrams, htmlBlocks, etc.)
   - `IsActive = 1`

3. **`ltp.GlossaryEntries`** — One row per game term:
   - `GuideId` AND `SectionId` (both required — SectionId powers mobile glossary navigation)
   - `Term`, `Definition`, `SearchTerms`, `GroupName`, `SortOrder`

### Phase 5: Self-Review

Before delivering, verify:
- [ ] Every rule comes from the official rulebook
- [ ] No step forward-references a concept from a later step
- [ ] Main column is complete without sidebar (notes)
- [ ] Callout boxes max 2 per section
- [ ] Sidebar tip cards max 3 per section, color-coded
- [ ] Setup comes after all gameplay concepts
- [ ] Interactive reinforcements target commonly misunderstood rules (not trivia)
- [ ] Mini-game types are varied (not all quizzes)
- [ ] No reinforcement break tests concepts not yet taught
- [ ] Inline tokens render correctly (check game-specific CSS file exists and is imported)
- [ ] Flow diagrams have 3–4 short labels (mobile-friendly)
- [ ] All GlossaryEntries have SectionId populated
- [ ] Game-specific CSS file created and imported in globals.css
- [ ] CustomCss theme overrides set on Guides row
- [ ] HeroGradient set for homepage thumbnail fallback
