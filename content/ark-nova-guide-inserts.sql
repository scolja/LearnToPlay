-- ============================================================================
-- Ark Nova — Learn to Play Guide
-- Complete SQL inserts for ltp.Guides, ltp.GuideSections, ltp.GlossaryEntries
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Guide metadata
-- ---------------------------------------------------------------------------
DECLARE @GuideId UNIQUEIDENTIFIER = NEWID();

INSERT INTO ltp.Guides (
    Id, Slug, Title, Subtitle, Designer, Artist, Publisher, PublisherUrl,
    Year, Players, Time, Age, BggUrl,
    HeroGradient, HeroImage, CustomCss, IsDraft
) VALUES (
    @GuideId,
    'ark-nova',
    'Learn to Play Ark Nova',
    'Build a modern zoo that balances appeal and conservation — designed by Mathias Wigge',
    'Mathias Wigge',
    'Loïc Billiau, Dennis Lohausen, Steffen Bieker, Christof Tisch',
    'Capstone Games',
    'https://capstone-games.com/products/ark-nova',
    2021,
    '1–4',
    '90–150 min',
    '14+',
    'https://boardgamegeek.com/boardgame/342942/ark-nova',
    'linear-gradient(135deg, #2d4a2e 0%, #1a3320 40%, #0f1f12 100%)',
    NULL,
    ':root {
  --ark-green: #3a7d44;
  --ark-gold: #c9a94e;
  --ark-brown: #6b4226;
  --ark-blue: #4a6fa5;
}
.rule-box {
  border-color: #3a7d44;
  background: rgba(58,125,68,0.06);
}
.rule-box.danger {
  border-color: #b93e3e;
  background: rgba(185,62,62,0.04);
}',
    0
);

-- ---------------------------------------------------------------------------
-- 2. Guide sections
-- ---------------------------------------------------------------------------

-- Section 1: The Goal
DECLARE @S1 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S1, @GuideId, 1, 'The Goal',
-- Content
'You are building a modern, scientifically managed zoo. Your zoo must attract visitors (generating **appeal**) while also contributing to wildlife **conservation** projects around the world.

Two markers track your progress — one for **Appeal**, one for **Conservation Points**. They start at opposite ends of the scoring track and move toward each other. When they meet or cross, the game ends.

:::callout
**Your final score is the difference between your Appeal and Conservation positions.** The further your markers have crossed past each other, the higher your score. A negative score is possible — and common in early games.
:::

The player with the highest positive score wins. Balance is everything — pouring all effort into flashy animals without conservation work (or vice versa) leads to a losing score.',

-- Notes
'**[gold] Two Tracks, One Score**
Think of it like a tug-of-war between spectacle and science. Your zoo needs both — crowds at the gates AND meaningful conservation work. The best zoos find synergy between the two.

---

**[blue] If You Know Terraforming Mars...**
The dual-track scoring is similar to how TR and VP interact in Terraforming Mars — you need to advance on multiple fronts simultaneously, and one track alone won''t win the game.

---

**[green] First Game Tip**
Negative scores are completely normal for new players. Don''t panic — focus on learning the action system and the score will come.',

-- DisplayData
NULL);


-- Section 2: Your Action Cards
DECLARE @S2 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S2, @GuideId, 2, 'Your Action Cards',
-- Content
'On your turn, you perform **one action** by choosing one of your five action cards. Each card sits in a numbered slot from 1 to 5. The slot number is the **action''s strength** — how powerful it is this turn.

The five actions are:

- [CARDS]{.act-cards} — Draw new zoo cards into your hand
- [BUILD]{.act-build} — Construct enclosures and buildings on your zoo map
- [ANIMALS]{.act-animals} — Place animal cards from your hand into enclosures
- [ASSOCIATION]{.act-association} — Send workers to the association board
- [SPONSORS]{.act-sponsors} — Play sponsor cards for special abilities

### The Slide Mechanism

After you use a card, it moves to **slot 1** (the weakest position). All other cards slide right to fill the gap, moving them into higher-numbered (stronger) slots.

:::flow
:::

This means the longer you wait to use an action, the stronger it becomes. A [BUILD]{.act-build} card in slot 5 lets you build a size-5 enclosure. The same card in slot 1 only allows a size-1 building.

:::callout
**After using a card, move it to slot 1 and slide the rest right.** The card''s position determines its strength — not any printed number on the card.
:::

You do not take turns in rounds. Players simply alternate taking one action at a time until the game ends.',

