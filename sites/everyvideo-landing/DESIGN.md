---
name: EveryVideo / Cinema Library
description: Expanded cinematic product story with Vietnamese/English content, interactive demonstrations and purposeful scroll motion.
colors:
  canvas: "#080E14"
  surface: "#0D151D"
  raised: "#19232F"
  line: "#293643"
  ink: "#F6F8FB"
  muted: "#AFBDCC"
  accent: "#FF6255"
  on-accent: "#131A22"
  focus: "#FF968B"
typography:
  headline-display:
    {
      fontFamily: Manrope,
      fontSize: 104px,
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: -0.045em,
    }
  headline-lg:
    {
      fontFamily: Manrope,
      fontSize: 46px,
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: -0.035em,
    }
  headline-md:
    { fontFamily: Manrope, fontSize: 26px, fontWeight: 700, lineHeight: 1.3 }
  body-lg:
    { fontFamily: Manrope, fontSize: 21px, fontWeight: 400, lineHeight: 1.6 }
  body-md:
    { fontFamily: Manrope, fontSize: 16px, fontWeight: 400, lineHeight: 1.7 }
  body-sm:
    { fontFamily: Manrope, fontSize: 14px, fontWeight: 400, lineHeight: 1.6 }
  label:
    {
      fontFamily: Manrope,
      fontSize: 12px,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0.04em,
    }
rounded: { control: 6px, window: 12px, image: 2px }
spacing: { xs: 8px, sm: 16px, md: 24px, lg: 40px, xl: 64px }
components:
  button-primary:
    {
      backgroundColor: "{colors.accent}",
      textColor: "{colors.on-accent}",
      height: 54px,
      padding: 24px,
      rounded: "{rounded.control}",
    }
---

# EveryVideo / Cinema Library

## Overview

The original Cinema Library reference remains the brand foundation. The October 22 brief expands its content and motion: a cinematic hero and overlapping Studio lead into a guided workflow, media capabilities, an asymmetric control showcase, editorial use cases, format explorer, practical FAQ and a complete download invitation. Preserve the existing brand, application preview, release links, theme and language controls. Design variance 7/10, motion intensity 8/10, visual density 5/10. Motion is expressive around imagery and product state changes; reading surfaces stay calm.

## Colors

Graphite/blue-black surfaces and a coral interaction accent are consistent with the real product. White headings and cool muted body. Primary coral buttons use graphite text to meet contrast; coral text is limited to icons, accents and selected states with sufficient contrast. An optional light interface theme can be selected, but dark is the default reference view.

## Typography

Use self-hosted Manrope, including Vietnamese subsets, weights 400–800. Heavy sans-serif headings rather than the previous serif. Desktop hero has three deliberate lines; mobile scales down without clipping Vietnamese diacritics. Body 16px; small app-preview labels may be 12–14px. Avoid all-caps overload.

## Layout

1312px content grid inside a 1440px container, 64px desktop gutters and 20px phone gutters. Navigation starts over the photograph and becomes an opaque translucent surface on scroll. The hiker and warm sunset sit right; left is dark enough for text. The Studio overlaps the hero with a restrained shadow. Use distinct layout families: split workflow, three media columns, asymmetric control grid, staggered editorial images, tabbed format explorer, split FAQ and image-backed conversion band. Section rhythm is 85–108px desktop and 65–70px mobile. Phone layouts collapse to one column; tab controls remain keyboard accessible. No page overflow at 320px and wider.

## Elevation & Depth

Thin slate borders, low-frequency coral lighting and a soft window shadow give the Studio depth. Photographic overlays preserve text contrast. The sticky header has a solid-color transparency fallback; pointer spotlight is limited to the queue showcase. Keep illustrations calm while reading copy, with motion used for hierarchy, spatial continuity and interaction feedback.

## Shapes

6px controls, 12px app window, near-square feature images. Familiar outlined play brand mark. Icons from one Phosphor family.

## Components

Native accessible download/help dialogs, responsive nav, brand, buttons, image features and an interactive StudioPreview. Its Video/Audio/Subtitles/Thumbnail modes, quality radios, queue, advanced controls and settings respond locally. Always identify it as an illustrative interface preview. It does not claim to extract or download real media; real CTA links go to the existing Windows release. Do not invent transferred media, file sizes, progress or testimonial claims. Preview quality choices are examples, not guarantees of source availability.

## Source grounding

Reviewed README, architecture/constraints, actual `public/index.html`, `public/script.js`, backend media routes and the existing landing source. Real app flow: paste link, analyze available sources, choose preset/exact formats, download locally; includes queue, subtitles and thumbnails. Keep existing downloader application/API/DOM/i18n contracts unchanged. This work changes only the isolated React marketing app.

## Motion

Motion LazyMotion handles staggered headline entry, bounded hero parallax, page reading progress, section reveals and keyed demonstration panels. A workflow stepper and format explorer change on explicit input. CSS handles hover image zoom, control feedback and timeline transitions. Use MotionValues rather than React state for continuous scroll/pointer values. No perpetual marquee, background video or scroll hijacking. All motion honours prefers-reduced-motion, including parallax and pointer lighting. Image assets use WebP, responsive sources and reserved dimensions.

## Assets

Generate a new alpine-sunset hero and warm headphones photograph with the built-in image tool. Hero prompt: original cinematic photorealistic alpine lake at dusk, rugged mountains left, amber sunset and small lone hiker right, dark left half for typography, no text/UI/logos. Audio prompt: black studio headphones on dark wood, warm amber bokeh, cinematic editorial close-up, no text/logo/waveform. Reuse the hero's locally generated responsive variants for video/subtitle imagery. Audio waveform is a restrained code-native visual.

## Guardrails

User reference takes precedence over general skill aesthetic defaults. UI/UX Pro Max search did not supply a matching palette; follow the supplied image and established Graphite Signal colors. No fake reviews, customer counts, ratings, all-site coverage, 4K guarantees or working cloud extraction. Build, lint, browser checks and accessibility audits must pass; inspect desktop and mobile screenshots against the supplied reference.
