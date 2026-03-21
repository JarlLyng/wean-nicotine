# Design System Documentation

**Date:** 2026-03-21
**Status:** Active
**Version:** 1.2 (IAMJARL Design System v0.1.3)

Purpose:
- Summarize the app's design system and usage patterns

Audience:
- Maintainers and LLMs working on app UI

Source of truth:
- `lib/design.ts` (IAMJARL tokens) and `lib/theme.ts` (re-exports)
- Do not rely on this doc for exact pixel values; use the code

Related files:
- [`AI_CONTEXT.md`](./AI_CONTEXT.md)
- [`lib/design.ts`](../lib/design.ts)
- [`lib/theme.ts`](../lib/theme.ts)
- [`components/Screen.tsx`](../components/Screen.tsx)
- [`components/ui/Card.tsx`](../components/ui/Card.tsx)
- [`components/ui/Button.tsx`](../components/ui/Button.tsx)

Update when:
- Tokens change
- Component usage patterns change
- Design principles change

---

## Design Philosophy

Taper's design is built around three core principles:

1. **Calm and supportive** — Not clinical or judgmental
2. **Clear visual hierarchy** — Easy to scan and understand
3. **Non-judgmental tone** — Never frame slips as failure (Gentler Streak pattern)

---

## Color System

Design tokens live in `lib/design.ts` and are consumed via `useDesignTokens()`.

### Mode Colors

| Token | Light | Dark |
|-------|-------|------|
| `primary` | `#CE63FF` (neon purple) | `#D0FF00` (neon lime) |
| `onPrimary` | `#000000` | `#000000` |
| `background.app` | `#FFFFFF` | `#000000` |
| `background.card` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.05)` |
| `text.primary` | `#000000` | `#FFFFFF` |
| `text.secondary` | `rgba(0,0,0,0.70)` | `rgba(255,255,255,0.75)` |

### Shared Semantic Colors

| Token | Value |
|-------|-------|
| `success` | `#4CAF50` |
| `warning` | `#FF6B35` |
| `error` | `#FF3B30` |

**Rules:**
- Never use primary color for destructive actions
- Never hardcode hex in UI code — use tokens
- Always support light + dark mode

---

## Spacing Scale

Values from `designTokens.spacing`:

```
xs: 4   sm: 8   md: 12   lg: 16   xl: 20   xxl: 24   xxxl: 32
```

---

## Typography

Scale from `designTokens.typography`. `lib/theme.ts` maps them to React Native (e.g. `typography.title`, `typography.body`).

### Sizes

```
xs: 12   sm: 14   base: 16   lg: 18   xl: 24   xxl: 36
```

### Weights

```
regular: 400   semibold: 600   bold: 700
```

### Principles

- All text supports `allowFontScaling: true` for accessibility
- Clear hierarchy through size and weight
- Sufficient line height for readability

---

## Border Radius

```
sm: 8   md: 12   lg: 16
```

**Rules:**
- Primary buttons: `radius.md` (12px)
- Cards: `borderRadius.lg` (16px)
- Pill/chip shapes: `borderRadius.full` (9999)

---

## Navigation

The app uses **native iOS navigation** exclusively:

- **Tab bar**: Native iOS tab bar with SF Symbols (via `IconSymbol` component)
- **Headers**: Native Expo Router Stack/Tabs headers
- **Large Title**: Tools and Settings index screens use `headerLargeTitle: true`
- **Screen component**: Content wrapper only (no title rendering, no SafeAreaView)

---

## Component Patterns

### Screen Layout

- Use `Screen` as wrapper (background color + horizontal padding)
- Screen does NOT render titles or safe areas — native headers handle that
- Use `Card` for grouped content

### Cards

- **Elevated:** Card background with shadow (primary content cards)
- **Flat:** Card background without shadow (less prominent)
- **Outlined:** Card background with border

### Buttons

- **Primary:** `colors.primary` background, `colors.onPrimary` text, `radius.md`
- **Secondary:** `background.card` background, `border.default` border
- **Ghost:** Transparent, primary text
- All buttons have haptic feedback on iOS

### Icons

- Library: Phosphor Icons (`phosphor-react-native`)
- Default weight: `regular`
- Tabs use SF Symbols via `IconSymbol`
- Available in Icon component: house, chart-line-up, heart, gear, wind, waves, brain, check-circle, x-circle, arrow-left, arrow-right, plus, minus, trash, bell, bell-slash, arrow-clockwise, calendar, currency-dollar, coins, medal, trophy, lightning, star

---

## Accessibility

- All text supports font scaling
- WCAG AA contrast ratios
- Clear touch targets (minimum 44px)
- Semantic accessibility roles and labels
- Haptic feedback on interactive elements (iOS)

---

## Implementation

```typescript
// Design tokens (source of truth)
import { useDesignTokens, typography, spacing, radius } from '@/lib/design';

// Theme helpers (backward-compatible re-exports)
import { spacing, typography, borderRadius, shadows } from '@/lib/theme';

// Colors via hook (automatic light/dark)
const { colors } = useDesignTokens();
```

---

*Last updated: 2026-03-21*