-- Notes
'**[gold] Position = Power**
This is the heart of Ark Nova''s strategy. Every turn is a trade-off: use a weak action now, or wait for it to power up? But waiting means your other actions get weaker as they slide left.

---

**[red] Common Mistake**
New players confuse action card "position" with "level." The position (1–5) changes every turn as cards slide. The level (I or II) is a permanent upgrade that unlocks better abilities. They are different things.',

-- DisplayData
'{"flows":[["Use a Card","It Goes to Slot 1","Others Slide Right","Strength Grows"]]}');


-- Section 3: Building Your Zoo
DECLARE @S3 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S3, @GuideId, 3, 'Building Your Zoo',
-- Content
'The [BUILD]{.act-build} action lets you construct enclosures and facilities on your zoo map. The action''s strength determines the **maximum size** of what you can build.

### Standard Enclosures

Standard enclosures come in sizes 1 through 5. Each costs [2]{.money} per space (so a size-3 enclosure costs [6]{.money}). They start empty-side-up and flip to the occupied side when you place an animal.

### Placement Rules

Your first building must touch a **border space** of your zoo map. Every subsequent building must be placed **adjacent** to an existing one — at least one edge must touch.

You **cannot** build on:
- []{.water} Water spaces
- []{.rock} Rock spaces
- Spaces marked with a "II" icon (until you upgrade your Build action)

:::callout-danger
**Kiosks must be at least 3 spaces apart from each other.** This is easy to forget and can ruin your placement plans.
:::

### Other Buildings

- **Kiosks** (size 1) — Generate income during breaks: [1]{.money} for each unique adjacent building
- **Pavilions** (size 1) — Grant +1 Appeal immediately when built
- **Petting Zoo** (size 3) — Houses only Petting Zoo animals. One per zoo

### Covering Bonus Spaces

Some spaces on your zoo map show a yellow bonus icon. When you cover these with a building, you immediately gain that bonus (money, X-tokens, extra workers, etc.).',

-- Notes
'**[red] Common Mistake**
Players often forget that buildings must be adjacent to existing ones — your zoo must stay connected. You can''t build an isolated enclosure across the map.

---

**[green] Strategy Tip**
Build kiosks early and surround them with different buildings. Each adjacent unique building type earns you [1]{.money} per break — this income adds up fast.',

-- DisplayData
NULL);


-- Section 4: Bringing in Animals
DECLARE @S4 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S4, @GuideId, 4, 'Bringing in Animals',
-- Content
'The [ANIMALS]{.act-animals} action lets you play animal cards from your hand into your zoo. The action''s strength determines how many animals you can play in one turn.

### Playing an Animal

For each animal card, follow this sequence:

1. **Check conditions** — The left edge of the card lists requirements (partner zoos, other animals, etc.)
2. **Pay the cost** — The money amount shown in the upper-left
3. **Place in an enclosure** — An empty standard enclosure that meets the animal''s size requirement. Some animals also require the enclosure to be adjacent to []{.water} water or []{.rock} rock spaces on your map
4. **Flip the enclosure** — Turn it to its occupied (colored) side
5. **Gain effects** — Advance your Appeal, Conservation, or Reputation markers as shown. Trigger any special abilities

:::callout
**An animal''s enclosure must be at least as large as the size shown on the card.** You can place a size-2 animal in a size-3 enclosure, but not the reverse. Water and rock adjacency must be met by the map spaces — not by artwork on tiles.
:::

### Partner Zoo Discounts

If you have a **partner zoo** matching the animal''s continent, the cost is reduced by [3]{.money} per matching continent icon on the card. An animal with two []{.con-africa} Africa icons costs [6]{.money} less if you have an Africa partner zoo.

### Animal Categories

Animals belong to categories like [Bird]{.cat-bird}, [Herbivore]{.cat-herbivore}, [Predator]{.cat-predator}, [Primate]{.cat-primate}, [Reptile]{.cat-reptile}, [Bear]{.cat-bear}, and [Petting]{.cat-petting}. Categories matter for card conditions and conservation projects.',

-- Notes
'**[gold] Key Concept**
Animals are your primary source of Appeal points — they draw visitors to your zoo. But they also provide icons and effects that fuel conservation projects and other combos.

---

**[red] Common Mistake**
The enclosure''s water/rock requirement is about adjacency to the *map spaces*, not artwork on tiles. Each water or rock icon on the card requires a separate adjacent water or rock hex touching the enclosure.

---

