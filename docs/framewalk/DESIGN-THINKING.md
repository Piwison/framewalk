# FrameWalk — Design Thinking Workup

> 街拍日課 · A photo-walk companion that beats creative block and the fear of strangers.
> Method: Empathize → Define → Ideate → Prototype → Test. Owner: Jason (PM). 2026-06-21.
> Status: pre-build. Personas and quotes are evidence-grounded composites from public
> photographer communities and 2026 industry reporting (see Sources); they are explicit
> assumptions to validate in the Test phase, not field-interview data.

---

## 1. Empathize

### Who we're designing for
The plateauing **hobbyist street / daily-life photographer** — has a capable camera (or
just a phone), 1–4 years in, follows the craft online, but shoots alone and sporadically.
Not a pro, not a beginner who needs exposure-triangle lessons.

### Personas

**P1 — "Plateau Pete" (primary)**
Mid-30s, weekday office job, shoots on weekends. Owns a Fujifilm X100-series. Has ~12,000
photos, has *printed* maybe 6. Watches street-photography YouTube but his own work feels
stuck. Goes out "to see what happens," comes back deflated.
- **Goals:** feel like he's improving; make work he's proud of; enjoy the walk.
- **Frustrations:** blank-page paralysis; nerves about photographing strangers; keepers
  vanish into Lightroom and are never seen again.
- **Quote:** *"I have all the gear and no reason to leave the house. And when I do, I freeze
  the second someone interesting walks by."*

**P2 — "Travel-record Rin" (secondary)**
Late-20s, photographs daily life and trips, mostly on phone + a compact. Wants her travel
and everyday memories to *mean* something, not just pile up.
- **Goals:** capture the feeling of a place/day; revisit and relive it later.
- **Frustrations:** thousands of near-duplicate shots; no time/skill to cull; the "story"
  evaporates within a week.
- **Quote:** *"By the time I get home I can't even remember why I took half of these."*

**P3 — "Nervous-portrait Noah" (tertiary, → alt feature)**
Wants to shoot portraits of friends but both he and the subject get stiff and awkward, so he
avoids it.

### What the research says (pain, in their words and the data)
- **Blank page kills practice.** Going out with no intention quietly lowers expectations
  before the first frame; unplanned shooting correlates with stalled growth.
- **Fear of strangers** is repeatedly named as the hardest, most-avoided part of street work.
- **Backlog + admin drowns the joy.** ~22% of working photographers spend >half their hours
  on non-shooting tasks (culling, sorting, admin); 42% want AI help there. Hobbyists feel a
  smaller version: the cull never happens, so nothing ships.
- **Meaning lives in the story.** Communities consistently say growth comes from sharing the
  *story behind a shot*, not just the shot.
- **2026 aesthetic shift:** away from over-perfect/over-AI toward *human, imperfect, real* —
  which validates a tool that coaches the human eye instead of auto-generating images.

### Empathy map (P1)
- **Says:** "I'm in a rut." "I don't know what to shoot."
- **Thinks:** "Everyone else is better." "Is it rude to photograph them?"
- **Does:** scrolls inspiration, over-buys gear, shoots bursts, never culls.
- **Feels:** stuck, self-conscious, guilty about the backlog.

---

## 2. Define

### Point-of-view statements
- *Plateau Pete needs a small, concrete reason to go out and gentle structure once he's
  there, because what stalls his craft isn't skill — it's the blank page and the nerve to
  raise the camera at a stranger.*
- *Travel-record Rin needs her shots to become a kept story quickly, because the meaning of
  a day decays within days and the backlog guarantees it's lost.*

### How-Might-We
- HMW give a photographer a reason to leave the house that feels like play, not homework?
- HMW lower the social fear of photographing people, ethically and without being creepy?
- HMW make culling so light it actually happens — in minutes, on the couch?
- HMW preserve the *story* of a shot while the memory is still warm?
- HMW make improvement *felt* without turning it into vanity metrics?

### Jobs To Be Done
1. *When I have a free morning, help me **decide what to practice** so the walk has a point.*
2. *When an interesting stranger appears, help me **find the nerve and the etiquette** to shoot.*
3. *When I get home, help me **keep the 3 that matter** and let the rest go.*
4. *Over weeks, help me **see that I'm growing** so I keep going.*

### Design principles (the spine of every decision)
1. **The human eye is the product.** We never generate or "fix" the photo. We coach the act.
2. **A reason, not a chore.** Missions are invitations, framed as play. No streak guilt.
3. **Calm over gamified.** Quiet, reflective tone. No leaderboards, no dopamine slot-machine.
4. **Private by default.** Photos can stay on-device; that's both an ethic and the $0 model.
5. **Ship the story.** A keeper isn't done until it has one line of meaning attached.

