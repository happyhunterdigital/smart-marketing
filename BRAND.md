# Happy Hunter Digital — Brand Guidelines

The official brand reference for Happy Hunter Digital and the Smart Marketing tool suite. Everything we ship — sites, dashboards, docs, videos — follows this.

---

## 1. Brand strategy

| | |
| --- | --- |
| **Category** | AI-first digital marketing for local business |
| **Audience** | SA SMEs and the agencies that serve them |
| **Personality** | Confident, forensic, plain-spoken, results-driven |
| **Core metaphor** | **The Hunter.** We read the digital world like tracks in the bush — nothing is random, every signal points somewhere |
| **Emotional promise** | If an AI cannot verify your business exists, you don't exist. We make you verifiable. |
| **Positioning line** | Entity-first marketing. Agentic revenue systems. |
| **What we are not** | Another "post and pray" agency |

The brand hangs on one idea: **every business on the map is a lead until it has been contacted; every business online is verifiable or invisible.** The tools in this repo pursue that single mission from different angles.

## 2. Logo

- **Wordmark:** lowercase lockup — `happyhunter` in white bold + `digital` in amber — unrelated to the imagery of a specific hunter; it plays on the name only.
- **Mark:** rounded-square gold-on-black emblem (Cloudinary asset), used as the app icon and favicon.
- **Wordmark variant:** the footer splits the name across three tone steps: `happy` white, `hunter` amber, `digital` gray — reserved for quiet/supporting contexts.

### Logo rules

- Black text on amber for the wordmark in dark contexts; white on black with the amber segment for light contexts.
- Never recolor the amber to another hue.
- Never rotate, stretch, add effects, or place it on a busy photograph without a dark scrim.
- Minimum clear space: the height of the `h` on every side.

## 3. Colour system

One black canvas, one gold signal. That is the whole system.

### Canvas (near-black)

| Token | Hex | Use |
| --- | --- | --- |
| `deep.950` | `#050505` | App background (`App.tsx`) |
| `deep.900` / modal | `#0a0a0a` | Cards, modals, popups |
| `deep.950` blue-tinted | `#0a0a0f` | Section backgrounds, hero canvas |
| Elevated card | `#111827` | Article/feature surfaces |
| Hairline border | `rgba(255,255,255,0.05)` | Card dividers |

### Signal (amber/gold)

| Token | Hex | Use |
| --- | --- | --- |
| `amber.400` | `#fbbf24` | Active states, gradient start, icon accents |
| `amber.500` | `#f59e0b` | Primary CTA fills, marquee bar |
| `yellow.500` | `#eab308` | Hover/focus on dark, modal accents |
| `orange.500` | `#f97316` | Gradient end, hover warmth |

- **CTA pattern:** amber bar + black text + black border on light surfaces. Black-on-amber is the signature.
- **Glow:** `0 0 40px rgba(251,191,36,0.15)` — amber-tinted shadows are the only shadows we use; never pure-black drop shadows for emphasis.
- **Semantic exceptions only:** WhatsApp green `#25D366`, status green `#22c55e`, status red `#ef4444`, Google brand colors in OAuth buttons. These are functional, never decorative.

### Rules

- One accent. Everything is black + amber. If a section needs emphasis it gets more amber, never a second hue (purple/blue accents are banned outside the audit tool's schema viz).
- Black text on amber everywhere; amber text on black for labels; gray `#9ca3af` for muted copy.

## 4. Typography

| Role | Font | Notes |
| --- | --- | --- |
| Display / headings | **Cal Sans** (`display`) | Big, bold, tight tracking |
| Body / UI | **Inter** (`sans`) | Default; `font-sans` |
| Handwriting accent | **Caveat** (`handwriting`) | Warm phrase marks — "happyhunterdigital", founder signature |
| Meta / labels / data | **Monospace** (`font-mono`) | System SF Mono / JetBrains Mono style |

### Signature moves

- **Uppercase labels:** `text-[10px] font-black uppercase tracking-[0.2em]` for eyebrows, section tags, "forensic" micro-labels.
- **Black weight CTAs:** `font-black uppercase tracking-widest` (or `[0.2em]`) on solid amber buttons.
- **Rounded squash:** cards `rounded-2xl`–`rounded-[3rem]`, buttons `rounded-xl`–`rounded-2xl` — never pill for large surfaces.
- Bold, generous type scale; short, web and mobile-readable lines.

## 5. Voice & tone

**Write like a hunter reads tracks — observe, state, move.**

- Plain business English. Short sentences. Active voice.
- If a number is real, use it. If it is invented, do not fake precision.
- No corporate filler ("we're thrilled", "leveraging synergy", "game-changer").
- No emojis in product or docs UI. No AI-copywriter clichés.
- Product docs: lead with what the tool does for the customer, then how.

**Tone words:** confident, forensic, calm, direct, warm-professional (SA English, not American hype).

**Taglines we actually use:**

- "The hunter's edge." (working)
- "Your business exists. To Google, it might as well be a ghost — until we fix that."
- "Agentic revenue systems."
- "No jargon, no obligation."

## 6. Components & patterns

- **Double-bezel cards:** outer shell `p-1.5` + `rounded-[2rem]` + hairline ring; inner core `rounded-[calc(2rem-0.375rem)]` on `#0a0a0a`. Cards sit in trays, not flat on the canvas.
- **CTA button-in-button:** rounded pill CTA with the trailing arrow nested in its own circular wrapper, flush with the button's inner padding; `active:scale-[0.98]` for physical press.
- **Macro whitespace:** sections `py-24`–`py-40`. The layouts breathe.
- **Ambient depth:** amber radial glows at `5%` opacity (`bg-amber-500/5`), slow drift; fixed `pointer-events-none` layers only.
- **Noise/grain:** reserved for fixed overlays, never scroll containers (mobile FPS).
- **Section eyes:** uppercase micro-tag above H1/H2 — used sparingly, not on every section.

## 7. Application notes

| Surface | Treatment |
| --- | --- |
| Hero | Near-black canvas, amber radial glow, gradient header `from-amber-400 via-orange-400 to-red-400` for one highlighted word |
| Marquee bar | `bg-gradient-to-r from-amber-500 to-orange-500`, black text, uppercase, `tracking-[0.2em]` |
| Nav | Floating, `bg-[#0a0a0f]/90 backdrop-blur-2xl`, hairline bottom border; active link `text-amber-400 bg-amber-500/10` |
| Modals / popups | `#0a0a0a`, `border-amber-500/25`, amber glow — the "signal in the dark" moment |
| Data rows (Audit/Mission Control) | `font-mono text-xs uppercase tracking-widest` labels, hairline `border-gray-800` separators |
| Client portal | Same system, mono identity labels (`Node Identity`) |

## 8. Do / Don't

| Do | Don't |
| --- | --- |
| Use black + amber as 95% of the palette | Add second accents "to make it pop" |
| Black text on amber CTAs | Amber text on amber fills |
| Uppercase mono/black labels | Sentence-case eyebrow clutter on every section |
| Use the exchange "hunter → lead → contact" metaphor | Show clip-art animals or literal hunter imagery |
| Write plain forensic English | Write hype, emojis, or fake numbers |

## 9. Files in this repo

Docs inside this repo (per tool in `skills/`) follow Section 5's voice and may reference this file as `BRAND.md`.