**[green] Strategy Tip**
Place small, cheap animals early. A size-1 animal in a size-1 enclosure costs only [2]{.money} to build and perhaps [3]{.money}–[5]{.money} for the animal — and it advances your Appeal for better income at the next break.',

-- DisplayData
NULL);


-- Section 5: Reinforcement Break — Match Up (Actions)
DECLARE @S5 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S5, @GuideId, 5, 'Test Your Knowledge: Actions',
-- Content
':::match-up
:::',
-- Notes
NULL,
-- DisplayData
'{"matchUp":{"title":"Match Each Action to Its Effect","description":"Connect each action card to what it does.","pairs":[{"left":"CARDS","right":"Draw new zoo cards into your hand"},{"left":"BUILD","right":"Construct enclosures and facilities on your zoo map"},{"left":"ANIMALS","right":"Play animal cards into enclosures"},{"left":"ASSOCIATION","right":"Send workers for partner zoos, universities, and conservation"},{"left":"SPONSORS","right":"Play sponsor cards for special abilities and bonuses"}],"explanation":"All five actions use the same slot mechanism — the card''s position (1–5) determines how powerful the action is. After use, the card returns to slot 1 and the others slide right."}}');


-- Section 6: Sponsors & Support
DECLARE @S6 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S6, @GuideId, 6, 'Sponsors & Support',
-- Content
'The [SPONSORS]{.act-sponsors} action lets you play **sponsor cards** from your hand. Each sponsor card has a **level** (shown in the top-left). Your action strength must equal or exceed the card''s level.

### Sponsor Card Effects

Sponsor cards provide three types of benefits, color-coded on the card:

- **Yellow box** — One-time effect when played
- **Blue/recurring icon** — Ongoing ability that activates during gameplay
- **Purple income icon** — Income collected at each break
- **Brown/hourglass** — End-of-game scoring bonus

Sponsor cards usually cost no money to play, but may have conditions listed on the left edge (similar to animal cards).

### The Break Alternative

If you have no sponsor you want to play, you can instead use the [SPONSORS]{.act-sponsors} action to:

- Advance the **break token** by your action strength, AND
- Take money equal to your action strength

This is a useful fallback when you need cash or want to trigger a break strategically.

:::callout
**Sponsor cards don''t cost money — but they do require matching your action strength to their level.** Plan your action card positions to play valuable sponsors at the right time.
:::',

-- Notes
'**[gold] Key Concept**
Sponsors provide the "engine" of your zoo — recurring income, icons for conservation, and end-game scoring. A well-timed sponsor can be worth more than an expensive animal.

---

**[green] Strategy Tip**
The break-and-money alternative is not a waste of a turn. Sometimes pushing the break forward on your terms — when opponents aren''t ready — is a strong tactical move.',

-- DisplayData
NULL);


-- Section 7: The Association
DECLARE @S7 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S7, @GuideId, 7, 'The Association',
-- Content
'The [ASSOCIATION]{.act-association} action sends your **workers** to the association board to perform tasks. You start with one active worker and can gain more as the game progresses.

### Association Tasks

Each task requires a minimum action strength and one worker:

:::table
:::

### Partner Zoos

When you gain a partner zoo, place it on your zoo map in the next empty partner zoo slot. Each partner zoo provides:

- A **continent icon** that counts toward conservation project conditions
- A **cost reduction** of [3]{.money} for each matching continent icon when playing animal cards

You can have up to 4 partner zoos (one per continent). The 3rd and 4th require your [ASSOCIATION]{.act-association} card to be upgraded to level II.

### Universities

Universities give you bonus icons and sometimes increase your hand limit from 3 to 5 cards. You advance your Reputation when gaining a university.

### Conservation Projects

Supporting a conservation project is the primary way to gain **conservation points**. Each project card shows three conditions. To support one, you must fulfill its requirement using icons from your played cards, partner zoos, and universities.

When you support a project, place one of your **player tokens** (from the left edge of your zoo map) onto the card. This earns you conservation points and often bonus rewards. Removing a token from your map may also uncover a yellow bonus.

:::callout
**Workers return to your supply only during breaks** — not immediately after use. Plan your worker deployment carefully across multiple turns.
:::',

-- Notes
'**[red] Common Mistake**
Your 3rd and 4th partner zoos require the Association action card to be upgraded to level II. Many players miss this and try to take a third partner zoo with the basic card.

---

**[gold] Key Concept**
Conservation projects are the primary path to conservation points. A zoo with high Appeal but no conservation work will have a losing score. The association board is where your "science" side lives.

