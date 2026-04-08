# 🎨 MiniCode UI Theme — Clean & Minimal (Light Mode)

> **Design Philosophy:** A modern, approachable EdTech platform inspired by **Notion**, **Linear**, and **Vercel**.
> Clean surfaces, readable typography, bold accents, and zero visual noise.
> Built for students who spend hours on the platform — comfort and clarity over flashiness.

---

## 1. 🌈 Color Palette

### Core Colors

| Token                | Hex         | HSL                    | Usage                          |
|----------------------|-------------|------------------------|--------------------------------|
| `--background`       | `#FFFFFF`   | `0 0% 100%`           | Page base                      |
| `--surface`          | `#F8FAFC`   | `210 40% 98%`         | Cards, elevated sections       |
| `--surface-hover`    | `#F1F5F9`   | `210 40% 96%`         | Card hover state               |
| `--border`           | `#E2E8F0`   | `214 32% 91%`         | Dividers, card borders         |
| `--border-hover`     | `#CBD5E1`   | `213 27% 84%`         | Hover borders                  |
| `--input`            | `#F1F5F9`   | `210 40% 96%`         | Input field backgrounds        |
| `--input-focus`      | `#FFFFFF`   | `0 0% 100%`           | Input focus state              |

### Text Colors

| Token                | Hex         | Usage                          |
|----------------------|-------------|--------------------------------|
| `--text-primary`     | `#0F172A`   | Headings, primary content      |
| `--text-secondary`   | `#475569`   | Body text, descriptions        |
| `--text-muted`       | `#94A3B8`   | Placeholders, hints, captions  |
| `--text-inverse`     | `#FFFFFF`   | Text on colored backgrounds    |

### Brand / Accent Colors

| Token                | Hex         | Usage                          |
|----------------------|-------------|--------------------------------|
| `--primary`          | `#7C3AED`   | CTAs, active nav, links        |
| `--primary-hover`    | `#6D28D9`   | Primary button hover           |
| `--primary-light`    | `#EDE9FE`   | Primary badges, subtle bg      |
| `--primary-muted`    | `#DDD6FE`   | Selected states, tags          |
| `--secondary`        | `#06B6D4`   | Secondary accents (optional)   |

### Semantic / Feedback Colors

| State     | Color       | Light BG      | Usage                    |
|-----------|-------------|---------------|--------------------------|
| Success   | `#10B981`   | `#ECFDF5`     | Accepted, correct        |
| Warning   | `#F59E0B`   | `#FFFBEB`     | Pending, judging         |
| Error     | `#EF4444`   | `#FEF2F2`     | Failed, wrong answer     |
| Info      | `#3B82F6`   | `#EFF6FF`     | Informational notices    |

### Difficulty Badges

| Difficulty | Text Color  | Background    | Border        |
|------------|-------------|---------------|---------------|
| Easy       | `#059669`   | `#ECFDF5`     | `#A7F3D0`     |
| Medium     | `#D97706`   | `#FFFBEB`     | `#FDE68A`     |
| Hard       | `#DC2626`   | `#FEF2F2`     | `#FECACA`     |

---

## 2. 🔤 Typography

### Font Family
```
Primary:    'Inter', system-ui, -apple-system, sans-serif
Code/Mono:  'JetBrains Mono', 'Fira Code', monospace
```

> **Load via Google Fonts or Next.js font optimization.**

### Font Scale

| Element              | Size       | Weight | Line Height | Tracking       |
|----------------------|------------|--------|-------------|----------------|
| Page Title (h1)      | `2.25rem`  | 700    | 1.2         | `-0.025em`     |
| Section Title (h2)   | `1.5rem`   | 700    | 1.3         | `-0.02em`      |
| Card Title (h3)      | `1.125rem` | 600    | 1.4         | `-0.01em`      |
| Body                 | `0.875rem` | 400    | 1.6         | `0`            |
| Caption / Label      | `0.75rem`  | 500    | 1.5         | `0.02em`       |
| Tiny / Badge         | `0.6875rem`| 600    | 1.4         | `0.03em`       |
| Code                 | `0.8125rem`| 400    | 1.7         | `0`            |

### Text Style Rules
- **No more ALL CAPS everywhere** — Use sentence case for body, title case for headings
- **Bold sparingly** — Only headings and emphasis. Body text stays `font-normal` or `font-medium`
- **No tracking-widest on body** — Reserve letter-spacing for small labels only

