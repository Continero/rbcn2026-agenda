# RoboCon 2026 Agenda — Build Timeline

## Day 1: Monday Feb 10 — The Foundation

**15:30** — "Build a live agenda display for RoboCon 2026 in Helsinki, for a TV screen"
- Initial Next.js 16 app with schedule data, current talk detection, countdown timers

**15:37–15:59** — Layout tweaks
- "Constrain to 75% width"
- "Widen the day tabs"
- "Match robocon.io visual style"
- "Fix UP NEXT being hidden by NOW card"

**16:02** — "Use the same fonts as robocon.io"
- Self-hosted OCR-RBCN and OCR-A fonts

**16:07–16:27** — Layout fixes
- "Show full abstract text, don't clip it"
- "Make Earlier Today section visible"
- CSS Grid layout rework

## Day 2: Tuesday Feb 11 — Mobile + Atmosphere

**17:01** — "Make it work on mobile"
- Responsive mobile view

**17:09** — "Move past talks above the NOW card"
- Expandable abstracts, reordered sections

**17:26** — "Add a nice aurora background"
- 3 animated aurora layers, 70 twinkling stars, pulse effects

**17:30** — "Text is hard to read now"
- Increased contrast for readability over aurora

**17:39** — "Add a QR code so people can open it on their phone"
- QR code with mobile link

**17:44** — "Move the day tabs to center, QR to top-right"

## Day 3: Wednesday Feb 12 — Conference Day = Chaos Day

**08:22** — "Auto-expand the first upcoming talk"

**08:26** — "Show all upcoming talks, not just 7"

**08:45** — Markus's request (schedule tweaks)

**11:07** — "What if we had shooting stars with the RF logo?"
- Design doc / brainstorming

**11:27** — Shooting stars implemented
- RF logo comets flying across screen with glowing teal tails
- Edge sparks on impact
- matter.js physics pile at the bottom

**12:02** — "Add walking gnomes"
- Two amigurumi gnomes (red hat & green hat) walking along bottom
- Speech bubbles with RF messages and Finnish greetings
- Dance animation when gnomes meet (music notes)

**~13:00** — "Can one gnome shoot at the stars?"
- Brainstormed: small projectile, split-on-hit effect
- 15% hit chance, homing projectiles

**~14:00** — "Bullets never hit" — fixed with full homing

**~14:30** — "If star falls to the bottom, make a glowing logo. Gnome eats it -> SUPER SAIYAN"
- Golden power-up logos, 1.5x size, 3x speed, explosive push

**~15:00** — "Both gnomes shoot. Super saiyan gets gold lasers"
- Instant gold laser beams, always-hit

**~15:15** — "Make them sing famous songs as duets"
- 7 songs: Bohemian Rhapsody, Never Gonna Give You Up, We Will Rock You, Don't Stop Believin', Hakuna Matata, YMCA, Baby Shark

**15:22** — Committed shooting + super saiyan + singing

**16:08** — "Stars should bounce off walls, not impact"
- Side-wall bouncing with continued flight

**16:25** — "Add Karaoke Party and Community Dinner to the schedule"
- Karaokebar Erottaja @ 20:30, Ravintola Laulu @ 18:30
- Golden shimmer highlight for karaoke in Up Next
- Gnome mega-announcements with gold bubbles

**16:41** — "Repo is public now, update the README"
- Full feature documentation

**16:46** — "Add credit: David Fogl @ Continero, RF Board member"

**17:46** — "Replace dance with pancake eating"
- Gnomes sit down, pancake plate appears, shiny "nom nom, wow pancakes from Kelby!" bubbles
- Shooting only targets bottom 40% of screen
- Fixed karaoke time to 20:30
- Fixed overlapping speech bubbles

## Day 4: Thursday Feb 13 — Conference Day 2

**~09:00** — "Remove the karaoke announcements, no karaoke today"
- Removed karaoke mega-announcement system from gnomes

**~10:00** — "Add Pekka Klärck & René Rohner as walking characters"
- Two new cartoon figures (not gnomes) walking along the bottom
- Pekka: light brown hair, clean-shaven, brown shirt (RF creator)
- René: dark hair with bun, beard, dark clothing (RF Foundation Board Chairman)
- Independent conversation system with RF insider jokes, technical talk, cultural humor
- ~15 conversation scripts alternating between speakers every ~1 minute
- Distinct bubble colors: warm golden-brown (Pekka), cool blue-purple (René)
- No shooting, no pancakes, no super saiyan — just walking and talking

**~10:30** — "Add Mikka Solmela as a third walking character"
- RF Executive Director: light brown hair styled up, glasses, short beard, pink/red hoodie
- 10 new conversations about sponsor hunting, board meetings, action items, and open source budgets
- Pink bubble color matching the hoodie

**~11:00** — "Add after-party to agenda"
- VALA-hosted after-party at Erottajankatu 11 B 9, Helsinki
- Golden shimmer highlight (same as karaoke), always-expanded abstract
- Disco ball emoji in title

---

**Total: ~2 evenings + 2 conference days of vibe coding**

The escalation path:
> schedule display -> aurora -> QR code -> shooting stars -> walking gnomes -> speech bubbles -> dancing -> **guns** -> **SUPER SAIYAN** -> singing Baby Shark -> wall bouncing -> karaoke party -> pancakes from Kelby -> **Pekka & René walk & talk**