---

**[green] Strategy Tip**
Flip your Association card as your first upgrade. This unlocks donations (1 conservation point for a money payment) — a flexible way to push your conservation marker forward.',

-- DisplayData
'{"table":{"headers":["Strength","Task","Details"],"rows":[["2","Gain Reputation","Increase reputation by 2"],["3","Partner Zoo","Take a partner zoo from the board (one per continent)"],["4","University","Take a university — gain bonus icons and reputation"],["5","Conservation Project","Support an existing project or play a new one from hand"]]}}');


-- Section 8: Scoring Tracks & Reputation
DECLARE @S8 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S8, @GuideId, 8, 'Scoring Tracks & Reputation',
-- Content
'Three tracks govern your progress in Ark Nova:

### Appeal Track

Your **Appeal** marker advances when you place animals, build pavilions, and trigger certain card effects. Appeal determines:

- Your **income** at each break (higher Appeal = more money)
- Part of your final score

### Conservation Track

Your **Conservation** marker advances when you support conservation projects and make donations. The conservation track has milestone bonuses:

- **Space 2:** Upgrade one action card to level II, OR activate an additional worker
- **Spaces 5 and 8:** Take [5]{.money} OR gain a bonus token
- **Space 10:** All players who haven''t reached 10 must discard a Final Scoring card at game end

### Reputation Track

**Reputation** (0–15) determines which cards in the display are "within your reputation range." Higher reputation means access to better cards when drawing or playing from the display.

- Reputation advances through animals, sponsors, universities, and association tasks
- At certain spaces, you gain bonus tokens
- If reputation exceeds 15, excess converts to +1 Appeal each

:::callout
**The Conservation track milestones are crucial.** Reaching space 2 lets you upgrade an action card — a game-changing improvement. Push for it early.
:::',

-- Notes
'**[gold] Key Concept**
Appeal earns money; Conservation earns victory. You need both — Appeal funds your zoo operations, while Conservation actually wins the game. The two tracks start at opposite ends and must cross for a positive score.

---

**[red] Common Mistake**
Many players forget the Conservation space 10 rule: if nobody reaches 10 conservation by game end, ALL players must discard one of their two Final Scoring cards. This can cost 3–7 points.',

-- DisplayData
NULL);


-- Section 9: Reinforcement Break — Spot the Error
DECLARE @S9 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S9, @GuideId, 9, 'Spot the Zoo Mistake',
-- Content
':::spot-the-error
:::',
-- Notes
NULL,
-- DisplayData
'{"spotTheError":{"title":"Spot the Zoo Mistake","scenario":"It''s your turn. You have a size-3 enclosure adjacent to 1 water space. You want to play a Hippo card that requires a size-2 enclosure with 2 water adjacency. You have the money and meet all other conditions.","statements":[{"text":"You can play the Hippo because the enclosure (size 3) exceeds the animal''s size requirement (size 2)","isError":false,"explanation":"Correct — an enclosure can be larger than the animal''s minimum size requirement."},{"text":"You cannot play the Hippo because the enclosure is only adjacent to 1 water space, but the card requires 2 water adjacency","isError":false,"explanation":"Correct — each water icon on the card requires a separate water hex adjacent to the enclosure. Having 1 water hex next to a 2-water-area doesn''t count as 2."},{"text":"You can play the Hippo anyway because the water area has 2 connected water spaces, which satisfies the 2-water requirement","isError":true,"explanation":"This is the error. Water adjacency counts per individual hex touching the enclosure, not per connected water area. If only 1 water hex touches your enclosure, you have 1 water adjacency — even if that hex is part of a larger water feature."}]}}');


-- Section 10: Upgrading & X-Tokens
DECLARE @S10 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S10, @GuideId, 10, 'Upgrading & X-Tokens',
-- Content
'### Upgrading Action Cards

Each action card has two sides: **Level I** (blue) and **Level II** (pink). Upgrading flips the card permanently to its stronger side with improved abilities.

You earn upgrades through four triggers:

1. **Conservation track reaches space 2** — Upgrade a card OR activate an extra worker
2. **Gaining your 2nd partner zoo**
3. **Gaining your 2nd university**
4. **Certain conservation project rewards**

Since there are five action cards but at most four upgrades, at least one card stays at Level I all game.

### What Upgrades Unlock

