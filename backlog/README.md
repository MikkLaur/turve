# Backlog

Tickets for everything turve.ee: development, CI/CD and tooling, infrastructure, content, marketing and business tasks.

## Tickets
- One Markdown file per ticket: `TURVE-NNN-short-recap.md`. `NNN` is always three digits (`001`, `002`, …); the recap is a few lowercase words joined by hyphens.
- The next number is the highest existing one + 1. Never reuse or renumber a ticket, even a dropped one.
- When a ticket is `done` or `dropped`, move it to `archive/` (`git mv`). Refer to tickets by number (`TURVE-012`), not by path, so references survive the move.

## Template

```markdown
---
status: todo        # todo | doing | blocked | done | dropped
area: site          # site | api | admin | infra | cicd | tooling | content | marketing | business
created: 2026-11-08
due:                # optional, YYYY-MM-DD
blocked-by:         # optional, e.g. TURVE-006
---

# TURVE-NNN: Title

Why this matters, in a sentence or two.

## Done when
- [ ] A checkable outcome.

## Log
- 2026-11-08: Created.
```

Add a dated line to **Log** whenever something happens (started, decided, blocked, shipped). Dates are absolute.

## Finding things

```sh
grep -l 'status: doing' backlog/TURVE-*.md                   # in progress
grep -L 'status: \(done\|dropped\)' backlog/TURVE-*.md       # open
grep -H '^due: 20' backlog/TURVE-*.md | sort -t: -k3          # by due date
grep -l 'area: marketing' backlog/TURVE-*.md                 # by area
ls backlog/archive/                                          # done and dropped
```

The next number counts archived tickets too: `ls backlog/TURVE-*.md backlog/archive/TURVE-*.md | xargs -n1 basename | sort | tail -1`.
