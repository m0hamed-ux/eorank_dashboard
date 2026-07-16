# EORank Dashboard — Design System

The single source of truth for how the dashboard looks and feels. Every visual decision in code must trace back to a rule here. If a rule is missing, add it here first, then implement.

**Aesthetic in one sentence:** a calm, warm-paper analytics surface with near-black ink, one violet accent used with intent, and numbers treated as the hero content.

Inspired by editorial/instrument-panel dashboards: generous whitespace, soft large-radius cards, monospaced metrics, tiny semantic trend markers — never gradients-everywhere, glassmorphism, or five competing accent colors. That is what "vibe-coded" looks like; we do the opposite.

---

## 1. Core Principles

1. **Ink on paper.** The UI is 90% neutral (warm white canvas, black ink). Color means something happened — it is never decoration.
2. **One accent.** Violet `#7C4DFF` is the only brand accent. It marks the primary action on a screen, active navigation, and the "you/your brand" series in charts. If violet appears more than ~3 times in a viewport, something is wrong.
3. **Numbers are the product.** Metrics are the largest, boldest elements on any screen — set in mono with tabular figures. Labels are small and quiet.
4. **Semantic color is reserved.** Green = cited/up, red = not cited/down, amber = pending/partial. These never appear for any other reason, and violet is never used to say "good".
5. **Hierarchy by weight and size, not boxes-in-boxes.** One card level deep. Inside a card, use type scale and spacing — never nested bordered cards.
6. **Every state designed.** Loading (skeleton), empty (icon + one sentence + one action), error (message + retry). No view ships with only the happy path.

---

## 2. Color

All colors live as CSS variables in `app/globals.css` and are consumed through Tailwind tokens (`bg-background`, `text-primary`, …). **Never hardcode a hex value in a component.**

### Brand

| Token | Value | Usage |
|---|---|---|
| Ink (black) | `#0A0A0A` | Foreground text (light), background (dark) |
| Violet | `#7C4DFF` | `--primary` in **both** themes — actions, active nav, brand chart series, focus rings |
| Violet – hover | `#6B3DF0` | Pressed/hover state of primary |
| Violet – soft | `#7C4DFF` at 10–12% | Tinted backgrounds behind active/selected items |

### Light theme (default)

| Token | Value (oklch) | Notes |
|---|---|---|
| `--background` | `oklch(0.977 0.003 90)` | Warm paper, not pure white — the canvas |
| `--card` / `--popover` | `oklch(1 0 0)` | Pure white cards float on the warm canvas |
| `--foreground` | `oklch(0.155 0 0)` | Near-black ink |
| `--muted` | `oklch(0.955 0.003 90)` | Subtle fills (skeletons, inactive tracks) |
| `--muted-foreground` | `oklch(0.50 0.01 90)` | Secondary text, labels |
| `--border` | `oklch(0.92 0.004 90)` | Hairlines; warm, low-contrast |
| `--sidebar` | `oklch(0.965 0.004 90)` | Slightly deeper than canvas |

### Dark theme

Black-first: background is near-black `oklch(0.145 0.005 285)` with a barely-there violet cast; cards one step lighter `oklch(0.185 0.006 285)`; same violet primary; borders are white at 8–10%.

### Semantic (identical meaning in both themes)

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--success` | `oklch(0.55 0.15 150)` | `oklch(0.72 0.17 150)` | Cited, positive delta, job completed |
| `--warning` | `oklch(0.70 0.15 75)` | `oklch(0.80 0.16 80)` | Pending, running, partial |
| `--destructive` | `oklch(0.577 0.245 27)` | `oklch(0.704 0.191 22)` | Not cited, failed, negative delta |

Semantic colors are used in three shapes only: text of a delta (`+8.4%`), a status badge (soft tinted bg + colored text), or a dot indicator. Never as large fills.

### Charts

| Token | Value | Series |
|---|---|---|
| `--chart-1` | violet `#7C4DFF` | **Always "you" / your brand** |
| `--chart-2` | `oklch(0.62 0.17 150)` green | Positive series (citation rate) |
| `--chart-3` | `oklch(0.65 0.24 5)` pink/red | Negative or alert series |
| `--chart-4` | `oklch(0.75 0.15 80)` amber | Pending/neutral series |
| `--chart-5` | `oklch(0.55 0.01 90)` grey | Competitors, baselines |

Competitors are always grey/desaturated — the user's brand is the only saturated line on a comparison chart.

---

## 3. Typography

Two families, already wired in `app/layout.tsx`:

| Role | Font | Token |
|---|---|---|
| UI text | Inter | `font-sans` |
| Metrics, numbers, code, domains | Geist Mono | `font-mono` |

**Rule: every number a user reads is mono with tabular figures** (`font-mono tabular-nums`) — KPI values, table cells with counts, percentages, timestamps. This is the signature look (see the `12,480` / `142ms` treatment in the reference).