- [BUILD]{.act-build} II — Build **multiple** different buildings per action (total size ≤ strength). Unlocks Reptile House and Large Bird Aviary. Can build on "II" spaces
- [ANIMALS]{.act-animals} II — Play animals from the **display** (within reputation range). Gain +1 Reputation at strength 5+
- [CARDS]{.act-cards} II — Draw from the display within reputation range. Snap at strength 3+ instead of 5+
- [SPONSORS]{.act-sponsors} II — Play **multiple** sponsor cards (total levels ≤ strength + 1). Can play from display
- [ASSOCIATION]{.act-association} II — Perform **multiple** different tasks. Can make donations. Can take 3rd/4th partner zoos

### X-Tokens

[X]{.xtoken} tokens boost your action strength by +1 each. Spend them when choosing an action to increase its power beyond the slot position — even above 5.

You gain X-tokens by:
- Covering certain bonus spaces on your zoo map
- Triggering a break (the player who pushes the break token to the end gets 1 X-token)
- Taking the **X-token action**: use any action card solely to gain 1 X-token (the card still moves to slot 1)

:::callout-danger
**You cannot use X-tokens gained during an action to boost that same action.** Also, you can hold a maximum of 5 X-tokens at any time.
:::',

-- Notes
'**[gold] Key Concept**
Upgrades are one of the most impactful moments in the game. A Level II card is dramatically more powerful — Build II lets you construct multiple buildings, Animals II lets you play from the display, Association II unlocks donations.

---

**[red] Common Mistake**
Players sometimes forget that the X-token action still requires moving a card to slot 1. You don''t just "take a token" — you must choose and move an action card, which affects your card positions for future turns.

---

**[green] Strategy Tip**
Upgrade your Association card first. It unlocks donations (pay money for conservation points), the 3rd partner zoo, and multiple tasks per action — all of which accelerate your conservation engine.',

-- DisplayData
NULL);


-- Section 11: The Break
DECLARE @S11 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S11, @GuideId, 11, 'The Break',
-- Content
'Ark Nova has no fixed rounds. Instead, a **break token** advances along a track during play. When it reaches the end, a **break** occurs — a brief administration phase before play resumes.

### What Advances the Break Token?

- The [CARDS]{.act-cards} action advances it **2 spaces** (always)
- The [SPONSORS]{.act-sponsors} break alternative advances it by the action''s **strength**
- Certain card effects can advance it

The player who pushes the token to the end receives 1 [X]{.xtoken} token.

### Break Procedure

When a break triggers, complete these steps in order:

:::strip
:::

1. **Discard** down to your hand limit (normally 3 cards; 5 with certain universities)
2. **Return tokens** — Multiplier, Venom, and Constriction tokens go back to supply
3. **Workers return** — All association workers come back to your notepad (available again)
4. **Replenish** partner zoos and universities on the association board
5. **Refresh display** — Discard the bottom 2 display cards, slide the rest down, deal new cards on top
6. **Collect income** — Money from your Appeal position, kiosk adjacency bonuses, and any income-producing cards
7. **Reset** the break token to the starting position

:::callout
**Income is based on your Appeal at the time of the break.** Higher Appeal = more money per break. This is why pushing Appeal early matters — it funds everything else.
:::',

-- Notes
'**[red] Common Mistake**
Workers only return during breaks — not after you use them. If you deploy your only worker early, you won''t get them back until the next break. Plan your Association actions around the break cycle.

---

**[green] Strategy Tip**
You can strategically trigger breaks by using the Sponsors break alternative or the Cards action. Forcing a break when opponents have full hands (causing them to discard) or when your income is high is a strong play.',

-- DisplayData
'{"strip":[{"num":1,"label":"Discard"},{"num":2,"label":"Tokens"},{"num":3,"label":"Workers"},{"num":4,"label":"Replenish"},{"num":5,"label":"Display"},{"num":6,"label":"Income"},{"num":7,"label":"Reset"}]}');


-- Section 12: Game Arc & Endgame
DECLARE @S12 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S12, @GuideId, 12, 'Game Arc & Endgame',
-- Content
'### How the Game Flows

Ark Nova has no set number of rounds. The game''s pace is governed by the break track and the scoring tracks.

**Early game:** Money is tight. Place small, cheap animals to advance Appeal for better income. Take your first partner zoo. Build toward your first upgrade.

**Mid game:** Upgrade action cards. Build larger enclosures for powerful animals. Start supporting conservation projects. Gain universities for icons and hand size.

**Late game:** Push hard on conservation to close the gap with your Appeal marker. Play Final Scoring cards. Make donations. Race to cross the markers.

