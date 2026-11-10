---
name: Serene Hearth
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#40484a'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#70787b'
  outline-variant: '#bfc8ca'
  surface-tint: '#2c6672'
  primary: '#00424d'
  on-primary: '#ffffff'
  primary-container: '#1e5a66'
  on-primary-container: '#98cfdd'
  inverse-primary: '#98cfdd'
  secondary: '#526162'
  on-secondary: '#ffffff'
  secondary-container: '#d5e6e7'
  on-secondary-container: '#576768'
  tertiary: '#46392d'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e5043'
  on-tertiary-container: '#d6c3b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b3ecfa'
  primary-fixed-dim: '#98cfdd'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#0b4e5a'
  secondary-fixed: '#d5e6e7'
  secondary-fixed-dim: '#b9cacb'
  on-secondary-fixed: '#0f1e1f'
  on-secondary-fixed-variant: '#3a494b'
  tertiary-fixed: '#f3dfcd'
  tertiary-fixed-dim: '#d6c3b2'
  on-tertiary-fixed: '#241a0f'
  on-tertiary-fixed-variant: '#514437'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  headline-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 17px
    fontWeight: '700'
    lineHeight: 24px
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 1rem
  margin: 1.25rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system delivers a calm, dignified, and warm companion interface tailored for individuals managing multiple sclerosis (MS) and their caregivers across Latin America. Moving deliberately away from cold, sterile clinical dashboards, the visual aesthetic draws inspiration from mindful wellness applications. The interface emphasizes emotional safety, effortless clarity, and restorative tranquility.

Visual hallmarks include:
- **Low Cognitive Load**: Uncluttered canvases, generous breathing room, and clear information scent to accommodate cognitive fatigue and visual fluctuation.
- **Warm Paper Aesthetics**: Gentle, organic tactile foundations that prevent eye strain while fostering an approachable, human atmosphere.
- **Tactile Dignity**: Generous touch accommodations (minimum 48dp, 56dp for primary actions) combined with soothing pill forms that feel welcoming and reassuring under trembling or fatigued motor control.
- **Sentence Case Primacy**: Conversational, non-bureaucratic typography that speaks naturally and empathetically.

## Colors

The palette grounds the application in warmth, comfort, and clinical reassurance without sterility.

- **Primary (`#1E5A66`)**: Deep forest teal representing clinical integrity, focus, and quiet strength. Used for high-priority interactive states and critical actions, paired strictly with pure white text (`#FFFFFF`) to ensure AAA legibility.
- **Secondary (`#DCEDEE`)**: Gentle aquatic mist. Deployed for active date anchors, selected interactive chips, and softly highlighted interactive states, paired with deep teal ink (`#123C44`).
- **Tertiary (`#F6E2D0`)**: Warm peach-linen container tint, providing supportive warmth for symptom check-ins, mindful reflections, or caregiver notes, paired with rich earthy brown text (`#5A3416`).
- **Neutral Canvas (`#FAF7F2`)**: Warm paper foundation that softens harsh device backlights.
- **Surfaces**: Pure crisp white (`#FFFFFF`) for elevated cards, complemented by recessed cream rows (`#F1ECE3`) for nested or secondary grouping.
- **Typography Inks**: High-contrast slate charcoal (`#22252B`) for primary content, tempered by muted warm slate (`#585E6B`) for supportive metadata.
- **Semantic Success (`#2F6B4F`)**: Muted pine green communicating completion, adherence, and calm verification.

## Typography

The design system implements Atkinson Hyperlegible Next across all textual roles. Designed specifically for low-vision distinction, its unambiguous letterforms protect patients encountering optic neuritis, visual fatigue, or motor shake.

Usage principles:
- **Sentence Case Exclusivity**: Never employ all-caps or small-caps styling, even in buttons or badges. Sentence case ensures smooth ocular tracking and a gentle, conversational tone.
- **Hierarchy Mapping**:
  - `headline-lg` (28px bold): Top-level screen destinations and daily greeting banners.
  - `headline-sm` (20px bold): Module grouping, journal sections, and card headers.
  - `body-md` (17px regular): Primary reading layer, diary entries, and guidance text.
  - `label-md` (15px bold): Interactive buttons, selectable chips, and form identifiers.
- **Comfortable Line Heights**: Line heights are expanded generously (1.4x to 1.5x) to maintain clear line separation during continuous reading.

## Layout & Spacing

