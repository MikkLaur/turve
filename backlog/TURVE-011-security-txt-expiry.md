---
status: todo
area: cicd
created: 2026-11-08
---

# TURVE-011: Don't let security.txt expire

`security.txt` expires 6 months after each site build, so the site must be redeployed at least twice a year. Make that impossible to forget.

## Done when
- [ ] A reminder or check (e.g. the deploy preflight or the site's own check warns when `Expires` is under 30 days away).

## Log
- 2026-11-08: Created.