### End Game Trigger

The game ends when a player''s **Appeal** and **Conservation** markers occupy the same scoring area or have crossed each other. This can happen:

- At the **end of a player''s turn** — all other players take 1 final turn
- **During a break** — all players take 1 final turn

### Final Scoring

:::flow
:::

1. If no player reached **10 conservation points**, all players discard 1 of their 2 Final Scoring cards
2. Score your remaining **Final Scoring cards** (gain Appeal and/or Conservation)
3. Score any **end-game sponsor effects** (cards with brown/hourglass icons)
4. Your **final score** = Appeal value minus the lowest Appeal number in the scoring area where your Conservation marker sits

The highest score wins. Tiebreaker: most conservation projects supported (count tokens removed from your zoo map''s left edge).

:::callout-danger
**You can end the game with a negative score.** If your markers haven''t crossed, your score is negative. This is normal for first games — aim to cross those markers!
:::',

-- Notes
'**[gold] Key Concept**
The game ends when ONE player crosses their markers — but all other players get one more turn. If you''re behind, you still have a chance. If you''re ahead, triggering the end denies opponents additional turns.

---

**[green] Strategy Tip**
Don''t trigger the end too early. Once you cross markers, opponents get a final turn to catch up. It''s often better to build a large lead, then cross decisively — rather than barely crossing and hoping for the best.',

-- DisplayData
'{"flows":[["Markers Cross","Final Turns","Score Cards","Calculate VP"]]}');


-- Section 13: Reinforcement Break — Sequence Sort (Break Procedure)
DECLARE @S13 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S13, @GuideId, 13, 'Order the Break Steps',
-- Content
':::sequence-sort
:::',
-- Notes
NULL,
-- DisplayData
'{"sequenceSort":{"title":"Put the Break Steps in Order","description":"When a break is triggered, these steps happen in a specific sequence. Can you put them in the right order?","items":[{"text":"Discard down to hand limit (3 or 5 cards)","position":0},{"text":"Return temporary tokens (Multiplier, Venom, etc.) to supply","position":1},{"text":"All association workers return to notepads","position":2},{"text":"Replenish partner zoos and universities on the board","position":3},{"text":"Refresh the card display (discard bottom 2, slide down, refill)","position":4},{"text":"Collect income (Appeal-based money, kiosk income, card income)","position":5},{"text":"Reset break token to starting position","position":6}],"explanation":"The break sequence matters because workers must return before you can plan your next Association action, and income comes after the display refresh — so new cards are available when play resumes."}}');


-- Section 14: Setup
DECLARE @S14 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S14, @GuideId, 14, 'Setup',
-- Content
'### Board Setup

1. Place the game board. Set the **break token** on the starting space for your player count
2. Shuffle the 9 bonus tiles and place 1 randomly on each of the 4 yellow spaces on the board
3. Shuffle all zoo cards and deal 6 face-down to the display spaces
4. Set up the **Association board**: place 1 partner zoo per continent and 1 university on each space. Shuffle base conservation project cards and reveal 3 face-up (4 in a 4-player game)
5. Shuffle the Final Scoring cards and place them nearby

### Player Setup (each player)

1. Take a **zoo map** — use Map A for your first game
2. Take a set of 5 **action cards**. Place [ANIMALS]{.act-animals} in slot 1 (blue side up). Randomize the other 4 cards across slots 2–5 (all blue side up)
3. Choose a player color. Place your **Appeal** marker on the track (start player at 0, second player at 1, etc.). Place **Conservation** and **Reputation** markers on their starting positions
4. Place 7 **player tokens** on the left edge of your zoo map
5. Place 1 **association worker** standing on your notepad. Lay the other 3 below it (inactive)
6. Take [25]{.money} from the supply
7. Draw 2 **Final Scoring cards** — keep both (you''ll score one at game end)
8. Draw **8 zoo cards**, keep 4, discard the rest face-up
9. Flip the 6 display cards face-up — play begins!

:::callout
**For 2 players:** Block certain spaces on the Association board and conservation projects with unused player tokens (see rulebook for exact placement). This balances the board for fewer players.
:::',

-- Notes
'**[gold] Key Concept**
Animals starts in slot 1 deliberately — it''s your weakest action at the start. This forces you to build enclosures first (Build will be in a higher slot) before placing animals.

---

**[red] Common Mistake**
Players forget they draw 8 cards and keep only 4 at the start. This initial draft is crucial — look for animals that match each other''s continent, a cheap early animal, and maybe a useful sponsor.',

