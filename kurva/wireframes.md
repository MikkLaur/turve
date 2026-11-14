# Kurva Nokitseb: layout notes and contrast

Layout is as in `build-spec.md` (wireframes there). Built 2026-11-14 with fallback fonts; QA screenshots at 1440 and 390 are in `shots/qa-*.png`
(scroll steps of one viewport) and `shots/qa-hero-timeline.png` (hero load, then reduced motion bottom right).

## Contrast (WCAG 2, computed)

| Pair | Ratio | Used for |
|---|---|---|
| ink on ground | 12.92 | all text, rule |
| muted on ground | 5.48 | secondary labels, service notes, area line, source line |
| ground on ink | 12.92 | button, skip link |
| muted on ground-2 | 4.39 | **never used** (nothing sits on ground-2 but a photo) |
| tape on ground | 2.88 | decoration only (28 x 6 px strip, no text) |

## Deviations and decisions

- Arrow token is `css/arrow.svg` (a `data:` URI would break `img-src 'self'`).
- html-validate (local) passes. Checked at 390, 768 and 1440, and at 390 with JavaScript off.
- Row layout at 48em+ uses CSS subgrid (story and the two small frames share the four columns of the row; the after frame spans both rows).
- Fonts are not in `site/fonts/` yet: the page falls back to the system serif and sans until the owner approves the download.
