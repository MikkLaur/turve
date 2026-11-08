---
status: todo
area: content
created: 2026-11-08
---

# TURVE-002: Fill in the content the build still lists as TODO

The site build with `--strict` refuses while content TODOs remain; until then a deploy needs `ALLOW_CONTENT_TODO='true'`.

## Done when
- [ ] `COMPANY` and `PERSON` in `site/src/config.ts`.
- [x] Bio in `about.personBio` (et + en).
- [x] Portrait photo in `site/assets/img/`.
- [ ] Every page's copy and the privacy policy reviewed.
- [ ] Final rates and packages confirmed in the catalog.
- [ ] `cd site && npm run build` prints no content TODOs.

## Log
- 2026-11-08: Created.
- 2026-11-08: Bio and photo done (TURVE-012).