---

## 3. 📐 Spacing & Layout

### Spacing Scale
```
4px  → gap-1, p-1     (tight internal spacing)
8px  → gap-2, p-2     (compact elements)
12px → gap-3, p-3     (standard internal)
16px → gap-4, p-4     (card padding, list gaps)
24px → gap-6, p-6     (section spacing)
32px → gap-8, p-8     (large section gaps)
48px → gap-12         (page section separators)
64px → gap-16         (major page blocks)
```

### Border Radius
| Element          | Radius     | Tailwind       |
|------------------|------------|----------------|
| Buttons          | `8px`      | `rounded-lg`   |
| Cards            | `12px`     | `rounded-xl`   |
| Inputs           | `8px`      | `rounded-lg`   |
| Badges / Tags    | `6px`      | `rounded-md`   |
| Avatars          | `50%`      | `rounded-full` |
| Modals / Panels  | `16px`     | `rounded-2xl`  |

> **No more `rounded-[3rem]` or `rounded-[4.5rem]`** — Keep it tight and modern.

### Max Widths
```
Content:    max-w-6xl (1152px)
Wide:       max-w-7xl (1280px)  
Full:       max-w-[1400px]
Navbar:     max-w-[1400px]
```

---

## 4. 🧱 Component Styles

### Navbar
```
Background:   white (with subtle bottom border)
Border:       border-b border-gray-200
Height:       h-16
Shadow:       none or shadow-sm on scroll
Logo:         colored icon + dark text
Nav links:    text-gray-500 → hover:text-gray-900, active:text-primary
```

### Cards
```
Background:   white
Border:       border border-gray-200
Shadow:       shadow-sm
Hover:        shadow-md + border-gray-300
Radius:       rounded-xl (12px)
Padding:      p-5 or p-6
```

### Buttons

| Variant     | Background       | Text          | Border           | Hover                  |
|-------------|------------------|---------------|------------------|------------------------|
| Primary     | `--primary`      | White         | None             | `--primary-hover`      |
| Secondary   | `white`          | `--primary`   | `border-gray-200`| `bg-gray-50`           |
| Ghost       | `transparent`    | `--text-secondary` | None        | `bg-gray-100`          |
| Danger      | `#EF4444`        | White         | None             | `#DC2626`              |

```
Padding:     px-4 py-2.5
Font:        text-sm font-medium
Radius:      rounded-lg
Transition:  transition-all duration-200
```

### Inputs
```
Background:   bg-gray-50
Border:       border border-gray-200
Focus:        border-primary ring-2 ring-primary/20 bg-white
Radius:       rounded-lg
Padding:      px-4 py-3
Font:         text-sm text-gray-900
Placeholder:  text-gray-400
```

### Badges / Tags
```
Background:   colored light bg (e.g., bg-violet-50)
Text:         colored text (e.g., text-violet-700)  
Font:         text-xs font-medium
Padding:      px-2.5 py-1
Radius:       rounded-md
```

### Tables
```
Header:       bg-gray-50, text-xs font-medium text-gray-500 uppercase
Row:          border-b border-gray-100, hover:bg-gray-50
Cell padding: px-6 py-4
Text:         text-sm text-gray-700
```

---

## 5. ✨ Animations & Interactions

### Transitions
```
Default:     transition-all duration-200 ease-out
Buttons:     hover:scale-[1.02] active:scale-[0.98]  (subtle only)
Cards:       hover → shadow lift + border darken
Modals:      fade-in + slight scale-up
Page loads:  skeleton placeholders (gray-100 shimmer)
```

### What to REMOVE
- ❌ Neon border glows
- ❌ Glassmorphism / backdrop-blur
- ❌ Particle canvas backgrounds
- ❌ Pulsing ambient orbs
- ❌ Extreme scale animations

### What to KEEP (but tone down)
- ✅ Framer Motion page transitions (subtle fade/slide)
- ✅ XP bar fill animations (smooth ease-out)
- ✅ Contribution heatmap hover tooltips
- ✅ Achievement unlock animations (confetti → subtle checkmark appear)

---

## 6. 🖥️ Page-Specific Guidelines

