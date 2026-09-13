# UOR Internship Management System — Design System
### Material Design 3 Expressive

This replaces the current flat "institutional navy" palette (`src/index.css`) with a full
M3 Expressive system: tonal color roles, a two-family type scale, an expressive shape
scale that morphs on interaction, spring-based motion, and specced components for every
surface the app already has (student workspace, admin console, CV builder, candidate
filtering, shortlisting).

Open **`style-guide.html`** to see everything live (includes a dark-mode toggle).

---

## 1. Why these choices

The app serves two very different users in one product: **students** building a career
narrative (CV, projects, awards — this should feel encouraging and a little vivid) and
**administrators** running deterministic, audit-sensitive workflows (ledgers, filtering,
shortlists — this needs calm density and zero ambiguity). Rather than one generic
corporate-blue theme, the system uses:

- **One seed palette, three roles that read as intentional, not decorative** —
  violet for actions everyone takes, amber for anything related to achievement/CV
  content, teal for anything confirmed/verified. Administrators mostly see primary +
  neutral; students see secondary/tertiary more often, which naturally differentiates
  the two workspaces without two separate stylesheets.
- **Google Sans, one family across every role.** This matches the real M3 spec —
  weight and size carry the hierarchy, not a second typeface. Google Sans is under a
  Google-restricted license and isn't on the public Google Fonts API, so it can't be
  embedded for you automatically; the stack (`'Google Sans', 'Google Sans Text',
  Roboto, system-ui, sans-serif`) picks it up on any device that already has it
  installed (ChromeOS, Android, machines with Workspace apps) and falls back to
  Roboto — the actual default face M3 ships everywhere else — for everyone else. If
  your org has a Google Sans license, self-host the `.woff2` files and add one
  `@font-face` rule above the token block to force it on every device.
- **Expressive shape, used with restraint.** Only interactive, attention-worthy
  elements morph shape (buttons squeeze on press, FABs use the roomier
  extra-large-increased radius, interactive cards round out slightly on hover). Tables,
  fields, and dense admin surfaces stay on the small/extra-small steps — expressiveness
  is spent on the moments that deserve it, not applied uniformly.

## 2. Foundations

### Color (`tokens.css`)
Reference tonal palettes for primary (violet), secondary (amber), tertiary (teal),
error (red) and two neutrals, each with the full 0–100 tone ramp. Semantic roles
(`--md-primary`, `--md-surface-container-high`, `--md-on-primary-container`, …) are
mapped from those tones per the standard M3 light/dark scheme, exposed as CSS custom
properties so existing components can adopt them incrementally alongside the current
`--primary` / `--surface-container` names already in the codebase.

Additional semantic aliases (`--md-success`, `--md-warning`) sit on top of the tertiary
and a warm-amber-adjacent hue respectively, for status meaning rather than raw brand
color — used by the status pill component.

### Typography
All roles use **Google Sans** (→ Roboto fallback). Weight and size carry hierarchy:

| Role | Size/line | Weight |
|---|---|---|
| Display L/M/S | 57/45/36 | 700 |
| Headline L/M/S | 32/28/24 | 700 |
| Title L/M/S | 22/16/14 | 500 |
| Label L/M/S | 14/12/11 | 500 |
| Body L/M/S | 16/14/12 | 400 |

### Shape
`none → xs(4) → sm(8) → md(12) → lg(16) → lg-increased(20) → xl(28) → xl-increased(32)
→ xxl(48) → full`. Components declare **two** shape tokens — resting and pressed/hover —
and transition between them with the "spring-fast" motion token, which is the core
Expressive signature (see `components.css`, e.g. `.m3-button:active`).

### Motion
CSS can't do true spring physics, so spatial changes (shape, position, size) use
overshooting cubic-beziers that *feel* spring-driven (`--md-spring-fast/default/slow`),
while opacity/color changes use calm standard easing (`--md-motion-standard`) so text
and icons never look bouncy. `prefers-reduced-motion` disables all shape-morphing and
the loader animation.

### Elevation & state layers
Six elevation levels (tonal shadow pairs) and the standard M3 state-layer opacities
(hover 8%, focus/pressed 10%, dragged 16%, disabled content 38%/container 12%).

## 3. Components specced

| Component | Variants | Primary use in this app |
|---|---|---|
| Button | filled, tonal, outlined, text, elevated, danger | Save/submit actions across both workspaces |
| Icon button | standard, filled, tonal, outlined, toggle | Top bar actions, table row actions |
| FAB | small, default, large, extended, surface | "New project", "Export CVs" |
| Segmented control | 2–3 way toggle | Draft/Final shortlist, Student/Admin scoped views |
| Chip | assist, filter, input, suggestion | Skill tags in candidate filtering & CV builder |
| Status pill | draft, submitted, under-review, shortlisted, verified, rejected | CV state, internship request state, candidate state |
| Card | elevated, filled, outlined, interactive | Internship listings, student profile summaries, GPA card |
| Text field | filled, outlined, error | Registration, CV section forms |
| Top app bar | — | Every route |
| Navigation rail | — | Admin desktop layout |
| Navigation bar | — | Student mobile layout |
| Tabs | — | Student profile sections, candidate detail |
| Data table | selectable rows | Candidate filtering grid, academic ledger staging |
| Dialog | — | Finalize shortlist, destructive confirmations |
| Snackbar | with action | Export confirmations, undo |
| Loading indicator | organic shape-morph | Replaces the plain spinner already in `app-spinner` |
| Skeleton | shimmer | Route-level skeletons already used in the app |

## 4. Adopting this in the codebase

1. Drop `tokens.css` in as the new `src/styles/tokens.css` (currently an empty
   placeholder) and `components.css` alongside it; import both after `index.css` resets
   but before feature styles, so `m3-*` classes can be introduced feature-by-feature.
2. Existing components (`Button.tsx`, `Card.tsx`, `Chip.tsx`, `StatusBadge.tsx`) keep
   their current class names (`button`, `button-primary`, …) as aliases — add the
   `m3-button m3-button--filled` classes alongside them, confirm visually, then retire
   the old CSS once every usage is migrated.
3. `--primary`, `--surface-container`, etc. in `src/index.css` can be redefined to
   reference `var(--md-primary)` etc. as a one-line bridge, so screens not yet migrated
   to `m3-*` classes still pick up the new palette immediately.