-- DisplayData
NULL);


-- Section 15: Turn Summary
DECLARE @S15 UNIQUEIDENTIFIER = NEWID();
INSERT INTO ltp.GuideSections (Id, GuideId, SortOrder, Title, Content, Notes, DisplayData, IsActive)
VALUES (@S15, @GuideId, 15, 'Turn Summary',
-- Content
'### Your Turn at a Glance

:::html-block
:::

### Key Reminders

- **Action strength** = slot position (1–5) + any [X]{.xtoken} tokens spent
- After using a card, it goes to **slot 1** — everything else slides right
- [CARDS]{.act-cards} always advances the break token by 2
- Animals need enclosures of at least the required size, with any water/rock adjacency met
- Partner zoos reduce animal costs by [3]{.money} per matching continent icon
- Workers only return during **breaks**
- Sponsor break alternative: advance break token + take money = action strength
- **X-token action**: use any card to gain 1 [X]{.xtoken} (card still moves to slot 1)

### You''re Ready to Play!

Start with small animals and cheap enclosures to build your income. Work toward your first action card upgrade. Balance Appeal and Conservation — you need both markers to cross for a positive score.

Good luck building your zoo!',

-- Notes
'**[green] Quick Start Checklist**
Your first few turns: Build a small enclosure → Place a cheap animal → Use Cards to draw more options → Build again. Get income flowing before attempting anything big.

---

**[gold] Remember**
Check the glossary (bottom-right button) anytime you need a quick refresher on a term or rule.',

-- DisplayData
'{"htmlBlocks":["<div style=\"background:var(--bg-dark);color:var(--text-light);border-radius:10px;padding:1.3rem 1.5rem;\"><div style=\"display:flex;gap:0.8rem;align-items:baseline;margin-bottom:0.6rem;\"><span style=\"color:var(--gold);font-weight:700;font-family:var(--font-ui);\">1.</span><span><strong>Choose</strong> an action card from your slots (1–5)</span></div><div style=\"display:flex;gap:0.8rem;align-items:baseline;margin-bottom:0.6rem;\"><span style=\"color:var(--gold);font-weight:700;font-family:var(--font-ui);\">2.</span><span><strong>Optionally spend</strong> X-tokens to boost the action''s strength</span></div><div style=\"display:flex;gap:0.8rem;align-items:baseline;margin-bottom:0.6rem;\"><span style=\"color:var(--gold);font-weight:700;font-family:var(--font-ui);\">3.</span><span><strong>Execute</strong> the action at that strength</span></div><div style=\"display:flex;gap:0.8rem;align-items:baseline;margin-bottom:0.6rem;\"><span style=\"color:var(--gold);font-weight:700;font-family:var(--font-ui);\">4.</span><span><strong>Slide</strong> the used card to slot 1; shift others right</span></div><div style=\"display:flex;gap:0.8rem;align-items:baseline;\"><span style=\"color:var(--gold);font-weight:700;font-family:var(--font-ui);\">5.</span><span><strong>Replenish</strong> any display cards taken (at end of turn)</span></div></div>"]}');


-- ---------------------------------------------------------------------------
-- 3. Glossary entries
-- ---------------------------------------------------------------------------

INSERT INTO ltp.GlossaryEntries (GuideId, SectionId, Term, Definition, SearchTerms, GroupName, SortOrder)
VALUES
(@GuideId, @S2, 'Action Cards', 'Five cards (Cards, Build, Animals, Association, Sponsors) that determine what you can do each turn. Their position in slots 1–5 determines action strength.', 'action strength slot position', 'Core Mechanics', 1),

(@GuideId, @S2, 'Action Strength', 'The power of an action, determined by the card''s slot position (1–5) plus any X-tokens spent. Higher strength = more powerful action.', 'slot position power level', 'Core Mechanics', 2),

(@GuideId, @S1, 'Appeal', 'One of the two scoring tracks. Gained by placing animals, building pavilions, and card effects. Determines break income and contributes to final score.', 'appeal track score victory points VP', 'Tracks', 3),

(@GuideId, @S7, 'Association Board', 'Shared board where workers perform tasks: gaining reputation, partner zoos, universities, and supporting conservation projects.', 'association worker tasks', 'Components', 4),

(@GuideId, @S11, 'Break', 'Administration phase triggered when the break token reaches the end of its track. Workers return, display refreshes, and players collect income.', 'break token administration income phase', 'Core Mechanics', 5),