### Login Page
```
Layout:       Centered card on clean white/light-grey background
Background:   White or subtle gradient (gray-50 → white)
Auth card:    White, rounded-2xl, shadow-lg, max-w-md
GitHub btn:   Black bg (#0F172A) with GitHub icon
Faculty btn:  Outline/ghost style
Branding:     Clean logo + tagline, no particle effects
```

### Problems Page
```
Layout:       Clean header + filter bar + 3-column grid
Search:       Simple input with search icon, bg-gray-50
Filters:      Pill-style toggle buttons (rounded-full)
Cards:        White cards with difficulty badge, title, XP reward
Empty state:  Friendly illustration + "No problems found"
```

### Profile Page
```
Layout:       Sidebar nav + content area
Avatar:       rounded-full with subtle border
Stats:        Clean stat cards (white bg, icon + number + label)
Heatmap:      GitHub-green style on white background
Activity:     Simple timeline with status badges
```

### Leaderboard
```
Layout:       Top 3 podium cards + clean table below
Podium:       White cards with rank medal icons (🥇🥈🥉)
Table:        Clean, zebra-striped or hover-highlight rows
Current user: Light primary bg highlight row
```

### Navbar
```
Position:     Sticky top, white bg, border-bottom
Logo:         Left — icon + "MiniCode" in dark text
Links:        Center — clean text links
Actions:      Right — notification icon + avatar + logout
Mobile:       Hamburger menu with slide-out drawer
```

---

## 7. 📝 Content & Tone Guidelines

### Language Shift

| Before (Dark/Hacker)            | After (Clean/Friendly)           |
|---------------------------------|----------------------------------|
| CONQUER THE MATRIX              | Explore Problems                 |
| Null Sector Reached             | No results found                 |
| Decrypt Access                  | Sign In                          |
| DEPLOY TASK                     | Create Problem                   |
| FILTER MATRIX                   | Filters                          |
| SCANNING ARENA FOR PATTERNS...  | Search problems...               |
| Execution History               | Activity                         |
| SOLVED_REPOS                    | Problems Solved                  |
| BURN_STREAK                     | Current Streak                   |
| Honor_Logs                      | Achievements                     |
| Cognitive_Velocity              | Performance Insights             |
| Neural_Mapping                  | Skill Breakdown                  |
| Faculty Authentication          | Staff Login                      |
| Identity Signature              | Username                         |
| Security Key                    | Password                         |
| Authorize GitHub                | Continue with GitHub             |

---

## 8. 🗂️ Implementation Checklist

- [ ] Update `globals.css` — Replace dark CSS variables with light palette
- [ ] Update `tailwind.config.js` — New color tokens
- [ ] Update `InteractiveBackground.tsx` — Remove or replace with clean subtle bg
- [ ] Update `LoginSymbolBackground.tsx` — Remove particle canvas
- [ ] Update `Navbar.tsx` — White bg, clean borders, simplified styling
- [ ] Update `ProblemCard.tsx` — White cards, light shadows, clean badges
- [ ] Update `login/page.tsx` — Clean centered auth card
- [ ] Update `problems/page.tsx` — Clean headers, friendly language
- [ ] Update `leaderboard/page.tsx` — White podium, clean table
- [ ] Update `StudentProfileView.tsx` — Light sidebar, clean stats
- [ ] Update `NewsPanel.tsx` — White slide-out, clean list
- [ ] Update `PageLoader.tsx` — Subtle primary-colored top bar
- [ ] Update `LoadingSpinner.tsx` — Simple spinner in primary color
- [ ] Update all page text — Replace hacker terms with friendly language
- [ ] Test all pages for consistency
- [ ] Test responsive (mobile/tablet) layouts

---

## 9. 🎯 Design References

| Platform     | What to take from it                          |
|--------------|-----------------------------------------------|
| **Notion**   | Clean white cards, subtle borders, typography  |
| **Linear**   | Minimal nav, keyboard-first, status badges     |
| **Vercel**   | Sleek dashboard, clean tables, subtle shadows  |
| **Raycast**  | Clean search UX, card interactions             |
| **GitHub**   | Contribution heatmap, clean profile layout     |

---

> **Last Updated:** April 7, 2026
> **Maintained by:** MiniCode Dev Team
> **Status:** 🚧 Redesign in Progress
