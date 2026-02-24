# Research Game for Teaching Guide

Pre-research a board game to gather all the information needed before creating a teaching guide. This produces a research document that can be referenced during guide creation.

## Input

Game name: $ARGUMENTS

## Research Steps

### 1. Official Rules

Search for and read the complete official rulebook:
- Search: "[game name] official rulebook PDF"
- Search: "[game name] rules" on the publisher's website
- Search: "[game name] rulebook" on BGG files section

Extract and document:
- Complete rules summary organized by game phase/mechanic
- Component list with quantities
- Setup procedure
- Turn/round structure
- Win/loss conditions
- Any variant rules or solo mode rules

### 2. Game Metadata

Verify from BGG and publisher site:
- Player count (min-max)
- Play time (min-max)
- Age rating
- Designer(s)
- Artist(s)
- Publisher(s)
- Year published
- BGG complexity rating
- BGG categories and mechanisms

### 3. Errata & Official FAQ

Search for corrections and clarifications:
- Search: "[game name] errata" on publisher's site
- Search: "[game name] FAQ" on publisher's site
- Search: "[game name] rules clarification" on BGG
- Check BGG forums for official designer responses

Document each errata/FAQ item with its source.

### 4. Common Mistakes

Search for rules people get wrong:
- Search BGG: "[game name] rules we got wrong"
- Search BGG: "[game name] common mistakes"
- Search BGG: "[game name] rules questions"
- Search Reddit: "r/boardgames [game name] rules"
- Search: "[game name] rules mistakes"

Rank mistakes by frequency (how many people report them). These become sidebar red cards.

### 5. Teaching Tips

Search for how experienced players teach this game:
- Search: "how to teach [game name]"
- Search BGG: "[game name] teaching" or "[game name] how to teach"
- Search YouTube: "[game name] how to play" (note the order presenters use)

Document:
- Recommended teaching order
- Which rules to emphasize first
- Which rules to save for later
- Effective analogies to other games or real-world concepts

### 6. Reviews & Community Sentiment

Search for reviews that mention rules clarity:
- Search: "[game name] review" on major board game sites
- Look for comments about confusing rules or "we played wrong"
- Note which aspects reviewers found most confusing

### 7. Game Comparisons

Identify analogies to other popular games:
- What game(s) share the core mechanic?
- What game(s) have a similar theme?
- What video games have similar gameplay loops?
- These become sidebar blue cards.

### 8. Images & Press Kit

Search for official images that can be used in the teaching guide:
- Search: "[game name] press kit" on the publisher's website
- Search: "[publisher name] [game name] resources" or "[publisher name] [game name] media"
- Check the publisher's resources/press page for downloadable ZIP files or image galleries
- Look for press kit download links on the game's official page

**Priority images to find:**
1. **Component photos** — cards, tokens, boards, tiles laid out clearly (ideal for Setup step)
2. **Card/component close-ups** — showing faces, backs, and distinguishing features (ideal for teaching card types)
3. **Game in action** — the game set up mid-play showing the core play area (ideal for Goal step)
4. **Box art / cover** — for potential Hero section use
5. **Box back** — often shows a gameplay summary or phase overview

**If a press kit ZIP is found:**
- Download it to `/tmp/[game-name]-press/`
- Extract and catalogue all image files
- Review each image for teaching usefulness
- Optimize useful images for web (resize to max 800-1000px wide, compress to <400KB each)
- Copy optimized images to `public/images/[game-name]/`
- Document which images are available and what step each would best serve

**If no press kit is available:**
- Note this in the research document
- SVG diagrams and CSS-based visuals will be created during guide authoring instead
- Check if the publisher allows use of product images from their site (note any license terms)

## Output Format

Produce a structured research document with these sections:

```markdown
# [Game Name] — Research Notes

## Metadata
- Players: X–Y
- Time: X–Y min
- Age: X+
- Designer: ...
- Publisher: ...
- Year: ...

## Rules Summary
[Organized by phase/mechanic]

## Component List
[All components with quantities]

## Errata & FAQ
[Each item with source]

## Common Mistakes (ranked by frequency)
1. [Most common mistake] — Source: [BGG thread URL]
2. ...

## Teaching Order Recommendations
[From community teaching guides]

## Game Analogies
- [Mechanic X] is like [Other Game] because...
- ...

## Confusing Areas (from reviews)
- [Area] — [What's confusing] — Source: [review]

## Images & Visual Assets
- Press kit URL: [URL or "not found"]
- Images saved to: public/images/[game-name]/
  - [filename] — [what it shows] — Best for: [which step]
  - ...
- Notes: [license terms, missing image types, SVG needed for ...]

## Sources
- Official rulebook: [URL]
- Publisher FAQ: [URL]
- BGG page: [URL]
- Press kit: [URL]
- Teaching guides consulted: [URLs]
- Reviews consulted: [URLs]
```

Save this document as `games/[game-name]-research.md` for reference during guide creation.
