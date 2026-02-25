# Design System Documentation

**Date:** 2026-01-21  
**Status:** Active  
**Version:** 1.1

**Source of truth:** `lib/design.ts` (IAMJARL tokens) and `lib/theme.ts` (re-exports). Do not rely on this doc for exact pixel values – use the code.

---

## 🎨 Design Philosophy

Taper's design is built around three core principles:

1. **Calm and supportive** — Not clinical or judgmental
2. **Clear visual hierarchy** — Easy to scan and understand
3. **Accessible contrast ratios** — Readable for everyone

---

## 🌈 Color System

Design tokens live in `lib/design.ts` / `lib/theme.ts` and are consumed via `useDesignTokens()`.

Praktisk regel:
- **Background**: app-level background (calm, low contrast)
- **Surface/Card**: cards og “content surfaces”
- **Text**: primary/secondary/tertiary
- **Semantic**: success/warning/error

> Undgå hard-coded hex i UI-kode – brug tokens, så light/dark mode holder.

---

## 📐 Spacing Scale

Values come from `lib/design.ts` → `designTokens.spacing`:

```typescript
xs: 4   sm: 8   md: 12   lg: 16   xl: 20   xxl: 24   xxxl: 32
```

---

## ✍️ Typography

Scale and line heights come from `lib/design.ts` → `designTokens.typography`. `lib/theme.ts` maps them to React Native (e.g. `typography.title`, `typography.body`, `typography.caption`).

### Principles

- All text supports `allowFontScaling: true` for accessibility
- Clear hierarchy through size and weight
- Sufficient line height for readability

---

## 🎭 Backgrounds (Plain vs Gradient)

`Screen` kan rendere plain eller (subtil) gradient background via `GradientBackground`.
Brug gradient sparsomt – det skal føles roligt, ikke “larmende”.

---

## 🎴 Surface Usage

### Flat Surfaces

- **Cards:** White (`surface`) with elevation shadows
- **Content Areas:** White or light neutral backgrounds
- **Text Backgrounds:** Always high contrast

### Why Flat Surfaces?

- Better readability
- Calmer visual feel
- Easier to scan content
- Maintains focus on content, not decoration

---

## 🎯 Component Patterns

### Screen Layout

**All Screens:**
- Brug `Screen` som wrapper (safe areas + title)
- Undgå dobbelt padding (Screen giver allerede horizontal padding)
- Brug `Card` til grupperet indhold og rolig hierarchy

**Screen Variants:**
- **Plain**: default
- **Gradient**: kun hvor det giver en rolig “hero” effekt

### Cards

- **Elevated:** White card with shadow
- **Flat:** Light gray background
- **Outlined:** White card with border

### Buttons

- **Primary:** Primary token background (`colors.primary`), contrasting text (`colors.onPrimary`)
- **Secondary:** Transparent with primary border
- **Ghost:** Transparent, primary text

---

## 📱 Visual Hierarchy

1. **Background:** Subtle gradient provides calming base
2. **Primary Content:** Large, bold numbers/values on white cards
3. **Secondary Content:** Body text in secondary color
4. **Actions:** Prominent buttons with clear labels, positioned at bottom

---

## ♿ Accessibility

- All text supports font scaling
- High contrast ratios (WCAG AA compliant)
- Clear touch targets (minimum 48px)
- Semantic HTML/React Native components
- Accessibility labels and hints

---

## 🔧 Implementation

Tokens + helpers:

```typescript
import { spacing, typography, borderRadius, shadows } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
```

### Usage Examples

```typescript
// Colors (via hook)
const { colors } = useDesignTokens();
backgroundColor: colors.background.card
color: colors.text.primary

// Spacing
padding: spacing.md
marginTop: spacing.lg

// Typography
...typography.title
...typography.body

// Shadows
...shadows.md

// Border Radius
borderRadius: borderRadius.lg
```

---

## 📚 Related Files

- `lib/theme.ts` — All design tokens
- `components/Screen.tsx` — Screen wrapper with gradient support
- `components/GradientBackground.tsx` — Gradient component
- `components/ui/Card.tsx` — Card component
- `components/ui/Button.tsx` — Button component

---

## 🎨 Design Principles Summary

1. **Gradients:** Subtle background where used; primary token for accents
2. **Surfaces:** Flat cards (tokens: `background.card`, `surface.default`)
3. **Colors:** IAMJARL tokens (light: green primary; dark: lime); see `lib/design.ts`
4. **Typography:** Clear hierarchy, accessible scaling
5. **Spacing:** Consistent scale throughout
6. **Accessibility:** Built-in from the start

---

*Last updated: 2026-01-21*