### Scale (only these — no arbitrary sizes)

| Use | Classes |
|---|---|
| KPI value (hero) | `text-4xl font-semibold font-mono tabular-nums tracking-tight` |
| Page title | `text-base font-semibold` (header bar) |
| Section/card title | `text-sm font-medium` |
| Body | `text-sm` |
| Label / caption / delta | `text-xs text-muted-foreground` |
| Table data (numeric) | `text-sm font-mono tabular-nums` |

Weights: 400, 500, 600 only. Never 700+, never light weights.

---

## 4. Spacing, Radius, Elevation

- **Spacing:** Tailwind scale only. Card padding `p-5` or `p-6`; gaps between cards `gap-4`; page gutter `p-4` (set by layout). Vertical rhythm inside cards: `gap-2` label→value, `gap-4` between blocks.
- **Radius:** base `--radius: 0.625rem`. Cards and dialogs `rounded-xl`, buttons/inputs `rounded-lg`, badges/pills `rounded-full`. Large soft corners are part of the look — never `rounded-sm` on a card.
- **Elevation:** borders, not shadows, define edges. Cards: `border` + `shadow-xs` at most. Popovers/dialogs may use `shadow-md`. No colored glows, no `shadow-2xl`.
- **Density:** dashboards breathe — resist packing. One row of KPIs (3–4 cards), then one main content region per screen.

---

## 5. Components

Primitives come from shadcn/ui in `components/ui/` (don't restyle them ad hoc — change tokens instead). Product components composed from primitives live in `components/`.

### Stat card (`components/stat-card.tsx`) — the workhorse

Anatomy, top to bottom (matches the reference image):

```
[ value      42.8%        ]  ← text-4xl font-mono tabular-nums
[ delta ↗ +8.4%  label    ]  ← delta in success/destructive, text-xs
[ optional spark/bar viz  ]  ← 32–40px tall, single series
[ footer: icon + metric name ]  ← text-xs text-muted-foreground, top border
```

Value first, context second. Delta arrows: `TrendingUp`/`TrendingDown` at `size-3.5`, colored `text-success`/`text-destructive`; the metric label next to the delta stays muted.

### Buttons

- One `default` (violet) button per view — the primary action ("New Job").
- Everything else: `outline` or `ghost`.
- Destructive actions use the `destructive` variant and always confirm via dialog.

### Badges / status pills

Soft tint + colored text, `rounded-full text-xs font-medium px-2 py-0.5`:
`completed` → success tint · `running`/`pending` → warning tint · `failed` → destructive tint · `partial` → warning tint. Provider badges (ChatGPT, Gemini, Claude, Perplexity) are neutral (muted bg) — provider brand colors only in their logo glyph.

### Sidebar

Collapsible icon sidebar (exists in `components/app-sidebar.tsx`). Active item: sidebar-accent bg + `text-foreground` + 2px violet rail on the left. Inactive: `text-muted-foreground`. Never fill the active item with solid violet.

### Tables

- Numeric columns right-aligned, `font-mono tabular-nums`.
- Row hover `bg-muted/50`; no zebra striping.
- Header row: `text-xs text-muted-foreground font-medium`, no background fill.

### Charts (Recharts, wrapped in `components/charts/`)

- Grid lines: horizontal only, `--border`, dashed.
- No chart legends when one series — label in the card title instead.
- Axis text: `text-xs`, muted. No axis lines, ticks outside.
- Line charts: `strokeWidth={2}`, no dots except on hover; area fills at 8–10% opacity max.
- Tooltips use the popover style (white card, border, `shadow-md`).

---

## 6. Motion

- Transitions: `transition-colors duration-150` for interactive states. That's the default; nothing longer than 300ms.
- Skeletons pulse (`animate-pulse`), spinners only inside buttons during submit.
- No entrance animations on route change, no parallax, no springy card hovers. Data appearing fast **is** the animation.

## 7. Accessibility

- All text ≥ 4.5:1 contrast against its background (the warm palette above passes; check any new tint).
- Focus: visible ring `ring-2 ring-ring/50` (violet) on every interactive element — never `outline-none` without a replacement.
- Color never carries meaning alone: deltas keep the arrow icon, statuses keep the text label.
- Hit targets ≥ 32px; icon-only buttons get `aria-label` and a tooltip.

## 8. Hard Don'ts

- ❌ Hex values, arbitrary Tailwind colors (`bg-[#...]`), or arbitrary font sizes in components
- ❌ Violet as a status/success color, or semantic colors as decoration
- ❌ Gradients, glassmorphism/blur cards, colored shadows, glow effects
- ❌ Nested bordered cards, more than one primary button per view
- ❌ Proportional-figure numerals in metrics or tables (always `tabular-nums`)
- ❌ Emojis as icons — lucide-react only, `size-4` inline / `size-3.5` in deltas
