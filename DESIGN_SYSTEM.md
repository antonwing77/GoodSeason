# SeasonScope Design System

## Typography

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 0.75rem (12px) | Badges, metadata, footnotes |
| `sm` | 0.875rem (14px) | Secondary text, descriptions |
| `base` | 1rem (16px) | Body text |
| `lg` | 1.125rem (18px) | Subheadings |
| `xl` | 1.25rem (20px) | Section titles |
| `2xl` | 1.5rem (24px) | Page subtitles |
| `3xl` | 1.875rem (30px) | Page titles |
| `4xl` | 2.25rem (36px) | Hero headings |
| `5xl` | 3rem (48px) | Display text |

**Font Family**: Inter, SF Pro Display, system sans-serif
**Line Height**: 1.5 (normal), 1.625 (relaxed for body)
**Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Spacing Scale

| Token | Value |
|-------|-------|
| `0.5` | 0.125rem (2px) |
| `1` | 0.25rem (4px) |
| `2` | 0.5rem (8px) |
| `3` | 0.75rem (12px) |
| `4` | 1rem (16px) |
| `5` | 1.25rem (20px) |
| `6` | 1.5rem (24px) |
| `8` | 2rem (32px) |
| `10` | 2.5rem (40px) |
| `12` | 3rem (48px) |
| `16` | 4rem (64px) |

## Color Tokens

### Primary (Deep Green)
- `primary-50`: #f0f9f4 — Backgrounds, subtle fills
- `primary-100`: #d9f0e3 — Borders, hover states
- `primary-200`: #b5e1c9 — Badge borders
- `primary-300`: #84cba8 — Accents
- `primary-500`: #319768 — Interactive elements
- `primary-600`: #237a53 — Primary text on light
- `primary-700`: #1d6244 — Buttons, headings

### Neutral (Warm Stone)
- `neutral-50`: #fafaf9 — Page background
- `neutral-100`: #f5f5f4 — Input backgrounds, card hover
- `neutral-200`: #e7e5e4 — Borders
- `neutral-300`: #d6d3d1 — Disabled borders
- `neutral-400`: #a8a29e — Muted text
- `neutral-500`: #78716c — Secondary text
- `neutral-600`: #57534e — Body text
- `neutral-700`: #44403c — Headings
- `neutral-900`: #1c1917 — Primary text

### Semantic
- Success: #22c55e
- Warning: #f59e0b
- Caution: #d97706 (water-risk — calm, not alarmist)
- Error: #ef4444
- Info: #3b82f6

## Badge Variants

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `in_season` | emerald-50 | emerald-700 | Food is in season locally |
| `off_season` | stone-100 | stone-500 | Not currently in season |
| `co2e_low` | emerald-50 | emerald-700 | < 2 kg CO₂e/kg |
| `co2e_medium` | amber-50 | amber-700 | 2–10 kg CO₂e/kg |
| `co2e_high` | red-50 | red-600 | > 10 kg CO₂e/kg |
| `quality_high` | emerald-50 | emerald-700 | Region-specific LCA data |
| `quality_medium` | amber-50 | amber-700 | Global average data |
| `quality_low` | stone-100 | stone-500 | Estimated/imputed |
| `water_risk_low` | emerald-50 | emerald-700 | Low water stress |
| `water_risk_medium` | amber-50 | amber-700 | Medium water stress |
| `water_risk_high` | orange-50 | orange-700 | High water stress |
| `greenhouse` | amber-50 | amber-700 | Heated greenhouse likely |

## Button Variants

| Variant | Style | Usage |
|---------|-------|-------|
| `primary` | Green bg, white text | Main CTAs (Compare, Search) |
| `secondary` | Green border, green text | Secondary actions |
| `ghost` | No bg, subtle hover | Tertiary/inline actions |

**Sizes**: `sm` (h-8), `md` (h-10), `lg` (h-12)
**Border Radius**: `xl` (1rem)

## Component Library

All components in `packages/ui/src/components/`:

| Component | Description |
|-----------|-------------|
| `Badge` | Status indicators with semantic variants |
| `Button` | Primary, secondary, ghost with sizes |
| `Card` | Container with CardHeader, CardContent, CardFooter |
| `Skeleton` | Loading placeholders (text, circular, rectangular) |
| `Tabs` | Tab navigation with TabPanel |
| `Tooltip` | Hover/focus information popover |
| `Modal` | Dialog overlay with backdrop |
| `CitationsPanel` | Collapsible citation list with source links |
| `CitationMarker` | Inline superscript citation number |

## Iconography

- Library: Lucide React (line icons)
- Size convention: 14px inline, 16-18px in badges/actions, 20-24px in navigation
- Color: inherit from text context

## Layout Patterns

- **Container**: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- **Card radius**: `rounded-2xl` (1rem)
- **Card shadow**: `shadow-sm` with subtle border
- **Grid**: 1 col mobile, 2-3 cols tablet, 3-4 cols desktop
- **Spacing between cards**: `gap-4` (1rem)
