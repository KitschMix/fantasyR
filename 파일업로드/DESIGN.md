---
name: Premium Gaming Vault
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#d0cdcd'
  on-tertiary: '#303030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454544'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  card-padding: 16px
---

## Brand & Style

The design system establishes a high-fidelity, immersive experience tailored for serious board game collectors. It prioritizes a "digital shelf" aesthetic that feels more like a luxury showroom than a utility app. 

The visual style is **Corporate / Modern** with a cinematic lean, utilizing depth and lighting to elevate game box art and logos. The mood is sophisticated and focused, using a dark environment to minimize UI distraction and maximize the emotional impact of the game collection.

- **Atmosphere:** Dark, premium, and focused.
- **Visual Weight:** Heavy on imagery, light on decorative UI lines.
- **Motion:** Transitions should feel fluid and weighted, mimicking physical interactions with a high-end collection.

## Colors

The palette is anchored in a deep, near-black charcoal to provide infinite depth. Interactive elements use a "Trophy Gold" for a sense of achievement and prestige, while a vibrant "Electric Blue" is used for secondary actions and system feedback.

- **Background:** Primary background is `#121212`. Use `#1E1E1E` for elevated card surfaces to create tonal separation.
- **Accents:** Gold (`#D4AF37`) is reserved for primary buttons, ratings, and "Premium" features. Blue (`#3B82F6`) is used for utility interactions like filters and multi-select.
- **Gradients:** Subtle radial gradients (Top-Left to Bottom-Right) should be applied to backgrounds to mimic soft spotlighting, using a transition from `#1A1A1A` to `#121212`.

## Typography

The typography strategy balances high-impact branding with extreme legibility. **Montserrat** provides a geometric, modern authority for headings, while **Inter** ensures that dense game data (player counts, duration, complex rules) remains readable at small sizes.

- **Headings:** Use bold weights and slight negative letter-spacing to create a "locked-in" professional look.
- **Labels:** Small labels use uppercase with increased letter-spacing to denote categories or metadata without competing with headlines.
- **Optical Sizing:** On mobile, ensure headlines scale down to prevent awkward wrapping, maintaining a minimum side margin of 20px.

## Layout & Spacing

This design system uses a **Fluid Grid** model optimized for handheld devices. The primary layout for the game library is a 2-column responsive grid on mobile, expanding to 3 or 4 columns on larger tablets.

- **Rhythm:** A strict 8px base unit controls all spatial relationships.
- **Margins:** 20px outer margins provide "breathing room" against the device edge, reinforcing the premium feel.
- **Density:** Use generous whitespace between categories (e.g., "Recently Played" vs "Wishlist") to prevent the dark UI from feeling cramped.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. Surfaces closer to the user are lighter in color and cast softer, larger shadows.

- **Surface 0:** `#121212` (Main background)
- **Surface 1:** `#1E1E1E` (Cards, Bottom Sheets)
- **Surface 2:** `#2A2A2A` (Hover states, active buttons)
- **Shadows:** Use a "Long Soft" shadow for cards: `0px 12px 32px rgba(0, 0, 0, 0.5)`. This creates a sense that the game boxes are physically resting on a surface.
- **Outer Glow:** Active elements (like the currently selected game) may feature a subtle outer glow using the primary gold color at 10% opacity.

## Shapes

The shape language is defined by large, "2xl" corners to soften the tech-heavy dark mode and make the UI feel approachable.

- **Cards:** Use `rounded-xl` (1.5rem / 24px) for all game collection cards.
- **Buttons:** Use `rounded-lg` (1rem / 16px) for a modern, slightly squat appearance.
- **Inputs:** Use `rounded-md` (0.5rem / 8px) to maintain a professional, structured feel for data entry.

## Components

### Cards
Cards are the hero of the system. Each game card must feature a high-fidelity image or logo. Use a subtle bottom-to-top dark gradient overlay on cards to ensure white metadata text remains readable against colorful game art.

### Buttons
- **Primary:** Gold background with black text. No border.
- **Secondary:** Transparent background with a 1px Blue or White border.
- **Ghost:** No background or border, used for tertiary actions like "Cancel" or "Back".

### Chips & Tags
Used for game genres (e.g., "Strategy", "Deck Building"). These should be low-contrast (Background: `#2A2A2A`, Text: `#FFFFFF`) to avoid distracting from the game logos.

### Input Fields
Inputs should be dark with a subtle 1px border (`#333333`). On focus, the border transitions to the primary Blue or Gold.

### Navigation
The Bottom Navigation bar uses a background-blur (Glassmorphism) with 90% opacity of `#121212` to allow the content to peek through as the user scrolls. Icons use a "thin" stroke weight for a refined, premium look.