Layouts prioritize spacious, uncluttered layouts optimized for handheld mobile navigation:
- **Spatial Grid**: A single-column fluid mobile flow with an 8pt baseline rhythm, using 20px (`1.25rem`) outer screen margins to keep interactive controls safely away from physical screen edges.
- **Physical Touch Buffers**: Interactive zones enforce a mandatory minimum bounding box of 48×48dp, even when interior icons or labels are visually smaller.
- **Pacing**: Generous vertical margins (`space-xl` / 36px) separate logical tasks, preventing sensory overload and allowing users with tremors to pause without accidentally triggering neighboring targets.

## Elevation & Depth

Visual hierarchy rejects clinical outlines, cold grey borders, and high-contrast structural dividers in favor of soft, natural ambient illumination:

- **Warm Ambient Shadow**: Surface depth relies on warm-tinted diffused shadows (`rgba(72, 54, 38, 0.06)` blur 16px, y-offset 4px) simulating soft morning light over thick paper.
- **Tonal Stepping**: Inset elements, background segments, and secondary item lists rest on recessed warm fills (`#F1ECE3`) without hairline dividers.
- **Zero Stark Borders**: Elements do not use gray stroke boundaries (`#E0E0E0` or `#CCCCCC`). Subtle perimeter definition is achieved exclusively through a 1px border using `#EBE4D8` at 60% opacity where edge separation against paper backgrounds is required.

## Shapes

The shape system employs soft, organic contours that evoke wellness and safety:

- **Pill Philosophy**: Buttons, status badges, selectable day chips, and input fields utilize full pill geometry (`border-radius: 9999px`). The pill shape communicates comfort, softness, and tactile friendliness.
- **Card Enclosures**: Standard information containers, medication reminder tiles, and wellness cards use a consistent 16px corner radius (`rounded-lg`), blending structural stability with soft visual edges.
- **Recessed Insets**: Nested list items and inner interactive tiles use a 12px corner radius (`rounded-md`) to sit comfortably within parent card modules.

## Components

### Buttons
- **Primary Action**: 56dp height, full pill radius, filled with primary deep teal (`#1E5A66`), crisp white text (`#FFFFFF`, 17px bold), and centered icon support (Material Symbols Rounded, 24dp).
- **Secondary Action**: 48dp height, pill shape, filled with secondary soft teal (`#DCEDEE`), dark teal text (`#123C44`, 15px bold).
- **Warm Prompt Button**: 48dp height, pill shape, filled with warm highlight tint (`#F6E2D0`), rich brown text (`#5A3416`, 15px bold).

### Chips & Daily Calendar Trackers
- **Default State**: Background `#FFFFFF`, border 1px solid `#EBE4D8`, label `#585E6B`.
- **Selected / Today State**: Background `#DCEDEE`, border transparent, label `#123C44` (bold), accompanying dot indicator in `#1E5A66`.
- **Dimensions**: Minimum touch target of 48×48dp, pill radius, padding 10px 18px.

### Cards
- **Standard Card**: Crisp white background (`#FFFFFF`), 16px corner radius, warm diffused shadow, 20px internal padding.
- **Highlight / Wellness Insight Card**: Background `#F6E2D0`, corner radius 16px, text `#5A3416`, paired with warm amber accent icons.
- **Recessed Group Card**: Background `#F1ECE3`, corner radius 16px, padding 16px, housing grouped secondary lists.

### Lists & Activity Rows
- **Row Architecture**: 56dp minimum row height, alternating or encapsulated within white cards. Secondary rows utilize `#F1ECE3`.
- **Dividers**: Never use 1px gray lines. Separate items through 8px spatial gaps or soft background switches.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes**: 28×28dp touchable container within a 48×48dp target, 8px rounded corners. Unchecked: `#FFFFFF` with `#D5CDC0` border. Checked: `#2F6B4F` with white check mark.
- **Radio Buttons**: 28×28dp concentric circular pill. Active state utilizes deep teal `#1E5A66` with a white inner dot.

### Input Fields
- **Container**: 56dp height, pill rounded borders, filled with `#FFFFFF`, border 1.5px solid `#EBE4D8`.
- **Focus State**: Border 2px solid `#1E5A66`, glow shadow `0 0 0 3px rgba(30, 90, 102, 0.12)`.
- **Text & Placeholder**: Text primary `#22252B`, placeholder text `#585E6B`.

### Symptom Slider / Energy Scale (Domain Specific)
- **Track**: 12dp height, fully rounded pill track with `#F1ECE3` base and `#1E5A66` active fill.
- **Thumb**: 36×36dp pure white disc with a subtle warm drop shadow and 48×48dp touch buffer, designed for tremor-tolerant thumb sliding.