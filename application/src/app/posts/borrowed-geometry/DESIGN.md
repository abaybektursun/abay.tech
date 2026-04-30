---
version: alpha
name: Borrowed Geometry · Specimen
description: |
  Minimal specimen-paper aesthetic. White background, ink for text,
  one accent (vermilion) used sparingly. Newsreader for display + captions,
  Geist for body, Geist Mono for numerals + eyebrows + data.
  Single 720px content column. No dark bands. No marginalia. No camera tricks.

colors:
  bg:       "#FFFFFF"
  surface:  "#F7F7F5"
  ink:      "#11161D"
  ink-2:    "#3A4150"
  ink-3:    "#8A8E97"
  rule:     "#E5E5E2"
  accent:   "#B7361C"

typography:
  display:
    fontFamily: var(--font-newsreader)
    fontSize: clamp(40px, 6vw, 64px)
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.018em
  h2:
    fontFamily: var(--font-newsreader)
    fontSize: clamp(26px, 3vw, 32px)
    fontWeight: 500
    lineHeight: 1.2
  deck:
    fontFamily: var(--font-newsreader)
    fontStyle: italic
    fontSize: clamp(18px, 1.6vw, 21px)
    lineHeight: 1.45
  body:
    fontFamily: var(--font-geist-sans)
    fontSize: 17px
    lineHeight: 1.7
  eyebrow:
    fontFamily: var(--font-geist-mono)
    fontSize: 11px
    letterSpacing: 0.18em
    textTransform: uppercase
  numeral:
    fontFamily: var(--font-geist-mono)
    fontSize: clamp(36px, 4.5vw, 56px)
    fontFeature: '"tnum" 1'
  data:
    fontFamily: var(--font-geist-mono)
    fontSize: 12px
    fontFeature: '"tnum" 1'

spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  '2xl': 64px
  '3xl': 96px

rounded:
  none: 0
  sm:   2px

elevation:
  flat: none
---

## Overview
Single 720px column. White paper. One vermilion accent.

## Colors
Vermilion is the only accent. Used for: (i) one stat per page section,
(ii) one chart highlight, (iii) one underline on a selected segmented control.
Never decorate. Never substitute another bright color.

## Typography
Three families: Newsreader (display, deck, captions), Geist (body, UI),
Geist Mono (eyebrows, numerals, data). Always tabular numerals.

## Layout
One centered 720px column. Charts and the 3D viewer may extend to 960px when
they need it. No asymmetric grid. No marginalia. Mobile padding: 24px.

## Components

### section-header
Eyebrow ("§ 03 · the numbers") above a serif h2. Optional italic subtitle.
No background, no card.

### stat-strip
Hairline-separated row of numeral cells. No boxes. One cell in vermilion.

### figure-block
A subtle 1px hairline frame on `surface` (#F7F7F5). Caption underneath in
serif italic preceded by a mono "figure n." label.

### segmented-control
Inline buttons separated by gap. Selected state: 1.5px vermilion underline.
No pill background.

### viewer (walker2d)
Internal canvas dark-charcoal (the 3D scene needs contrast); outer page
white. HUD minimal — score numeral top-right, episode picker as segmented
control, scrubber as 1px rail with vermilion thumb.
Static camera. Character pinned to origin (qpos[0] ignored).

## Do's and Don'ts

DO
- Hairlines, not containers.
- One accent. One serif. One sans. One mono.
- Numerals always tabular.
- Static layout. No camera follow.

DON'T
- Cream paper, dark bands, gradient hero.
- Multiple chart palettes. Locked: ink + ink-3 + accent.
- Tailwind zinc/slate.
- Camera tricks, parallax, dramatic transitions.
- Decorative composition diagrams, marginalia, pull-quote glyphs.
