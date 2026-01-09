# Design System Documentation

**Date:** 2024-12-19  
**Status:** Active  
**Version:** 1.0

---

## 🎨 Design Philosophy

Taper's design is built around three core principles:

1. **Calm and supportive** — Not clinical or judgmental
2. **Clear visual hierarchy** — Easy to scan and understand
3. **Accessible contrast ratios** — Readable for everyone

---

## 🌈 Color System

### Core Colors

- **Background:** `#0F172A` — Deep calm background (used for gradient headers)
- **Surface:** `#FFFFFF` — White surface for content areas
- **Text Primary:** `#0F172A` — Primary text color (dark)
- **Text Secondary:** `#475569` — Secondary text color (medium gray)

### Gradient Accent Colors

The app uses a vertical gradient for headers and prominent elements:

- **Accent Start:** `#0EA5A4` — Teal
- **Accent Mid:** `#34D399` — Green  
- **Accent End:** `#6EE7B7` — Mint

**Gradient Direction:** Vertical (top to bottom)

### Legacy Colors (Backward Compatibility)

- **Neutral:** Gray scale (50-950)
- **Accent:** Primary teal variants
- **Semantic:** Success, warning, info, error colors

---

## 📐 Spacing Scale

Consistent spacing tokens for padding, margins, and gaps:

```typescript
xs: 4px   // Tight spacing
sm: 8px   // Small spacing
md: 16px  // Medium spacing (default)
lg: 24px  // Large spacing
xl: 32px  // Extra large spacing
xxl: 48px // Maximum spacing
```

---

## ✍️ Typography

### Scale

- **Title:** 28px / 36px line height / Bold (700)
- **Body:** 16px / 24px line height / Regular (400)
- **Caption:** 14px / 20px line height / Regular (400)

### Principles

- All text supports `allowFontScaling: true` for accessibility
- Clear hierarchy through size and weight
- Sufficient line height for readability

---

## 🎭 Gradient Usage

### When to Use Gradients

✅ **DO:**
- Use in header areas only
- Use for prominent visual elements
- Use primary gradient for main headers
- Use subtle gradient for gentle backgrounds

❌ **DON'T:**
- Use gradients on entire screens
- Use gradients in content areas
- Overuse gradients (keep it minimal)

### Gradient Variants

1. **Primary Gradient** (`variant="primary"`)
   - Strong accent gradient: `accentStart → accentMid → accentEnd`
   - Used for main screen headers
   - Vertical direction

2. **Subtle Gradient** (`variant="subtle"`)
   - Low-contrast fade with opacity
   - Gentle background effect
   - 20% → 10% → 5% opacity

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

**Gradient Variant:**
- Gradient header at top (with title)
- White content area below
- Cards with elevation for content

**Plain Variant:**
- White background throughout
- Simple title at top
- Content flows naturally

### Cards

- **Elevated:** White card with shadow
- **Flat:** Light gray background
- **Outlined:** White card with border

### Buttons

- **Primary:** Teal background, white text
- **Secondary:** Transparent with teal border
- **Ghost:** Transparent, teal text

---

## 📱 Visual Hierarchy

1. **Headers:** Gradient background with white text
2. **Primary Content:** Large, bold numbers/values
3. **Secondary Content:** Body text in secondary color
4. **Actions:** Prominent buttons with clear labels

---

## ♿ Accessibility

- All text supports font scaling
- High contrast ratios (WCAG AA compliant)
- Clear touch targets (minimum 48px)
- Semantic HTML/React Native components
- Accessibility labels and hints

---

## 🔧 Implementation

All design tokens are defined in `lib/theme.ts`:

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme';
```

### Usage Examples

```typescript
// Colors
backgroundColor: colors.surface
color: colors.textPrimary

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

1. **Gradients:** Use sparingly, only in headers
2. **Surfaces:** Flat white for content areas
3. **Colors:** Calm teal/green gradient for accents
4. **Typography:** Clear hierarchy, accessible scaling
5. **Spacing:** Consistent scale throughout
6. **Accessibility:** Built-in from the start

---

*Last updated: 2024-12-19*
