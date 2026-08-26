---
version: 2.0.0
name: Graphite Signal
description: Dark-first professional media workstation with calm graphite surfaces and a single signal-coral interaction accent.
colors:
  primary: "#FF6B61"
  primary-hover: "#FF8178"
  primary-pressed: "#E9564E"
  focus: "#FF9A92"
  canvas-dark: "#0A0E15"
  surface-dark: "#101620"
  surface-elevated-dark: "#161E2A"
  surface-muted-dark: "#0D131C"
  border-dark: "#273140"
  border-strong-dark: "#394658"
  text-primary-dark: "#F5F7FA"
  text-secondary-dark: "#A8B1BE"
  text-muted-dark: "#748093"
  canvas-light: "#F2F4F7"
  surface-light: "#FFFFFF"
  surface-elevated-light: "#E9EDF2"
  surface-muted-light: "#F7F8FA"
  border-light: "#CCD3DC"
  border-strong-light: "#AAB4C0"
  text-primary-light: "#171C24"
  text-secondary-light: "#475262"
  text-muted-light: "#677386"
  success: "#32B878"
  warning: "#E5A13A"
  error: "#E05A62"
  info: "#5B8DEF"
typography:
  headline-display: { fontFamily: "Segoe UI Variable Display", fontSize: 28px, fontWeight: 650, lineHeight: 1.15, letterSpacing: -0.025em }
  headline-lg: { fontFamily: "Segoe UI Variable Display", fontSize: 22px, fontWeight: 650, lineHeight: 1.2, letterSpacing: -0.02em }
  headline-md: { fontFamily: "Segoe UI Variable Display", fontSize: 18px, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.015em }
  body-lg: { fontFamily: "Segoe UI Variable Text", fontSize: 15px, fontWeight: 450, lineHeight: 1.5 }
  body-md: { fontFamily: "Segoe UI Variable Text", fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  body-sm: { fontFamily: "Segoe UI Variable Text", fontSize: 12px, fontWeight: 400, lineHeight: 1.45 }
  label-lg: { fontFamily: "Segoe UI Variable Text", fontSize: 14px, fontWeight: 600, lineHeight: 1.3 }
  label-md: { fontFamily: "Segoe UI Variable Text", fontSize: 12px, fontWeight: 600, lineHeight: 1.3 }
  label-sm: { fontFamily: "Segoe UI Variable Text", fontSize: 11px, fontWeight: 600, lineHeight: 1.25, letterSpacing: 0.04em }
  data-md: { fontFamily: "Cascadia Mono", fontSize: 13px, fontWeight: 500, lineHeight: 1.4, fontFeature: "tnum" }
rounded:
  none: 0px
  sm: 6px
  md: 9px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#11141A"
    rounded: "{rounded.md}"
    height: 44px
    padding: 16px
  input:
    backgroundColor: "{colors.surface-muted-dark}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.md}"
    height: 42px
    padding: 12px
  card:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.lg}"
    padding: 16px
  tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "#11141A"
    rounded: "{rounded.md}"
    height: 40px
---

# EveryVideo — Graphite Signal

## Overview

Graphite Signal is a desktop-first media workstation: quiet surfaces, compact controls, precise data, and one unmistakable coral signal for the current selection or primary action. It borrows the colorimetric depth discipline of dark creative tools and the low-noise hierarchy of modern productivity software without copying either.

The product name shown in the interface is **EveryVideo**. Do not display “Powered by yt-dlp” or other engine attribution in the application chrome. The underlying engine and all behavior remain unchanged.

## Colors

- Graphite surfaces form one cool-neutral family. Do not mix warm gray or pure black into the application canvas.
- `primary` is the only decorative and interactive accent. Use it for Analyze, Download, selected tabs, selection controls, and focus emphasis.
- `success`, `warning`, `error`, and `info` are semantic only. Never use them as decorative accents or section colors.
- Dark is the default theme. Light mode maps the same hierarchy to cool white and mineral-gray surfaces without changing the coral interaction signal.
- All text and controls must meet WCAG AA contrast.

## Typography

- Use locally available `Segoe UI Variable` on Windows with system-ui fallbacks; no remote font dependency.
- Use `Cascadia Mono` or the system monospace fallback for format IDs, codecs, FPS, sizes, progress, ETA, and command flags.
- Use no more than four practical weights: 400, 450/500, 600, and 650.
- Apply tabular figures to numeric columns and progress metrics.
- Use sentence case for headings and buttons. Technical tokens keep their canonical casing.

## Layout

- Desktop: compact global command bar, four-tab navigation, then a two-column Studio workspace with a 360–410px inspector and flexible explorer.
- The format explorer is the dominant surface. The download action remains visible at the bottom of the active workspace.
- At widths below 1150px, the inspector stacks above the explorer. At 768px and below, controls flow vertically and the tab bar becomes four equal compact destinations.
- Mobile only needs complete usability, not desktop-equivalent density. Tables may scroll inside their own bounded container; the page itself must never overflow horizontally.
- Desktop gutters are 20–24px; mobile gutters are 12–16px. Main content max width is 1720px.

## Elevation & Depth

- Communicate depth primarily with surface shifts and 1px borders.
- Use no generic black drop shadows on content cards.
- Overlays and sticky command surfaces may use one soft, tinted shadow plus backdrop blur.
- Glow is restricted to a faint primary-action focus or active indication; never decorate the whole interface with glow.

## Shapes

- Cards and major containers use 12px radius.
- Inputs and standard buttons use 9px radius.
- Compact chips and inner controls use 6px radius.
- Pills are reserved for status or filters whose content length varies; do not make every button pill-shaped.

## Components

- **Command bar:** brand at left, URL field as the dominant input, Analyze as the sole primary action, utilities at right.
- **Tabs:** clear selected state with coral signal and text/icon contrast; minimum 44px touch target.
- **Inspector:** video preview and grouped download options; reduce nested card borders by using dividers and tonal sections.
- **Format explorer:** dense but readable table, mono numeric fields, sticky header, strong selected row, bounded horizontal scrolling where necessary.
- **Download dock:** one primary Download action, current format summary, estimated size, and status. It must never obscure focused content.
- **Feedback:** skeleton for analysis loading, composed empty state, contextual error, polite toast announcements, and visible pressed/focus states.

## Do's and Don'ts

- Do keep all existing DOM IDs, data attributes, API contracts, and i18n hooks unless a compatibility mapping and regression test are added.
- Do preserve dark/light themes and all current application functions.
- Do use one icon family and a single optical stroke weight.
- Do provide `:focus-visible`, `prefers-reduced-motion`, 44px targets, skip navigation, and semantic headings.
- Don't use purple gradients, multi-color decorative badges, glassmorphism on every surface, or nested card borders.
- Don't use emoji as section-heading decoration or control icons.
- Don't display engine attribution in the application UI.
- Don't migrate frameworks or introduce runtime dependencies solely for styling.