(@GuideId, @S3, 'Build Action', 'Construct enclosures, kiosks, and pavilions on your zoo map. Action strength = maximum building size. Costs 2 money per space.', 'build enclosure construct', 'Actions', 6),

(@GuideId, @S4, 'Cards Action', 'Draw new zoo cards from the deck or display. Always advances the break token by 2 spaces.', 'cards draw snap hand', 'Actions', 7),

(@GuideId, @S1, 'Conservation Points', 'One of the two scoring tracks. Gained by supporting conservation projects and making donations. Must cross with Appeal for a positive score.', 'conservation track score projects', 'Tracks', 8),

(@GuideId, @S7, 'Conservation Project', 'Cards with conditions that earn conservation points when supported. Conditions require collecting icons from animals, sponsors, and partner zoos.', 'conservation project support condition icons', 'Cards', 9),

(@GuideId, @S7, 'Donation', 'Available with Association II. Pay money to cover a donation space and gain 1 conservation point. Requires completing at least 1 association task first.', 'donation association conservation money', 'Actions', 10),

(@GuideId, @S3, 'Enclosure', 'Hexagonal building on your zoo map that houses animals. Sizes 1–5. Starts empty-side-up, flips when an animal is placed.', 'enclosure standard size hex building', 'Components', 11),

(@GuideId, @S12, 'Final Scoring Card', 'Each player draws 2 at setup. Scored at game end for bonus Appeal and/or Conservation points.', 'final scoring end game bonus', 'Cards', 12),

(@GuideId, @S3, 'Kiosk', 'Size-1 building that generates income during breaks — 1 money per unique adjacent building. Must be at least 3 spaces from other kiosks.', 'kiosk income adjacent building', 'Components', 13),

(@GuideId, @S7, 'Partner Zoo', 'Gained via Association action. Provides continent icon for conservation and reduces animal costs by 3 money per matching icon. Max 4 total.', 'partner zoo continent discount cost reduction', 'Components', 14),

(@GuideId, @S3, 'Pavilion', 'Size-1 building that grants +1 Appeal immediately when built.', 'pavilion appeal building', 'Components', 15),

(@GuideId, @S3, 'Petting Zoo', 'Size-3 special enclosure that houses only Petting Zoo animals. Maximum 1 per zoo.', 'petting zoo enclosure special', 'Components', 16),

(@GuideId, @S8, 'Reputation', 'Track (0–15) that determines which display cards are within your range when drawing or playing from the display. Higher = better card access.', 'reputation track range display cards', 'Tracks', 17),

(@GuideId, @S2, 'Slide Mechanism', 'After using an action card, it moves to slot 1 and all other cards slide right into higher-numbered (stronger) positions.', 'slide move slot position action card row', 'Core Mechanics', 18),

(@GuideId, @S6, 'Sponsor Card', 'Blue cards providing special abilities, recurring bonuses, income, or end-game scoring. Require action strength ≥ card level to play.', 'sponsor card level blue ability', 'Cards', 19),

(@GuideId, @S7, 'University', 'Gained via Association action (strength 4). Provides bonus icons and can increase hand limit from 3 to 5 cards.', 'university hand limit icons bonus', 'Components', 20),

(@GuideId, @S10, 'Upgrade', 'Flipping an action card from Level I (blue) to Level II (pink) permanently. Unlocks stronger abilities. Earned through milestones.', 'upgrade level II pink action card flip', 'Core Mechanics', 21),

(@GuideId, @S3, 'Water/Rock Adjacency', 'Some animals require their enclosure to be adjacent to water and/or rock spaces on the zoo map. Each icon requires a separate adjacent hex.', 'water rock adjacency requirement enclosure hex', 'Rules', 22),

(@GuideId, @S7, 'Worker', 'Association workers placed on the Association board to perform tasks. Start with 1 active; can gain more. Return only during breaks.', 'worker association active return break', 'Components', 23),

(@GuideId, @S10, 'X-Token', 'Tokens that boost action strength by +1 each. Maximum 5 held. Cannot boost the action that generates them.', 'x-token boost strength power token', 'Components', 24),

(@GuideId, @S4, 'Zoo Card', 'The 255 cards in the game, including Animal cards, Sponsor cards, and Conservation Project cards.', 'zoo card animal sponsor conservation', 'Cards', 25);


-- Done! Guide has 15 sections and 25 glossary entries.
SELECT 'Ark Nova guide created successfully' AS Result;
SELECT @GuideId AS GuideId;
