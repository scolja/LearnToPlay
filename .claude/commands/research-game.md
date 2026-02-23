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

## Sources
- Official rulebook: [URL]
- Publisher FAQ: [URL]
- BGG page: [URL]
- Teaching guides consulted: [URLs]
- Reviews consulted: [URLs]
```

Save this document as `games/[game-name]-research.md` for reference during guide creation.