---

## 3. Ideate

### Concepts considered (and the verdict)
| Concept | Verdict |
|---|---|
| AI auto-editor / filter pack | ✗ Violates principle 1; crowded; "AI slop." |
| Pure AI culling tool | ✗ Many exist; commodity; not the core wound. |
| Social feed for street photographers | ✗ Re-creates comparison anxiety we're solving. |
| **Photo-walk missions + approach coaching + light cull + story diary** | ✓ Hits all 4 JTBD; differentiated; buildable & cheap. |
| Portrait real-time pose/expression cues (PoseCue) | ◐ Strong, but scope it as a later module. |

### The chosen concept — FrameWalk
A companion for the *act* of shooting and the *meaning* afterward, in three beats:

1. **Before / during the walk — Missions.** A small, contextual assignment ("today:
   reflections," "a stranger in red," "the decisive gesture, waist-level, no eye contact"),
   tuned to time of day, light, location type, and the user's recent work. Plus optional
   **approach cards**: 1-line, kind, ethical scripts for shooting people, and a "no means no,
   smile and move on" etiquette spine.
2. **After — Quick cull.** Import the session and do a fast, **manual** one-thumb keep/let-go
   pass that takes minutes (no AI in the MVP; an optional on-device keeper-suggestion assist
   is deferred — see `BACKLOG.md`).
3. **Keep the story.** For each keeper, one prompt → one line of meaning. Builds a private,
   scrollable **visual diary** that shows growth over time (themes practiced, not vanity stats).

### Differentiator in one line
Not an editor, not a feed — a *practice and a journal* that treats your eye as the point.

---

## 4. Prototype (concept to validate, not yet built)

- **Form:** mobile-first PWA (installable, works offline for missions; camera roll import).
- **Lowest-fidelity test first:** a clickable Figma/HTML flow of the three beats + 20 sample
  missions, before any AI wiring.
- **Riskiest assumption to prototype:** that *missions* meaningfully change whether people go
  out and how the session feels — test this with a no-code/manual version (texted missions)
  before building generation.
- **Missions faked first ("Wizard of Oz"):** hand-write missions and story prompts for 5–10
  testers for two weeks. The MVP itself stays curated/manual with **no AI**; any future
  generation is deferred (see `PRD.md` / `BACKLOG.md`) and only considered once missions
  prove their pull.

---

## 5. Test — how we'll know it's working

### Riskiest assumptions, ranked
1. **Missions drive action.** People with a mission go out more and enjoy it more than
   free-shooting. *(If false, the whole thesis is wrong — test first.)*
2. **Approach cards reduce the fear** enough to take at least one people-shot they'd otherwise
   skip.
3. **The light cull + story habit sticks** past week 2.
4. **People feel growth** and attribute it to the tool.

### Test methods
- **Concierge pilot (2 weeks, 5–10 photographers):** manual missions by text, weekly check-in.
- **Diary study:** after each walk, a 3-question log (Did you go? Did the mission help? Did you
  shoot a person you'd normally skip?).
- **First-click / usability test** on the cull flow (target: a session culled in < 5 min).
- **5-second test** on tone — does the app *feel* calm and encouraging, or like homework?

### Success signals (qualitative gates before scaling)
- ≥ 60% of pilot walks "felt more purposeful" than usual.
- ≥ half of testers take at least one people-shot they'd normally avoid.
- ≥ 50% still logging in week 2 without nagging.
- Spontaneous quotes about *enjoying the walk again* (the real win).

> Quantitative product metrics (activation, W4 retention, keepers-with-stories rate) live in
> `PRD.md §10`. This phase is about learning whether the bet is real — cheaply, before we build.

---

## Sources
- [The 2026 State of Photography report](https://37framesphotographyblog.com/2026-state-of-photography-industry-report/)
- [What's the plan for your street photography in 2026 — Craig Boehman](https://craigboehman.com/blog/whats-the-plan-for-your-street-photography-in-2026)
- [AI tools for photographers 2026 — Barnimages](https://barnimages.com/blog/tools/best-ai-tools-photographers-2026/)
- [2026 photography trend: less perfection, more human — Digital Camera World](https://www.digitalcameraworld.com/tech/artificial-intelligence/the-trend-in-photography-in-2026-will-be-for-less-perfection-and-more-human-and-even-this-ai-focused-software-company-agrees)
- [Photography community challenges — Mango Street](https://www.mangostreetlab.com/blog/photography-community-challenges)
